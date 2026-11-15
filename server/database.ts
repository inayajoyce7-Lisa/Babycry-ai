import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AcousticFeatures,
  BabyProfile,
  CryAnalysisRecord,
  CryCategory,
  FeedingType,
  Language,
  ParentFeedback,
  PrivacySettings,
  RetentionDays,
} from '../src/types/babycry.ts';
import { computeExpirationIso } from '../src/utils/babyDomain.ts';
import {
  decryptBuffer,
  decryptText,
  ENCRYPTION_DESCRIPTION,
  encryptBuffer,
  encryptText,
  resolveVaultKey,
} from './cryptoVault.ts';

export interface BabyCryDatabase {
  getSettings(): PrivacySettings;
  updateSettings(patch: Partial<PrivacySettings>): PrivacySettings;
  listBabies(): BabyProfile[];
  getBaby(id: string): BabyProfile | null;
  createBaby(input: {
    name: string;
    birthDate: string;
    feedingType: FeedingType;
    notes: string;
  }): BabyProfile;
  updateBaby(
    id: string,
    patch: Partial<{ name: string; birthDate: string; feedingType: FeedingType; notes: string }>
  ): BabyProfile | null;
  deleteBaby(id: string): boolean;
  saveAnalysis(
    record: Omit<CryAnalysisRecord, 'id' | 'hasAudioBlob' | 'expiresAt'>,
    audioBytes: Buffer | null
  ): CryAnalysisRecord;
  listAnalyses(babyId?: string): CryAnalysisRecord[];
  getAnalysis(id: string): CryAnalysisRecord | null;
  getDecryptedAudio(id: string): { buffer: Buffer; mimeType: string } | null;
  submitFeedback(
    id: string,
    feedback: { confirmedCategory?: CryCategory; helpful: boolean; notes?: string }
  ): CryAnalysisRecord | null;
  deleteAnalysis(id: string): boolean;
  purgeExpiredRecords(): number;
  wipeAllData(): void;
  getDatasetStats(): { totalContributions: number; categoryBreakdown: Record<string, number> };
}

export function createDatabase(baseDataDir: string = path.resolve(process.cwd(), '.data')): BabyCryDatabase {
  const vaultDir = path.join(baseDataDir, 'vault');
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }

  const key = resolveVaultKey(baseDataDir);
  const dbPath = path.join(baseDataDir, 'babycry.db');
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      language TEXT NOT NULL DEFAULT 'fr',
      parental_consent INTEGER NOT NULL DEFAULT 0,
      consent_timestamp TEXT,
      retention_days INTEGER NOT NULL DEFAULT 30,
      allow_dataset_improvement INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO settings (id, language, parental_consent, consent_timestamp, retention_days, allow_dataset_improvement)
    VALUES (1, 'fr', 0, NULL, 30, 0);

    CREATE TABLE IF NOT EXISTS babies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      feeding_type TEXT NOT NULL DEFAULT 'mixed',
      encrypted_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      baby_id TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT,
      duration_sec REAL NOT NULL,
      mime_type TEXT NOT NULL,
      audio_filename TEXT,
      result_json TEXT NOT NULL,
      parent_feedback_json TEXT,
      FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS dataset_contributions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      baby_age_days INTEGER,
      acoustic_features_json TEXT NOT NULL,
      confirmed_category TEXT NOT NULL,
      model_hypothesis TEXT NOT NULL
    );
  `);

  function removeAudioFile(filename: string | null | undefined) {
    if (!filename) return;
    const safeName = path.basename(filename);
    const fullPath = path.join(vaultDir, safeName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  function purgeExpiredRecords(): number {
    const nowIso = new Date().toISOString();
    const expired = db
      .prepare('SELECT id, audio_filename FROM analyses WHERE expires_at IS NOT NULL AND expires_at <= ?')
      .all(nowIso) as { id: string; audio_filename: string | null }[];

    for (const row of expired) {
      removeAudioFile(row.audio_filename);
    }
    const info = db
      .prepare('DELETE FROM analyses WHERE expires_at IS NOT NULL AND expires_at <= ?')
      .run(nowIso);
    return Number(info.changes ?? 0);
  }

  function getSettings(): PrivacySettings {
    const row = db.prepare('SELECT * FROM settings WHERE id = 1').get() as {
      language: Language;
      parental_consent: number;
      consent_timestamp: string | null;
      retention_days: RetentionDays;
      allow_dataset_improvement: number;
    };
    return {
      language: row.language,
      parentalConsentAccepted: row.parental_consent === 1,
      consentTimestamp: row.consent_timestamp,
      retentionDays: row.retention_days,
      allowModelImprovementDataset: row.allow_dataset_improvement === 1,
      encryptionAlgorithm: ENCRYPTION_DESCRIPTION,
    };
  }

  function updateSettings(patch: Partial<PrivacySettings>): PrivacySettings {
    const current = getSettings();
    const language = patch.language ?? current.language;
    const consent = patch.parentalConsentAccepted ?? current.parentalConsentAccepted;
    const consentTimestamp =
      patch.parentalConsentAccepted === true && !current.consentTimestamp
        ? new Date().toISOString()
        : patch.parentalConsentAccepted === false
          ? null
          : (patch.consentTimestamp ?? current.consentTimestamp);
    const retentionDays = patch.retentionDays ?? current.retentionDays;
    const allowDataset = patch.allowModelImprovementDataset ?? current.allowModelImprovementDataset;

    db.prepare(
      `UPDATE settings
       SET language = ?, parental_consent = ?, consent_timestamp = ?, retention_days = ?, allow_dataset_improvement = ?
       WHERE id = 1`
    ).run(language, consent ? 1 : 0, consentTimestamp, retentionDays, allowDataset ? 1 : 0);

    return getSettings();
  }

  function mapBabyRow(row: {
    id: string;
    name: string;
    birth_date: string;
    feeding_type: FeedingType;
    encrypted_notes: string;
    created_at: string;
    updated_at: string;
  }): BabyProfile {
    let notes = '';
    try {
      notes = row.encrypted_notes ? decryptText(row.encrypted_notes, key) : '';
    } catch {
      notes = '';
    }
    return {
      id: row.id,
      name: row.name,
      birthDate: row.birth_date,
      feedingType: row.feeding_type,
      notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function listBabies(): BabyProfile[] {
    const rows = db.prepare('SELECT * FROM babies ORDER BY created_at DESC').all() as Array<{
      id: string;
      name: string;
      birth_date: string;
      feeding_type: FeedingType;
      encrypted_notes: string;
      created_at: string;
      updated_at: string;
    }>;
    return rows.map(mapBabyRow);
  }

  function getBaby(id: string): BabyProfile | null {
    const row = db.prepare('SELECT * FROM babies WHERE id = ?').get(id) as
      | {
          id: string;
          name: string;
          birth_date: string;
          feeding_type: FeedingType;
          encrypted_notes: string;
          created_at: string;
          updated_at: string;
        }
      | undefined;
    return row ? mapBabyRow(row) : null;
  }

  function createBaby(input: {
    name: string;
    birthDate: string;
    feedingType: FeedingType;
    notes: string;
  }): BabyProfile {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const encryptedNotes = encryptText(input.notes.trim(), key);
    db.prepare(
      `INSERT INTO babies (id, name, birth_date, feeding_type, encrypted_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, input.name.trim(), input.birthDate, input.feedingType, encryptedNotes, now, now);
    return getBaby(id)!;
  }

  function updateBaby(
    id: string,
    patch: Partial<{ name: string; birthDate: string; feedingType: FeedingType; notes: string }>
  ): BabyProfile | null {
    const existing = getBaby(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const name = patch.name !== undefined ? patch.name.trim() : existing.name;
    const birthDate = patch.birthDate ?? existing.birthDate;
    const feedingType = patch.feedingType ?? existing.feedingType;
    const notes = patch.notes !== undefined ? patch.notes.trim() : existing.notes;
    const encryptedNotes = encryptText(notes, key);

    db.prepare(
      `UPDATE babies SET name = ?, birth_date = ?, feeding_type = ?, encrypted_notes = ?, updated_at = ? WHERE id = ?`
    ).run(name, birthDate, feedingType, encryptedNotes, now, id);
    return getBaby(id);
  }

  function deleteBaby(id: string): boolean {
    const info = db.prepare('DELETE FROM babies WHERE id = ?').run(id);
    return Number(info.changes ?? 0) > 0;
  }

  function saveAnalysis(
    record: Omit<CryAnalysisRecord, 'id' | 'hasAudioBlob' | 'expiresAt'>,
    audioBytes: Buffer | null
  ): CryAnalysisRecord {
    const settings = getSettings();
    const id = crypto.randomUUID();

    // Respect immediate-delete policy (retentionDays === 0): still return result to user, do not persist audio blob or expired record
    if (settings.retentionDays === 0) {
      return {
        ...record,
        id,
        hasAudioBlob: false,
        expiresAt: record.createdAt,
      };
    }

    const expiresAt = computeExpirationIso(record.createdAt, settings.retentionDays);
    let audioFilename: string | null = null;

    if (audioBytes && audioBytes.length > 0) {
      audioFilename = `${id}.enc`;
      const encrypted = encryptBuffer(audioBytes, key);
      fs.writeFileSync(path.join(vaultDir, audioFilename), encrypted, { mode: 0o600 });
    }

    const fullRecord: CryAnalysisRecord = {
      ...record,
      id,
      hasAudioBlob: Boolean(audioFilename),
      expiresAt,
    };

    db.prepare(
      `INSERT INTO analyses (id, baby_id, created_at, expires_at, duration_sec, mime_type, audio_filename, result_json, parent_feedback_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
    ).run(
      id,
      record.babyId,
      record.createdAt,
      expiresAt,
      record.durationSec,
      record.mimeType,
      audioFilename,
      JSON.stringify(fullRecord)
    );

    return fullRecord;
  }

  function mapAnalysisRow(row: {
    id: string;
    audio_filename: string | null;
    result_json: string;
    parent_feedback_json: string | null;
  }): CryAnalysisRecord {
    const parsed = JSON.parse(row.result_json) as CryAnalysisRecord;
    const feedback = row.parent_feedback_json
      ? (JSON.parse(row.parent_feedback_json) as ParentFeedback)
      : undefined;
    return {
      ...parsed,
      id: row.id,
      hasAudioBlob: Boolean(
        row.audio_filename && fs.existsSync(path.join(vaultDir, path.basename(row.audio_filename)))
      ),
      parentFeedback: feedback,
    };
  }

  function listAnalyses(babyId?: string): CryAnalysisRecord[] {
    purgeExpiredRecords();
    const rows = babyId
      ? (db
          .prepare('SELECT id, audio_filename, result_json, parent_feedback_json FROM analyses WHERE baby_id = ? ORDER BY created_at DESC')
          .all(babyId) as Array<{
          id: string;
          audio_filename: string | null;
          result_json: string;
          parent_feedback_json: string | null;
        }>)
      : (db
          .prepare('SELECT id, audio_filename, result_json, parent_feedback_json FROM analyses ORDER BY created_at DESC')
          .all() as Array<{
          id: string;
          audio_filename: string | null;
          result_json: string;
          parent_feedback_json: string | null;
        }>);
    return rows.map(mapAnalysisRow);
  }

  function getAnalysis(id: string): CryAnalysisRecord | null {
    purgeExpiredRecords();
    const row = db
      .prepare('SELECT id, audio_filename, result_json, parent_feedback_json FROM analyses WHERE id = ?')
      .get(id) as
      | {
          id: string;
          audio_filename: string | null;
          result_json: string;
          parent_feedback_json: string | null;
        }
      | undefined;
    return row ? mapAnalysisRow(row) : null;
  }

  function getDecryptedAudio(id: string): { buffer: Buffer; mimeType: string } | null {
    purgeExpiredRecords();
    const row = db
      .prepare('SELECT audio_filename, mime_type FROM analyses WHERE id = ?')
      .get(id) as { audio_filename: string | null; mime_type: string } | undefined;
    if (!row || !row.audio_filename) return null;
    const filePath = path.join(vaultDir, path.basename(row.audio_filename));
    if (!fs.existsSync(filePath)) return null;
    const encrypted = fs.readFileSync(filePath);
    return {
      buffer: decryptBuffer(encrypted, key),
      mimeType: row.mime_type || 'audio/wav',
    };
  }

  function submitFeedback(
    id: string,
    feedbackInput: { confirmedCategory?: CryCategory; helpful: boolean; notes?: string }
  ): CryAnalysisRecord | null {
    const existing = getAnalysis(id);
    if (!existing) return null;

    const feedback: ParentFeedback = {
      confirmedCategory: feedbackInput.confirmedCategory,
      helpful: feedbackInput.helpful,
      notes: feedbackInput.notes?.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    db.prepare('UPDATE analyses SET parent_feedback_json = ? WHERE id = ?').run(
      JSON.stringify(feedback),
      id
    );

    const settings = getSettings();
    if (
      settings.allowModelImprovementDataset &&
      settings.parentalConsentAccepted &&
      feedback.confirmedCategory
    ) {
      // Store strictly anonymized acoustic feature vector (no audio, no baby name, no PII)
      const sanitizedFeatures: Omit<AcousticFeatures, 'waveformPreview'> = {
        durationSec: existing.acousticFeatures.durationSec,
        rmsDb: existing.acousticFeatures.rmsDb,
        peakDb: existing.acousticFeatures.peakDb,
        fundamentalFreqHz: existing.acousticFeatures.fundamentalFreqHz,
        freqMinHz: existing.acousticFeatures.freqMinHz,
        freqMaxHz: existing.acousticFeatures.freqMaxHz,
        spectralCentroidHz: existing.acousticFeatures.spectralCentroidHz,
        zeroCrossingRate: existing.acousticFeatures.zeroCrossingRate,
        cryBurstCount: existing.acousticFeatures.cryBurstCount,
        pauseRatio: existing.acousticFeatures.pauseRatio,
        intensityVariance: existing.acousticFeatures.intensityVariance,
        suddenShiftDetected: existing.acousticFeatures.suddenShiftDetected,
        cryActivityRatio: existing.acousticFeatures.cryActivityRatio,
        isCryDetected: existing.acousticFeatures.isCryDetected,
      };
      db.prepare(
        `INSERT INTO dataset_contributions (id, created_at, baby_age_days, acoustic_features_json, confirmed_category, model_hypothesis)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        crypto.randomUUID(),
        new Date().toISOString(),
        existing.babyAgeDays,
        JSON.stringify(sanitizedFeatures),
        feedback.confirmedCategory,
        existing.primaryHypothesis.category
      );
    }

    return getAnalysis(id);
  }

  function deleteAnalysis(id: string): boolean {
    const row = db
      .prepare('SELECT audio_filename FROM analyses WHERE id = ?')
      .get(id) as { audio_filename: string | null } | undefined;
    if (row?.audio_filename) {
      removeAudioFile(row.audio_filename);
    }
    const info = db.prepare('DELETE FROM analyses WHERE id = ?').run(id);
    return Number(info.changes ?? 0) > 0;
  }

  function wipeAllData(): void {
    const rows = db.prepare('SELECT audio_filename FROM analyses').all() as Array<{
      audio_filename: string | null;
    }>;
    for (const row of rows) {
      removeAudioFile(row.audio_filename);
    }
    if (fs.existsSync(vaultDir)) {
      for (const file of fs.readdirSync(vaultDir)) {
        fs.unlinkSync(path.join(vaultDir, file));
      }
    }
    db.exec(`
      DELETE FROM analyses;
      DELETE FROM babies;
      DELETE FROM dataset_contributions;
      UPDATE settings SET parental_consent = 0, consent_timestamp = NULL, allow_dataset_improvement = 0 WHERE id = 1;
    `);
  }

  function getDatasetStats(): { totalContributions: number; categoryBreakdown: Record<string, number> } {
    const rows = db
      .prepare('SELECT confirmed_category, COUNT(*) as cnt FROM dataset_contributions GROUP BY confirmed_category')
      .all() as Array<{ confirmed_category: string; cnt: number }>;
    const breakdown: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      breakdown[r.confirmed_category] = r.cnt;
      total += r.cnt;
    }
    return { totalContributions: total, categoryBreakdown: breakdown };
  }

  purgeExpiredRecords();

  return {
    getSettings,
    updateSettings,
    listBabies,
    getBaby,
    createBaby,
    updateBaby,
    deleteBaby,
    saveAnalysis,
    listAnalyses,
    getAnalysis,
    getDecryptedAudio,
    submitFeedback,
    deleteAnalysis,
    purgeExpiredRecords,
    wipeAllData,
    getDatasetStats,
  };
}
