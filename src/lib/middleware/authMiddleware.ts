/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens from Authorization header
 * Attaches user information to request for downstream handlers
 * Rejects unauthorized requests with proper error codes
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Verify JWT token and extract user info
 */
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    logger.warn('Invalid JWT token', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer TOKEN" and "TOKEN" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Middleware: Require authentication
 * Returns user object if authenticated, otherwise returns error response
 */
export function requireAuth(request: NextRequest): {
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
} {
  const token = extractToken(request);

  if (!token) {
    logger.warn('No authentication token provided');
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Please provide a valid authentication token' 
        },
        { status: 401 }
      ),
    };
  }

  const user = verifyToken(token);

  if (!user) {
    logger.warn('Invalid authentication token');
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          error: 'Invalid authentication token',
          code: 'INVALID_TOKEN',
          message: 'Your authentication token is invalid or has expired' 
        },
        { status: 401 }
      ),
    };
  }

  logger.debug('User authenticated', { userId: user.id, email: user.email });
  return {
    authenticated: true,
    user,
  };
}

/**
 * Middleware: Require admin role
 */
export function requireAdmin(request: NextRequest): {
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
} {
  const authResult = requireAuth(request);

  if (!authResult.authenticated || !authResult.user) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    logger.warn('Non-admin user attempted to access admin endpoint', {
      userId: authResult.user.id,
      role: authResult.user.role,
    });
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'ADMIN_REQUIRED',
          message: 'This endpoint requires administrator privileges' 
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Middleware: Optional authentication
 * Attaches user if token is valid, but doesn't reject if not authenticated
 */
export function optionalAuth(request: NextRequest): {
  user?: AuthenticatedUser;
} {
  const token = extractToken(request);

  if (!token) {
    return { user: undefined };
  }

  const user = verifyToken(token);
  return { user: user || undefined };
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
}

/**
 * Helper: Check if user has permission for resource
 */
export function hasPermission(user: AuthenticatedUser, resourceUserId?: number | null): boolean {
  // Admins have access to everything
  if (user.role === 'admin') {
    return true;
  }

  // Users can only access their own resources
  if (resourceUserId !== null && resourceUserId !== undefined) {
    return user.id === resourceUserId;
  }

  // If no resource user specified, allow access
  return true;
}
