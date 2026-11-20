import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAcousticFeatures,
  synthesizeCryAcousticSample,
} from '../src/utils/acousticAnalysis.ts';
import { buildAcousticDspBaselineAnalysis } from './cryAnalyzer.ts';

test('buildAcousticDspBaselineAnalysis classifies hunger WAV sample in French', () => {
  const synth = synthesizeCryAcousticSample('hunger_rhythmic', 16000, 4.0);
  const features = extractAcousticFeatures(synth.samples, 16000);
  const res = buildAcousticDspBaselineAnalysis({
    audioBase64: '',
    mimeType: 'audio/wav',
    acousticFeatures: features,
    baby: {
      id: 'b1',
      name: 'Léo',
      birthDate: '2026-10-03',
      feedingType: 'breastfeeding',
      notes: '',
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    },
    language: 'fr',
  });

  assert.equal(res.isInconclusive, false);
  assert.equal(res.primaryHypothesis.category, 'hunger');
  assert.ok(res.confidence >= 40 && res.confidence <= 90);
  assert.ok(res.practicalTips.length >= 3);
  assert.match(res.modelSource, /Acoustic DSP Local/);
});

test('buildAcousticDspBaselineAnalysis marks quiet room noise as inconclusive in HT & EN', () => {
  const synth = synthesizeCryAcousticSample('silence_room', 16000, 3.0);
  const features = extractAcousticFeatures(synth.samples, 16000);
  const resHt = buildAcousticDspBaselineAnalysis({
    audioBase64: '',
    mimeType: 'audio/wav',
    acousticFeatures: features,
    baby: null,
    language: 'ht',
  });

  assert.equal(resHt.isInconclusive, true);
  assert.equal(resHt.primaryHypothesis.category, 'unusual');
  assert.match(resHt.simpleExplanation, /kriye/i);

  const resEn = buildAcousticDspBaselineAnalysis({
    audioBase64: '',
    mimeType: 'audio/wav',
    acousticFeatures: features,
    baby: null,
    language: 'en',
  });
  assert.equal(resEn.isInconclusive, true);
  assert.match(resEn.simpleExplanation, /No clear infant cry|did not detect/i);
});
