// ─────────────────────────────────────────────────────────────────────────────
// qrCrypto.js  –  Pure-JS HMAC-SHA256 + QR token helpers
//
// Works on HTTP (no crypto.subtle needed).
// Import this wherever you need QR token generation or verification.
// ─────────────────────────────────────────────────────────────────────────────

const _rotR = (x, n) => (x >>> n) | (x << (32 - n));

/**
 * SHA-256 over a Uint8Array.
 * FIX: the original padding calculation was wrong — `extra` was always 0
 * because `(n % 64 <= 0 ? 64 - n%64 : 64 - n%64) % 64` simplifies to 0
 * for any n.  The correct approach is below.
 */
const _sha256 = (msgBytes) => {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const len = msgBytes.length;

  // ── FIX: correct SHA-256 padding ──────────────────────────────────────────
  // We need: (len + 1 + padding + 8) ≡ 0 (mod 64)
  // So padding = (55 - len) mod 64  (55 = 64 - 1 - 8)
  const padLen = ((55 - len) % 64 + 64) % 64;
  const padded = new Uint8Array(len + 1 + padLen + 8);
  padded.set(msgBytes);
  padded[len] = 0x80;

  // Append bit-length as 64-bit big-endian (we only support < 2^32 bits)
  const bitLen = len * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  // ─────────────────────────────────────────────────────────────────────────

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(64);
    for (let j = 0; j < 16; j++) {
      w[j] =
        (padded[i + j * 4] << 24) |
        (padded[i + j * 4 + 1] << 16) |
        (padded[i + j * 4 + 2] << 8) |
        padded[i + j * 4 + 3];
    }
    for (let j = 16; j < 64; j++) {
      const s0 =
        _rotR(w[j - 15], 7) ^ _rotR(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 =
        _rotR(w[j - 2], 17) ^ _rotR(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let j = 0; j < 64; j++) {
      const S1 = _rotR(e, 6) ^ _rotR(e, 11) ^ _rotR(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = _rotR(a, 2) ^ _rotR(a, 13) ^ _rotR(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h = h.map((v, i) => ([a, b, c, d, e, f, g, hh][i] + v) >>> 0);
  }

  const out = new Uint8Array(32);
  h.forEach((v, i) => {
    out[i * 4]     = (v >>> 24) & 0xff;
    out[i * 4 + 1] = (v >>> 16) & 0xff;
    out[i * 4 + 2] = (v >>> 8)  & 0xff;
    out[i * 4 + 3] =  v         & 0xff;
  });
  return out;
};

const _hmacSha256 = (keyStr, msgStr) => {
  const enc = new TextEncoder();
  let keyBytes = enc.encode(keyStr);
  if (keyBytes.length > 64) keyBytes = _sha256(keyBytes);
  const k = new Uint8Array(64);
  k.set(keyBytes);
  const ipad = k.map((b) => b ^ 0x36);
  const opad = k.map((b) => b ^ 0x5c);
  const msgBytes = enc.encode(msgStr);
  const inner = new Uint8Array(ipad.length + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, ipad.length);
  const innerHash = _sha256(inner);
  const outer = new Uint8Array(opad.length + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, opad.length);
  return _sha256(outer);
};

const _toHex = (bytes) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

// ── Public API ────────────────────────────────────────────────────────────────

const QR_SECRET = import.meta.env.VITE_QR_SECRET;
const TOKEN_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a signed, time-limited QR token for an employee.
 * Returns an empty string if employeeId or QR_SECRET is missing.
 */
export const generateQRToken = (employeeId) => {
  if (!employeeId || !QR_SECRET) return "";
  const expiry  = Date.now() + TOKEN_TTL;
  const payload = `${employeeId.toUpperCase()}:${expiry}`;
  const sigHex  = _toHex(_hmacSha256(QR_SECRET, payload));
  return btoa(`${payload}:${sigHex}`);
};

/**
 * Verify a QR token against an employee ID.
 * Returns true  → valid & not expired
 * Returns false → invalid signature, wrong ID, or expired
 */
export const verifyQRToken = (token, employeeId) => {
  try {
    if (!token || !employeeId || !QR_SECRET) return false;

    const decoded   = atob(token);
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;

    const sigHex  = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);

    const colonIdx = payload.indexOf(":");
    if (colonIdx === -1) return false;

    const id       = payload.slice(0, colonIdx);
    const expiryMs = parseInt(payload.slice(colonIdx + 1), 10);

    if (id.toLowerCase() !== employeeId.toLowerCase()) return false;
    if (isNaN(expiryMs) || Date.now() > expiryMs)      return false;

    const expectedHex = _toHex(_hmacSha256(QR_SECRET, payload));
    return expectedHex === sigHex;
  } catch {
    return false;
  }
};

/**
 * Decode the failure reason from a token without verifying it.
 * Useful for showing "expired" vs "invalid" error messages.
 * Returns: "expired" | "invalid" | "missing"
 */
export const getTokenFailureReason = (token) => {
  if (!token) return "missing";
  try {
    const decoded   = atob(token);
    const lastColon = decoded.lastIndexOf(":");
    const payload   = decoded.slice(0, lastColon);
    const colonIdx  = payload.indexOf(":");
    const expiryMs  = parseInt(payload.slice(colonIdx + 1), 10);
    return !isNaN(expiryMs) && Date.now() > expiryMs ? "expired" : "invalid";
  } catch {
    return "invalid";
  }
};