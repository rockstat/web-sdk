#!/usr/bin/env node
/**
 * Расшифровка значений полей форм, собранных web-sdk (FormTracker + encryptionKey).
 *
 * Формат evalue: "1:<wrappedKey b64>:<iv b64>:<ciphertext b64>"
 *  - wrappedKey — сессионный ключ AES-256-GCM, обёрнутый RSA-OAEP(SHA-256)
 *  - iv         — 12 байт, уникален для каждого значения
 *  - ciphertext — AES-256-GCM, последние 16 байт — auth tag
 *
 * Использование:
 *   node decrypt-field-value.js <path/to/private.pem> "<evalue>"
 *
 * Или как модуль:
 *   const { createDecryptor } = require('./decrypt-field-value');
 *   const decrypt = createDecryptor(privatePem);
 *   const plaintext = decrypt(event.data.evalue);
 */
const crypto = require('crypto');
const fs = require('fs');

const FORMAT_VERSION = '1';
const GCM_TAG_LENGTH = 16;

/**
 * @param {string|Buffer} privateKeyPem приватный ключ RSA (PEM)
 * @returns {(evalue: string) => string} функция расшифровки
 */
function createDecryptor(privateKeyPem) {
  // Один wrappedKey приходит во всех событиях страницы —
  // кешируем расшифрованный сессионный ключ, чтобы не гонять RSA каждый раз
  const sessionKeys = new Map();

  return function decrypt(evalue) {
    const parts = String(evalue).split(':');
    if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
      throw new Error(`Unsupported evalue format: ${String(evalue).slice(0, 32)}...`);
    }
    const [, wrappedB64, ivB64, ctB64] = parts;

    let sessionKey = sessionKeys.get(wrappedB64);
    if (!sessionKey) {
      sessionKey = crypto.privateDecrypt(
        {
          key: privateKeyPem,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(wrappedB64, 'base64')
      );
      sessionKeys.set(wrappedB64, sessionKey);
    }

    const buf = Buffer.from(ctB64, 'base64');
    const ciphertext = buf.subarray(0, buf.length - GCM_TAG_LENGTH);
    const authTag = buf.subarray(buf.length - GCM_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      sessionKey,
      Buffer.from(ivB64, 'base64')
    );
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  };
}

module.exports = { createDecryptor };

if (require.main === module) {
  const [keyPath, evalue] = process.argv.slice(2);
  if (!keyPath || !evalue) {
    console.error('Usage: node decrypt-field-value.js <private.pem> "<evalue>"');
    process.exit(1);
  }
  const decrypt = createDecryptor(fs.readFileSync(keyPath, 'utf8'));
  console.log(decrypt(evalue));
}
