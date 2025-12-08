/**
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/middleware/authMiddleware';
import { handleError, validationError, authError } from '@/lib/middleware/errorMiddleware';
import { applyRateLimit } from '@/lib/middleware/rateLimitMiddleware';
import { isValidEmail } from '@/lib/utils/validators';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting (stricter for login to prevent brute force)
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      throw validationError('Email is required');
    }

    if (!isValidEmail(email)) {
      throw validationError('Invalid email format');
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      throw validationError('Password is required');
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    logger.info('Login attempt', { email: normalizedEmail });
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length === 0) {
      logger.warn('Login failed: user not found', { email: normalizedEmail });
      throw authError('Invalid email or password');
    }

    const user = existingUser[0];

    // Verify password
    logger.debug('Verifying password');
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      logger.warn('Login failed: incorrect password', {
        email: normalizedEmail,
        userId: user.id,
      });
      throw authError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'user' | 'admin',
    });

    // Update last login timestamp
    const now = new Date().toISOString();
    await db
      .update(users)
      .set({ updatedAt: now })
      .where(eq(users.id, user.id));

    const duration = Date.now() - startTime;
    logger.info('Login successful', {
      userId: user.id,
      email: user.email,
      role: user.role,
      duration,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'POST /api/auth/login');
  }
}
