import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAcousticHeuristics,
  decodeWavPcm,
  encodeWavPcm,
  extractAcousticFeatures,
  inferObservedTraitsFromDsp,
  synthesizeCryAcousticSample,
} from './acousticAnalysis';

test('WAV encode/decode roundtrip preserves sample rate and waveform signal', () => {
  const synth = synthesizeCryAcousticSample('hunger_rhythmic', 16000, 1.5);
  const decoded = decodeWavPcm(synth.wavBytes);
  assert.equal(decoded.sampleRate, 16000);
  assert.equal(decoded.samples.length, synth.samples.length);
  assert.ok(Math.abs(decoded.samples[2000] - synth.samples[2000]) < 0.001);
});

test('extractAcousticFeatures detects rhythmic hunger cry pitch and bursts', () => {
  const synth = synthesizeCryAcousticSample('hunger_rhythmic', 16000, 4.0);
  const features = extractAcousticFeatures(synth.samples, 16000);
  assert.equal(features.isCryDetected, true);
  assert.ok(features.fundamentalFreqHz >= 380 && features.fundamentalFreqHz <= 490);
  assert.ok(features.cryBurstCount >= 3);
  assert.equal(features.waveformPreview.length, 48);
});

test('extractAcousticFeatures detects high-pitched pain pattern and sudden shift', () => {
  const synth = synthesizeCryAcousticSample('pain_high_pitch', 16000, 4.0);
  const features = extractAcousticFeatures(synth.samples, 16000);
  assert.equal(features.isCryDetected, true);
  assert.ok(features.fundamentalFreqHz >= 580);
  assert.equal(features.suddenShiftDetected, true);

  const traits = inferObservedTraitsFromDsp(features);
  assert.ok(traits.includes('high_pitched'));
  assert.ok(traits.includes('sudden_change'));
});

test('extractAcousticFeatures rejects quiet ambient noise as no cry detected', () => {
  const synth = synthesizeCryAcousticSample('silence_room', 16000, 3.0);
  const features = extractAcousticFeatures(synth.samples, 16000);
  assert.equal(features.isCryDetected, false);
  const heuristics = classifyAcousticHeuristics(features);
  assert.equal(heuristics[0].category, 'unusual');
});

test('encodeWavPcm produces valid RIFF/WAVE header', () => {
  const raw = new Float32Array([0, 0.25, -0.25, 0]);
  const wav = encodeWavPcm(raw, 16000);
  assert.equal(String.fromCharCode(wav[0], wav[1], wav[2], wav[3]), 'RIFF');
  assert.equal(String.fromCharCode(wav[8], wav[9], wav[10], wav[11]), 'WAVE');
});
