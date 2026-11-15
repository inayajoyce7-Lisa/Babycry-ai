import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { decryptBuffer, decryptText, encryptBuffer, encryptText } from './cryptoVault';

test('AES-256-GCM buffer encryption roundtrip works and hides plaintext', () => {
  const key = crypto.randomBytes(32);
  const sampleAudio = Buffer.from('RIFF_MOCK_BABY_CRY_WAVEFORM_DATA_123456', 'utf8');
  const encrypted = encryptBuffer(sampleAudio, key);

  assert.notEqual(encrypted.toString('utf8'), sampleAudio.toString('utf8'));
  const decrypted = decryptBuffer(encrypted, key);
  assert.equal(decrypted.equals(sampleAudio), true);
});

test('AES-256-GCM rejects tampered ciphertext or wrong key', () => {
  const key = crypto.randomBytes(32);
  const wrongKey = crypto.randomBytes(32);
  const encrypted = encryptBuffer(Buffer.from('sensitive baby note'), key);

  assert.throws(() => decryptBuffer(encrypted, wrongKey));

  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 1] ^= 0xff;
  assert.throws(() => decryptBuffer(tampered, key));
});

test('encryptText and decryptText preserve UTF-8 French & Haitian Creole characters', () => {
  const key = crypto.randomBytes(32);
  const note = 'Bébé Léo — kè kalm, dodo aprè midi.';
  const cipher = encryptText(note, key);
  assert.equal(decryptText(cipher, key), note);
});
