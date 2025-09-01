
```
// Covenant Utilities and Ciphers
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const norm = s => (s || '').toUpperCase().replace(/[^A-Z]/g, '');

// Footer date stamp
export function stampFooter() {
  const el = document.getElementById('date-stamp');
  if (el) el.textContent = new Date().toISOString().slice(0, 10);
}

// Neon reveal helper
export function toggle(el, show) { el?.classList[show ? 'add' : 'remove']('show'); }

// Vigenère
export function vigenereDecode(cipher, key) {
  const C = norm(cipher), K = norm(key);
  if (!C || !K) return '';
  let out = '', ki = 0;
  for (let i = 0; i < C.length; i++) {
    const c = C[i].charCodeAt(0) - 65;
    const k = K[ki % K.length].charCodeAt(0) - 65;
    out += String.fromCharCode(((c - k + 26) % 26) + 65);
    ki++;
  }
  return out;
}

// Rail Fence (decode)
export function railFenceDecode(cipher, rails = 3) {
  const text = norm(cipher);
  if (rails < 2 || text.length === 0) return text;
  const len = text.length, fence = Array.from({ length: rails }, () => Array(len).fill(null));
  let dir = 1, r = 0;
  for (let c = 0; c < len; c++) {
    fence[r][c] = '?';
    r += dir;
    if (r === 0 || r === rails - 1) dir *= -1;
  }
  let idx = 0;
  for (let i = 0; i < rails; i++) {
    for (let j = 0; j < len; j++) {
      if (fence[i][j] === '?' && idx < len) fence[i][j] = text[idx++];
    }
  }
  let res = '';
  dir = 1; r = 0;
  for (let c = 0; c < len; c++) {
    res += fence[r][c];
    r += dir;
    if (r === 0 || r === rails - 1) dir *= -1;
  }
  return res;
}

// Token handling for Vault
const TOKEN_KEY = 'covenant:token';
export const setToken = v => localStorage.setItem(TOKEN_KEY, v);
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const hasValidToken = () => getToken() === 'THECODEISTHEPRAYER';