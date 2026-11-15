import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBabyAge,
  computeExpirationIso,
  evaluateSafetyRedFlags,
  formatBabyAge,
  getAgeAdaptedTipFocus,
} from './babyDomain';

test('calculateBabyAge accurately computes days, weeks, months and newborn stage', () => {
  const ref = new Date('2026-11-14T12:00:00Z');
  const newborn = calculateBabyAge('2026-10-03', ref);
  assert.equal(newborn.days, 42);
  assert.equal(newborn.weeks, 6);
  assert.equal(newborn.stage, 'newborn');
  assert.equal(newborn.isUnderThreeMonths, true);
  assert.equal(formatBabyAge(newborn, 'fr'), '6 semaines');

  const older = calculateBabyAge('2026-03-01', ref);
  assert.equal(older.stage, 'older_infant');
  assert.equal(older.isUnderThreeMonths, false);
});

test('evaluateSafetyRedFlags triggers emergency on fever >= 38C for under 3 months', () => {
  const safeCheck = evaluateSafetyRedFlags([], 45, 37.2);
  assert.equal(safeCheck.isEmergency, false);
  assert.equal(safeCheck.feverRuleTriggered, false);

  const feverNewborn = evaluateSafetyRedFlags([], 45, 38.1);
  assert.equal(feverNewborn.isEmergency, true);
  assert.equal(feverNewborn.feverRuleTriggered, true);
  assert.ok(feverNewborn.triggeredFlags.includes('fever_under_3m'));

  const breathingCheck = evaluateSafetyRedFlags(['breathing_difficulty'], 200);
  assert.equal(breathingCheck.isEmergency, true);
});

test('computeExpirationIso honors retention days', () => {
  const created = '2026-11-01T10:00:00.000Z';
  assert.equal(computeExpirationIso(created, 0), created);
  assert.equal(computeExpirationIso(created, 7), '2026-11-08T10:00:00.000Z');
});

test('getAgeAdaptedTipFocus returns localized advice in FR, EN, and HT', () => {
  assert.match(getAgeAdaptedTipFocus('newborn', 'fr'), /38 °C/);
  assert.match(getAgeAdaptedTipFocus('newborn', 'en'), /38\.0°C/);
  assert.match(getAgeAdaptedTipFocus('newborn', 'ht'), /lafyèv/);
});
