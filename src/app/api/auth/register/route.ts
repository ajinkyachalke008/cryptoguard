/**
 * POST /api/auth/register
 * 
 * Register a new user with email and password
 * Returns JWT token upon successful registration
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/middleware/authMiddleware';
import { handleError, validationError, conflictError } from '@/lib/middleware/errorMiddleware';
import { applyRateLimit } from '@/lib/middleware/rateLimitMiddleware';
import { isValidEmail, isValidPassword } from '@/lib/utils/validators';
import { logger } from '@/lib/utils/logger';

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    const body = await request.json();
    const { email, password, role = 'user' } = body;

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

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      throw validationError('Password does not meet requirements', {
        errors: passwordValidation.errors,
      });
    }

    // Validate role
    if (role !== 'user' && role !== 'admin') {
      throw validationError('Invalid role. Must be "user" or "admin"');
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    logger.info('Checking if user exists', { email: normalizedEmail });
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      throw conflictError('Email already registered');
    }

    // Hash password
    logger.debug('Hashing password');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    logger.info('Creating new user', { email: normalizedEmail, role });
    const now = new Date().toISOString();
    const newUser = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        role,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const user = newUser[0];

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'user' | 'admin',
    });

    const duration = Date.now() - startTime;
    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      duration,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, 'POST /api/auth/register');
  }
}
