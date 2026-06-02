const crypto = require("crypto");

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function getSigningSecret() {
  return process.env.AUTH_SECRET || process.env.MANAGER_PASSWORD || "";
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signTokenPayload(payload) {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

function createSessionToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = signTokenPayload(payload);

  return `${payload}.${signature}`;
}

function verifySessionToken(token) {
  const secret = getSigningSecret();
  if (!secret || !token) {
    return false;
  }

  const parts = String(token).split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [expiresAtText, nonce, signature] = parts;
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt || !nonce || !signature) {
    return false;
  }

  const expected = signTokenPayload(`${expiresAtText}.${nonce}`);
  return safeEqual(signature, expected);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function requireAuth(req, res) {
  if (verifySessionToken(getBearerToken(req))) {
    return true;
  }

  sendJson(res, 401, { success: false, message: "Unauthorized" });
  return false;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });

    req.on("error", reject);
  });
}

module.exports = {
  createSessionToken,
  readJsonBody,
  requireAuth,
  safeEqual,
  sendJson,
};
