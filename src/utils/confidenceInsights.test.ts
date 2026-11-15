import test from 'node:test';
import assert from 'node:assert/strict';
import type { CryAnalysisRecord } from '../types/babycry';
import { CATEGORY_BENCHMARKS, computeConfidenceInsights } from './confidenceInsights';

function makeRecord(overrides: Partial<CryAnalysisRecord> = {}): CryAnalysisRecord {
  return {
    id: overrides.id ?? 'rec-1',
    babyId: 'baby-1',
    babyName: 'Léo',
    babyAgeDays: 42,
    createdAt: '2026-11-15T10:00:00.000Z',
    expiresAt: '2026-12-15T10:00:00.000Z',
    durationSec: 4.0,
    mimeType: 'audio/wav',
    hasAudioBlob: true,
    acousticFeatures: {
      durationSec: 4.0,
      rmsDb: -21,
      peakDb: -11,
      fundamentalFreqHz: 430,
      freqMinHz: 390,
      freqMaxHz: 470,
      spectralCentroidHz: 510,
      zeroCrossingRate: 0.06,
      cryBurstCount: 4,
      pauseRatio: 0.35,
      intensityVariance: 5.2,
      suddenShiftDetected: false,
      cryActivityRatio: 0.65,
      isCryDetected: true,
      waveformPreview: new Array(48).fill(0.2),
    },
    primaryHypothesis: { category: 'hunger', confidence: 80, rationale: 'Rhythmic bursts' },
    secondaryHypotheses: [{ category: 'fatigue', confidence: 48, rationale: 'Mild overlap' }],
    confidence: 80,
    observedTraits: ['intermittent'],
    acousticSummary: 'Rhythmic mid-pitch cry',
    simpleExplanation: 'Likely hunger.',
    practicalTips: ['Check last feed'],
    safetyReminders: ['Consult pediatrician if concerned'],
    isInconclusive: false,
    modelSource: 'Google AI + DSP',
    language: 'fr',
    ...overrides,
  };
}

test('falls back to model baseline average when user has fewer than 2 historical peers', () => {
  const current = makeRecord({ id: 'cur', confidence: 82 });
  const peer1 = makeRecord({ id: 'p1', confidence: 66 });
  const insight = computeConfidenceInsights(current, [current, peer1], { hunger: 18 });

  assert.equal(insight.comparisonSource, 'model_baseline');
  assert.equal(insight.comparisonAvg, CATEGORY_BENCHMARKS.hunger.referenceAvg);
  assert.equal(insight.deltaPoints, 82 - CATEGORY_BENCHMARKS.hunger.referenceAvg);
  assert.equal(insight.tier, 'above_average');
  assert.equal(insight.impactLevel, 'calibration');
  assert.equal(insight.reasonKey, 'strong_anchor');
});

test('uses personal user history average when 2 or more peers exist in same category', () => {
  const current = makeRecord({ id: 'cur', confidence: 62 });
  const peers = [
    makeRecord({ id: 'p1', confidence: 76 }),
    makeRecord({ id: 'p2', confidence: 80 }),
  ];
  const insight = computeConfidenceInsights(current, [current, ...peers], { hunger: 25 });

  assert.equal(insight.comparisonSource, 'user_history');
  assert.equal(insight.userCategoryCount, 2);
  assert.equal(insight.comparisonAvg, 78);
  assert.equal(insight.deltaPoints, -16);
  assert.equal(insight.tier, 'below_average');
  assert.equal(insight.impactLevel, 'high');
  assert.equal(insight.reasonKey, 'below_average_edge_case');
});

test('flags underrepresented category (< 10 contributions) as high refinement impact', () => {
  const current = makeRecord({
    id: 'cur',
    primaryHypothesis: { category: 'temperature', confidence: 60, rationale: 'Whimpering' },
    confidence: 60,
  });
  const insight = computeConfidenceInsights(current, [current], { temperature: 3 });

  assert.equal(insight.impactLevel, 'high');
  assert.equal(insight.reasonKey, 'underrepresented_category');
  assert.equal(insight.categoryContributionCount, 3);
});

test('flags close secondary hypothesis boundary as high refinement impact', () => {
  const current = makeRecord({
    id: 'cur',
    confidence: 68,
    primaryHypothesis: { category: 'gas_colic', confidence: 68, rationale: 'High pitch' },
    secondaryHypotheses: [{ category: 'pain', confidence: 60, rationale: 'Similar sharpness' }],
  });
  const insight = computeConfidenceInsights(current, [current], { gas_colic: 20 });

  assert.equal(insight.secondaryGap, 8);
  assert.equal(insight.impactLevel, 'high');
  assert.equal(insight.reasonKey, 'ambiguous_boundary');
});

test('marks inconclusive audio as low training refinement impact', () => {
  const current = makeRecord({
    id: 'cur',
    isInconclusive: true,
    confidence: 28,
    primaryHypothesis: { category: 'unusual', confidence: 28, rationale: 'Too quiet' },
  });
  const insight = computeConfidenceInsights(current, [current], { unusual: 0 });

  assert.equal(insight.impactLevel, 'low');
  assert.equal(insight.reasonKey, 'inconclusive_audio');
});
