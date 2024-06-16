import crypto from 'crypto';

const SALT_LENGTH = 13;

function generateSalt(len) {
  const set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  const setLen = set.length;

  let salt = '';
  for (let i = 0; i < len; i++) {
    const p = Math.floor(Math.random() * setLen);
    salt += set[p];
  }
  return salt;
}

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

export function createHash(password) {
  const salt = generateSalt(SALT_LENGTH);
  const hash = md5(password + salt);
  return salt + hash;
}

export function validateHash(hash, password) {
  const salt = hash.substr(0, SALT_LENGTH);
  const validHash = salt + md5(password + salt);
  return hash === validHash;
}
