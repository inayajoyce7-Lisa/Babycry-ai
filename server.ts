import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import type {
  AcousticFeatures,
  CryCategory,
  FeedingType,
  Language,
  RetentionDays,
} from './src/types/babycry.ts';
import { decodeWavPcm, extractAcousticFeatures } from './src/utils/acousticAnalysis.ts';
import { calculateBabyAge } from './src/utils/babyDomain.ts';
import { analyzeCryWithGoogleAI } from './server/cryAnalyzer.ts';
import { createDatabase } from './server/database.ts';

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const db = createDatabase();

  app.use(express.json({ limit: '25mb' }));

  // Health & AI capability check
  app.get('/api/health', (_req, res) => {
    const geminiConfigured = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );
    res.json({
      status: 'ok',
      geminiConfigured,
      specializedClassifierConfigured: Boolean(process.env.CRY_CLASSIFIER_ENDPOINT?.trim()),
    });
  });

  // Privacy & Settings
  app.get('/api/settings', (_req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    const body = req.body as Partial<{
      language: Language;
      parentalConsentAccepted: boolean;
      retentionDays: RetentionDays;
      allowModelImprovementDataset: boolean;
    }>;
    const updated = db.updateSettings(body);
    res.json(updated);
  });

  // Baby Profiles
  app.get('/api/babies', (_req, res) => {
    res.json(db.listBabies());
  });

  app.post('/api/babies', (req, res) => {
    const { name, birthDate, feedingType, notes } = req.body as {
      name?: string;
      birthDate?: string;
      feedingType?: FeedingType;
      notes?: string;
    };
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Baby name is required.' });
    }
    if (!birthDate || Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) {
      return res.status(400).json({ error: 'Valid birth date is required.' });
    }
    const created = db.createBaby({
      name: name.trim(),
      birthDate,
      feedingType: feedingType || 'mixed',
      notes: notes || '',
    });
    return res.status(201).json(created);
  });

  app.put('/api/babies/:id', (req, res) => {
    const updated = db.updateBaby(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Baby profile not found.' });
    }
    return res.json(updated);
  });

  app.delete('/api/babies/:id', (req, res) => {
    const ok = db.deleteBaby(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Baby profile not found.' });
    }
    return res.json({ deleted: true });
  });

  // Audio Cry Analysis
  app.post('/api/analyze', async (req, res) => {
    try {
      const settings = db.getSettings();
      if (!settings.parentalConsentAccepted) {
        return res.status(403).json({
          error: 'Explicit parental consent is required before recording or analyzing baby audio.',
        });
      }

      const {
        audioBase64,
        mimeType,
        acousticFeatures: clientFeatures,
        babyId,
        language,
        contextNote,
      } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        acousticFeatures?: AcousticFeatures;
        babyId?: string | null;
        language?: Language;
        contextNote?: string;
      };

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({ error: 'Audio payload (audioBase64) is required.' });
      }

      const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
      const audioBuffer = Buffer.from(cleanBase64, 'base64');
      if (audioBuffer.length < 64) {
        return res.status(400).json({ error: 'Audio recording is too short or empty.' });
      }

      // Compute or verify DSP acoustic features server-side when WAV PCM is provided
      let features = clientFeatures;
      if (!features || (mimeType || '').includes('wav')) {
        try {
          const decoded = decodeWavPcm(new Uint8Array(audioBuffer));
          features = extractAcousticFeatures(decoded.samples, decoded.sampleRate);
        } catch {
          // Non-WAV containers (webm/ogg/mp3) rely on Web Audio client-side DSP extraction
          if (!features) {
            return res.status(400).json({
              error: 'Acoustic DSP features could not be extracted from non-WAV audio container.',
            });
          }
        }
      }

      const baby = babyId ? db.getBaby(babyId) : null;
      const babyAgeDays = baby ? calculateBabyAge(baby.birthDate).days : null;
      const targetLang: Language = language || settings.language || 'fr';

      const analysis = await analyzeCryWithGoogleAI({
        audioBase64: cleanBase64,
        mimeType: mimeType || 'audio/wav',
        acousticFeatures: features,
        baby,
        language: targetLang,
        contextNote,
      });

      const saved = db.saveAnalysis(
        {
          babyId: baby?.id ?? null,
          babyName: baby?.name ?? (targetLang === 'en' ? 'Baby' : targetLang === 'ht' ? 'Tibebe' : 'Bébé'),
          babyAgeDays,
          createdAt: new Date().toISOString(),
          durationSec: features.durationSec,
          mimeType: mimeType || 'audio/wav',
          acousticFeatures: features,
          primaryHypothesis: analysis.primaryHypothesis,
          secondaryHypotheses: analysis.secondaryHypotheses,
          confidence: analysis.confidence,
          observedTraits: analysis.observedTraits,
          acousticSummary: analysis.acousticSummary,
          simpleExplanation: analysis.simpleExplanation,
          practicalTips: analysis.practicalTips,
          safetyReminders: analysis.safetyReminders,
          isInconclusive: analysis.isInconclusive,
          modelSource: analysis.modelSource,
          language: targetLang,
        },
        audioBuffer
      );

      return res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected analysis error';
      console.error('[BabyCry AI /api/analyze error]', message);
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      return res.status(status).json({ error: message });
    }
  });

  // History & Audio Vault Playback
  app.get('/api/analyses', (req, res) => {
    const babyId = typeof req.query.babyId === 'string' ? req.query.babyId : undefined;
    res.json(db.listAnalyses(babyId));
  });

  app.get('/api/analyses/:id', (req, res) => {
    const record = db.getAnalysis(req.params.id);
    if (!record) return res.status(404).json({ error: 'Recording not found or expired.' });
    return res.json(record);
  });

  app.get('/api/analyses/:id/audio', (req, res) => {
    const media = db.getDecryptedAudio(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Encrypted audio not found or retention expired.' });
    }
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(media.buffer);
  });

  app.post('/api/analyses/:id/feedback', (req, res) => {
    const { confirmedCategory, helpful, notes } = req.body as {
      confirmedCategory?: CryCategory;
      helpful?: boolean;
      notes?: string;
    };
    const updated = db.submitFeedback(req.params.id, {
      confirmedCategory,
      helpful: Boolean(helpful),
      notes,
    });
    if (!updated) return res.status(404).json({ error: 'Recording not found.' });
    return res.json(updated);
  });

  app.delete('/api/analyses/:id', (req, res) => {
    const ok = db.deleteAnalysis(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Recording not found.' });
    return res.json({ deleted: true });
  });

  app.delete('/api/privacy/erase-all', (_req, res) => {
    db.wipeAllData();
    res.json({ erased: true });
  });

  app.get('/api/dataset/stats', (_req, res) => {
    res.json(db.getDatasetStats());
  });

  // Frontend serving (Vite middleware in dev, static dist in production)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BABYCRY AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start BABYCRY AI server:', err);
  process.exit(1);
});
