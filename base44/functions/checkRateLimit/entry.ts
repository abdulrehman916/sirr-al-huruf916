import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * IP-based rate limiting middleware for authentication endpoints.
 * Uses Redis-style in-memory cache with TTL for tracking request counts.
 * 
 * Limits:
 * - OTP requests: 5 per hour per IP + 5 per hour per contact
 * - Login attempts: 10 per hour per IP
 * - Registration: 3 per hour per IP
 */

const RATE_LIMITS = {
  OTP_REQUEST: { window: 60 * 60 * 1000, max: 5 },      // 5 per hour
  LOGIN_ATTEMPT: { window: 60 * 60 * 1000, max: 10 },   // 10 per hour
  REGISTRATION: { window: 60 * 60 * 1000, max: 3 },     // 3 per hour
  EMAIL_VERIFY: { window: 60 * 60 * 1000, max: 5 },     // 5 per hour
};

const cache = new Map();

function getIpKey(ip) {
  return `ip:${ip}`;
}

function getContactKey(contact) {
  return `contact:${contact}`;
}

function checkRateLimit(key, limit) {
  const now = Date.now();
  const entry = cache.get(key);
  
  if (!entry || now > entry.windowEnd) {
    cache.set(key, { count: 1, windowEnd: now + limit.window });
    return { allowed: true, remaining: limit.max - 1, resetAt: now + limit.window };
  }
  
  if (entry.count >= limit.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowEnd,
      retryAfter: Math.ceil((entry.windowEnd - now) / 1000)
    };
  }
  
  entry.count++;
  return { allowed: true, remaining: limit.max - entry.count, resetAt: entry.windowEnd };
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.windowEnd) {
      cache.delete(key);
    }
  }
}

// Auto-cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, 10 * 60 * 1000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { endpoint_type, contact } = await req.json();
    
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipKey = getIpKey(ip);
    
    let limitConfig;
    switch (endpoint_type) {
      case 'OTP_REQUEST':
        limitConfig = RATE_LIMITS.OTP_REQUEST;
        break;
      case 'LOGIN_ATTEMPT':
        limitConfig = RATE_LIMITS.LOGIN_ATTEMPT;
        break;
      case 'REGISTRATION':
        limitConfig = RATE_LIMITS.REGISTRATION;
        break;
      case 'EMAIL_VERIFY':
        limitConfig = RATE_LIMITS.EMAIL_VERIFY;
        break;
      default:
        return Response.json({ error: 'Invalid endpoint_type' }, { status: 400 });
    }
    
    // Check IP-based limit
    const ipResult = checkRateLimit(ipKey, limitConfig);
    if (!ipResult.allowed) {
      return Response.json({
        success: false,
        rate_limited: true,
        reason: 'Too many requests from your IP',
        retry_after: ipResult.retryAfter,
        reset_at: new Date(ipResult.resetAt).toISOString()
      }, { status: 429 });
    }
    
    // Check contact-based limit (for OTP/registration)
    if (contact) {
      const contactKey = getContactKey(contact);
      const contactResult = checkRateLimit(contactKey, limitConfig);
      if (!contactResult.allowed) {
        return Response.json({
          success: false,
          rate_limited: true,
          reason: 'Too many requests for this contact',
          retry_after: contactResult.retryAfter,
          reset_at: new Date(contactResult.resetAt).toISOString()
        }, { status: 429 });
      }
    }
    
    return Response.json({
      success: true,
      rate_limit: {
        remaining: ipResult.remaining,
        reset_at: new Date(ipResult.resetAt).toISOString()
      }
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});