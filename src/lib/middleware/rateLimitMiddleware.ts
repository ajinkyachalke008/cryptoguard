/**
 * Rate Limit Middleware
 * 
 * Prevents abuse by limiting the number of requests per IP address
 * Stricter limits for anonymous users, more generous for authenticated users
 * Uses in-memory storage for rate limiting (consider Redis for production)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';
import type { AuthenticatedUser } from './authMiddleware';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limits
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
const RATE_LIMITS = {
  anonymous: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
  },
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500, // 500 requests per 15 minutes
  },
};

/**
 * Clean up expired entries from rate limit store
 * Run periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest, user?: AuthenticatedUser): string {
  if (user) {
    return `user:${user.id}`;
  }

  // Get IP address from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Get rate limit config based on user type
 */
function getRateLimitConfig(user?: AuthenticatedUser): {
  windowMs: number;
  maxRequests: number;
} {
  if (user?.role === 'admin') {
    return RATE_LIMITS.admin;
  }
  if (user) {
    return RATE_LIMITS.authenticated;
  }
  return RATE_LIMITS.anonymous;
}

/**
 * Check rate limit for client
 */
export function checkRateLimit(
  request: NextRequest,
  user?: AuthenticatedUser
): {
  allowed: boolean;
  response?: NextResponse;
  remaining?: number;
  resetTime?: number;
} {
  const clientId = getClientIdentifier(request, user);
  const config = getRateLimitConfig(user);
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, entry);
  }

  // Increment request count
  entry.count++;

  // Calculate remaining requests
  const remaining = Math.max(0, config.maxRequests - entry.count);

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    logger.warn('Rate limit exceeded', {
      clientId,
      count: entry.count,
      limit: config.maxRequests,
      retryAfter,
    });

    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      ),
    };
  }

  logger.debug('Rate limit check passed', {
    clientId,
    count: entry.count,
    remaining,
  });

  return {
    allowed: true,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Apply rate limit middleware
 * Returns response with rate limit headers if allowed
 */
export function applyRateLimit(
  request: NextRequest,
  user?: AuthenticatedUser
): NextResponse | null {
  const result = checkRateLimit(request, user);

  if (!result.allowed) {
    return result.response!;
  }

  // Rate limit passed, return null (no error)
  return null;
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  user?: AuthenticatedUser
): NextResponse {
  const clientId = getClientIdentifier(request, user);
  const config = getRateLimitConfig(user);
  const entry = rateLimitStore.get(clientId);

  if (entry) {
    const remaining = Math.max(0, config.maxRequests - entry.count);
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
  }

  return response;
}

/**
 * Reset rate limit for a specific client (admin function)
 */
export function resetRateLimit(clientId: string): void {
  rateLimitStore.delete(clientId);
  logger.info('Rate limit reset', { clientId });
}

/**
 * Get current rate limit status for client
 */
export function getRateLimitStatus(
  request: NextRequest,
  user?: AuthenticatedUser
): {
  limit: number;
  remaining: number;
  reset: number;
  blocked: boolean;
} {
  const clientId = getClientIdentifier(request, user);
  const config = getRateLimitConfig(user);
  const entry = rateLimitStore.get(clientId);

  if (!entry) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
      blocked: false,
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const blocked = entry.count > config.maxRequests;

  return {
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
    blocked,
  };
}
