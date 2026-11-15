import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export const ENCRYPTION_DESCRIPTION = 'AES-256-GCM';

export function resolveVaultKey(dataDir: string): Buffer {
  const envSecret = process.env.BABYCRY_VAULT_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return crypto.scryptSync(envSecret, 'babycry-ai-vault-salt-v1', 32);
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const keyPath = path.join(dataDir, '.vault.key');
  if (fs.existsSync(keyPath)) {
    const hex = fs.readFileSync(keyPath, 'utf8').trim();
    if (/^[0-9a-f]{64}$/i.test(hex)) {
      return Buffer.from(hex, 'hex');
    }
  }

  const key = crypto.randomBytes(32);
  fs.writeFileSync(keyPath, key.toString('hex'), { mode: 0o600 });
  return key;
}

export function encryptBuffer(plaintext: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: [IV (12 bytes)][AuthTag (16 bytes)][Ciphertext]
  return Buffer.concat([iv, authTag, encrypted]);
}

export function decryptBuffer(payload: Buffer, key: Buffer): Buffer {
  if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Encrypted payload is malformed or truncated');
  }
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptText(text: string, key: Buffer): string {
  if (!text) return '';
  return encryptBuffer(Buffer.from(text, 'utf8'), key).toString('base64');
}

export function decryptText(encoded: string, key: Buffer): string {
  if (!encoded) return '';
  const buf = Buffer.from(encoded, 'base64');
  return decryptBuffer(buf, key).toString('utf8');
}
