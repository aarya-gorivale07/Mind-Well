const crypto = require('crypto');

const newSalt = () => crypto.randomBytes(16).toString('base64');
const deriveKey = (passphrase, salt) =>
  crypto.scryptSync(passphrase, Buffer.from(salt, 'base64'), 32);

function encrypt(text, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map(b => b.toString('base64')).join('.');
}

function decrypt(payload, key) {
  const [iv, tag, enc] = payload.split('.').map(s => Buffer.from(s, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}

module.exports = { newSalt, deriveKey, encrypt, decrypt };
