/**
 * Zynthor Business OS — Authentication & Tenant Isolation Engine
 * Secure cryptographic token signing, PBKDF2/scrypt password hashing,
 * strict multi-tenant scoping, and role-based access control.
 */

const crypto = require("node:crypto");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Enforce safe secrets handling
const isProduction = process.env.NODE_ENV === "production";
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (isProduction) {
    console.error("[CRITICAL FATAL] Missing required JWT_SECRET in production environment! Server cannot start safely.");
    process.exit(1);
  } else {
    // Generate secure ephemeral random key for development/test if not provided
    JWT_SECRET = crypto.randomBytes(32).toString("hex");
    console.warn("[Security Warning] JWT_SECRET not found in environment. Generated ephemeral development key.");
  }
}

if (JWT_SECRET.length < 32 && isProduction) {
  console.error("[CRITICAL FATAL] JWT_SECRET is too short (< 32 characters) for production use. Halting startup.");
  process.exit(1);
}

/**
 * Secure password hashing using Node 22 native crypto.scrypt
 */
function hashPassword(password) {
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Timing-safe cryptographic password verification
 */
function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string" || !stored.includes(":")) return false;
  try {
    const [salt, key] = stored.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Cryptographic token signing with HMAC-SHA256 and configurable expiration
 */
function signToken(payload, expiresInMs = 24 * 3600 * 1000) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Date.now();
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(now / 1000),
      exp: now + expiresInMs,
    })
  ).toString("base64url");

  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

/**
 * Cryptographic token verification with signature and expiration check
 */
function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  try {
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Strict Express authentication middleware with tenant isolation enforcement.
 * Rejects unauthenticated requests and validates tenant boundaries.
 */
function authenticate(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid session token.",
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session token. Please sign in again.",
    });
  }

  req.user = decoded;

  // Tenant Boundary Scoping:
  // Check if an explicit tenant was requested via X-Business-Id header or query
  const requestedBusinessId = Number(req.headers["x-business-id"]) || Number(req.query.x_bid) || decoded.businessId;

  // Super Admin check: If user has role 'admin' or email 'admin@zynthor.com', they can switch tenants
  const isSuperAdmin = decoded.role === "admin" || decoded.email === "admin@zynthor.com";

  if (requestedBusinessId && requestedBusinessId !== decoded.businessId && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Cross-tenant boundary violation. You do not have permission to access another establishment's data.",
    });
  }

  req.businessId = requestedBusinessId || decoded.businessId;
  next();
}

/**
 * Optional authentication middleware for public endpoints with personalized experiences
 */
function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.businessId = decoded.businessId;
    }
  }
  next();
}

/**
 * Strict role verification middleware
 */
function requireRole(allowedRoles = ["owner", "admin"]) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Access denied. Authentication required." });
    }
    // Super admin override
    if (req.user.email === "admin@zynthor.com") {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`,
      });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authenticate,
  optionalAuth,
  requireRole,
};