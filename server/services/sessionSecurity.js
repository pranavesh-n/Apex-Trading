import crypto from 'crypto';
import { queryD1, isD1Configured } from './d1Client.js';

// Secret key for HMAC fingerprinting (fallback to random if not set)
const SESSION_SECRET = process.env.SESSION_SECRET || 'ax_trade_ultra_secure_session_salt_2026_finance';
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory cache for sub-millisecond lookup
const sessionCache = new Map();

/**
 * Generate cryptographic device & network fingerprint
 */
export function generateFingerprint(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${ip}:${userAgent}`)
    .digest('hex');
}

/**
 * Create a new secure session with anti-hijack protection
 */
export async function createSecureSession(req, res, user) {
  const sessionId = 'ax_sec_' + crypto.randomBytes(32).toString('hex');
  const fingerprint = generateFingerprint(req);
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] || 'unknown').slice(0, 255);
  const expiresAt = Date.now() + SESSION_LIFETIME_MS;

  const sessionData = {
    id: sessionId,
    userId: user.id,
    user,
    fingerprint,
    ip,
    userAgent,
    expiresAt
  };

  // 1. Cache in memory
  sessionCache.set(sessionId, sessionData);

  // 2. Persist to Cloudflare D1
  if (isD1Configured()) {
    try {
      await queryD1(
        `INSERT INTO sessions (id, user_id, fingerprint, ip, user_agent, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, user.id, fingerprint, ip, userAgent, expiresAt]
      );
    } catch (err) {
      console.error('Failed to save session to D1:', err.message);
    }
  }

  // 3. Set HttpOnly, SameSite cookie (JavaScript CANNOT touch this)
  res.cookie('ax_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_LIFETIME_MS,
    path: '/'
  });

  return { sessionId, user };
}

/**
 * Anti-Session-Hijacking Verification Middleware
 */
export async function authenticateSession(req, res, next) {
  // Extract token from HttpOnly cookie, or Authorization header fallback
  let token = req.cookies?.ax_session;
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '').trim();
  }

  if (!token) {
    req.user = null;
    return next();
  }

  // 1. Check memory cache first
  let session = sessionCache.get(token);

  // 2. Fallback to Cloudflare D1
  if (!session && isD1Configured()) {
    try {
      const rows = await queryD1(
        `SELECT s.*, u.email, u.name, u.picture 
         FROM sessions s
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.expires_at > ?`,
        [token, Date.now()]
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        session = {
          id: row.id,
          userId: row.user_id,
          user: {
            id: row.user_id,
            email: row.email,
            name: row.name,
            picture: row.picture
          },
          fingerprint: row.fingerprint,
          ip: row.ip,
          userAgent: row.user_agent,
          expiresAt: row.expires_at
        };
        sessionCache.set(token, session);
      }
    } catch (err) {
      console.error('Session lookup error in D1:', err.message);
    }
  }

  if (!session) {
    res.clearCookie('ax_session');
    req.user = null;
    return next();
  }

  // 3. Check session expiration
  if (Date.now() > session.expiresAt) {
    sessionCache.delete(token);
    res.clearCookie('ax_session');
    req.user = null;
    return next();
  }

  // 4. CRITICAL: Anti-Hijacking Fingerprint Verification
  // If an attacker stole the session cookie, their IP and/or User-Agent will not match!
  const currentFingerprint = generateFingerprint(req);
  if (session.fingerprint !== currentFingerprint) {
    console.warn(`[SECURITY ALERT] Possible Session Hijacking Attempt Detected for user ${session.userId}!`);
    console.warn(`Original IP/Agent vs Current mismatch.`);
    
    // Revoke compromised session immediately
    sessionCache.delete(token);
    if (isD1Configured()) {
      queryD1('DELETE FROM sessions WHERE id = ?', [token]).catch(() => {});
    }
    res.clearCookie('ax_session');
    
    return res.status(401).json({
      success: false,
      error: 'Security verification failed. Please sign in again.'
    });
  }

  req.user = session.user;
  req.sessionId = token;
  next();
}

/**
 * Revoke and clear session (Sign Out)
 */
export async function destroySession(req, res) {
  const token = req.cookies?.ax_session || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    sessionCache.delete(token);
    if (isD1Configured()) {
      queryD1('DELETE FROM sessions WHERE id = ?', [token]).catch(() => {});
    }
  }

  res.clearCookie('ax_session', { path: '/' });
  return true;
}
