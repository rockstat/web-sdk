import { win } from './Browser';
import createLogger from './functions/createLogger';

const log = createLogger('RST/Encryptor');

const cryptoApi = win.crypto;
const subtle = cryptoApi && cryptoApi.subtle;

// Payload format version
const FORMAT_VERSION = '1';
const SEPARATOR = ':';
const AES_PARAMS = { name: 'AES-GCM', length: 256 };
const RSA_PARAMS = { name: 'RSA-OAEP', hash: 'SHA-256' };
const IV_LENGTH = 12;


function b64ToBytes(b64) {
  const bin = win.atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function bytesToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return win.btoa(bin);
}

/**
 * Accepts PEM ("-----BEGIN PUBLIC KEY-----...") or bare base64 SPKI
 * @param key {string}
 * @return {Uint8Array}
 */
function keyToBytes(key) {
  const b64 = String(key)
    .replace(/-----[^-]+-----/g, '')
    .replace(/\s+/g, '');
  return b64ToBytes(b64);
}

function strToBytes(str) {
  const utf8 = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    bytes[i] = utf8.charCodeAt(i);
  }
  return bytes;
}


/**
 * Hybrid encryption: values are encrypted with a random AES-256-GCM session key,
 * the session key is wrapped with the site's RSA public key (RSA-OAEP SHA-256).
 * Only the server holding the private key can unwrap and decrypt.
 * Output: "1:<wrappedKey b64>:<iv b64>:<ciphertext b64>"
 *
 * @param publicKey {string} RSA public key, PEM or base64-encoded SPKI
 * @constructor
 */
const Encryptor = function (publicKey) {

  this.aesKey = null;
  this.wrappedB64 = null;
  this.ready = null;

  if (!subtle || !win.Uint8Array || !win.atob) {
    return log.warn('WebCrypto not supported, values will not be collected');
  }

  try {
    const keyData = keyToBytes(publicKey);

    this.ready = subtle.importKey('spki', keyData, RSA_PARAMS, false, ['wrapKey'])
      .then((rsaKey) => subtle.generateKey(AES_PARAMS, true, ['encrypt'])
        .then((aesKey) => subtle.wrapKey('raw', aesKey, rsaKey, RSA_PARAMS)
          .then((wrapped) => {
            this.aesKey = aesKey;
            this.wrappedB64 = bytesToB64(wrapped);
            return true;
          })))
      .catch((err) => {
        log.warn('Key setup failed', err);
        return false;
      });

  } catch (err) {
    log.warn('Invalid public key', err);
  }
};

/**
 * @return {boolean} encryption can be attempted
 */
Encryptor.prototype.isSupported = function () {
  return !!this.ready;
};

/**
 * Encrypts a string value
 * @param value {string}
 * @return {Promise<string|null>} encrypted payload or null when unavailable
 */
Encryptor.prototype.encrypt = function (value) {

  if (!this.ready) {
    return Promise.resolve(null);
  }

  return this.ready
    .then((ok) => {
      if (!ok) return null;

      const iv = cryptoApi.getRandomValues(new Uint8Array(IV_LENGTH));
      return subtle.encrypt({ name: 'AES-GCM', iv: iv }, this.aesKey, strToBytes(value))
        .then((ciphertext) => [
          FORMAT_VERSION,
          this.wrappedB64,
          bytesToB64(iv),
          bytesToB64(ciphertext)
        ].join(SEPARATOR));
    })
    .catch((err) => {
      log.warn('Encryption failed', err);
      return null;
    });
};


export default Encryptor;
