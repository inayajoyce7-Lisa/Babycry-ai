export type Language = 'fr' | 'en' | 'ht';

export type ScreenId =
  | 'home'
  | 'profile'
  | 'record'
  | 'analyzing'
  | 'results'
  | 'history'
  | 'guides'
  | 'settings';

export type CryCategory =
  | 'hunger'
  | 'fatigue'
  | 'discomfort'
  | 'diaper'
  | 'gas_colic'
  | 'comfort_holding'
  | 'pain'
  | 'temperature'
  | 'unusual';

export type SoundTrait =
  | 'groaning'
  | 'high_pitched'
  | 'continuous'
  | 'intermittent'
  | 'intense'
  | 'weak'
  | 'sudden_change';

export type SafetyRedFlagId =
  | 'breathing_difficulty'
  | 'bluish_skin'
  | 'hard_to_wake'
  | 'fever_under_3m'
  | 'unusual_general_state';

export type FeedingType = 'breastfeeding' | 'formula' | 'mixed' | 'solids';

export type AgeStage = 'newborn' | 'young_infant' | 'older_infant' | 'toddler';

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string; // ISO YYYY-MM-DD
  feedingType: FeedingType;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcousticFeatures {
  durationSec: number;
  rmsDb: number;
  peakDb: number;
  fundamentalFreqHz: number;
  freqMinHz: number;
  freqMaxHz: number;
  spectralCentroidHz: number;
  zeroCrossingRate: number;
  cryBurstCount: number;
  pauseRatio: number;
  intensityVariance: number;
  suddenShiftDetected: boolean;
  cryActivityRatio: number;
  isCryDetected: boolean;
  waveformPreview: number[];
}

export interface CryHypothesis {
  category: CryCategory;
  confidence: number; // 0-100
  rationale: string;
}

export interface ParentFeedback {
  confirmedCategory?: CryCategory;
  helpful: boolean;
  notes?: string;
  submittedAt: string;
}

export interface CryAnalysisRecord {
  id: string;
  babyId: string | null;
  babyName: string;
  babyAgeDays: number | null;
  createdAt: string;
  expiresAt: string | null;
  durationSec: number;
  mimeType: string;
  hasAudioBlob: boolean;
  acousticFeatures: AcousticFeatures;
  primaryHypothesis: CryHypothesis;
  secondaryHypotheses: CryHypothesis[];
  confidence: number;
  observedTraits: SoundTrait[];
  acousticSummary: string;
  simpleExplanation: string;
  practicalTips: string[];
  safetyReminders: string[];
  isInconclusive: boolean;
  modelSource: string;
  language: Language;
  parentFeedback?: ParentFeedback;
}

export type RetentionDays = 0 | 7 | 30 | 90;

export interface PrivacySettings {
  language: Language;
  parentalConsentAccepted: boolean;
  consentTimestamp: string | null;
  retentionDays: RetentionDays;
  allowModelImprovementDataset: boolean;
  encryptionAlgorithm: string;
}

export interface SafetyEvaluationResult {
  isEmergency: boolean;
  triggeredFlags: SafetyRedFlagId[];
  feverRuleTriggered: boolean;
}
