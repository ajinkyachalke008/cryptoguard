/**
 * Error Middleware
 * 
 * Centralized error handling for API routes
 * Logs errors, sanitizes error messages, and returns consistent JSON error responses
 * Prevents leaking internal error details in production
 */

import { NextResponse } from 'next/server';
import { logger } from '../utils/logger';

export interface APIError {
  error: string;
  code?: string;
  message?: string;
  details?: any;
  statusCode: number;
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication errors (401)
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization errors (403)
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // Service errors (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

/**
 * Custom API Error class
 */
export class APIErrorClass extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCodes.INTERNAL_ERROR,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle errors and return appropriate JSON response
 */
export function handleError(error: any, context?: string): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log the error
  logger.error(`Error in ${context || 'API route'}`, {
    error: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
  });

  // Determine status code
  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_ERROR;
  let message = 'An internal server error occurred';
  let details: any = undefined;

  if (error instanceof APIErrorClass) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ErrorCodes.AUTH_REQUIRED;
    message = 'Authentication required';
  } else if (error.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    errorCode = ErrorCodes.DUPLICATE_ENTRY;
    message = 'Resource already exists';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorCode = ErrorCodes.NOT_FOUND;
    message = error.message;
  }

  // Build error response
  const errorResponse: any = {
    error: message,
    code: errorCode,
  };

  // Include details in development mode
  if (isDevelopment) {
    errorResponse.details = details || error.message;
    errorResponse.stack = error.stack;
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Wrap async handler with error catching
 */
export function asyncHandler(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, 'Async handler');
    }
  };
}

/**
 * Validation error helper
 */
export function validationError(message: string, details?: any): APIErrorClass {
  return new APIErrorClass(message, 400, ErrorCodes.VALIDATION_ERROR, details);
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string): APIErrorClass {
  return new APIErrorClass(
    `${resource} not found`,
    404,
    ErrorCodes.NOT_FOUND
  );
}

/**
 * Authentication error helper
 */
export function authError(message: string = 'Authentication required'): APIErrorClass {
  return new APIErrorClass(message, 401, ErrorCodes.AUTH_REQUIRED);
}

/**
 * Authorization error helper
 */
export function forbiddenError(message: string = 'Insufficient permissions'): APIErrorClass {
  return new APIErrorClass(message, 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
}

/**
 * Conflict error helper
 */
export function conflictError(message: string, details?: any): APIErrorClass {
  return new APIErrorClass(message, 409, ErrorCodes.ALREADY_EXISTS, details);
}

/**
 * Rate limit error helper
 */
export function rateLimitError(retryAfter: number): APIErrorClass {
  return new APIErrorClass(
    'Too many requests. Please try again later.',
    429,
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    { retryAfter }
  );
}

/**
 * Service unavailable error helper
 */
export function serviceUnavailableError(service: string): APIErrorClass {
  return new APIErrorClass(
    `${service} is temporarily unavailable`,
    503,
    ErrorCodes.SERVICE_UNAVAILABLE
  );
}

/**
 * Database error helper
 */
export function databaseError(message: string, details?: any): APIErrorClass {
  return new APIErrorClass(
    'Database operation failed',
    500,
    ErrorCodes.DATABASE_ERROR,
    process.env.NODE_ENV === 'development' ? { message, details } : undefined
  );
}

/**
 * External API error helper
 */
export function externalAPIError(service: string, details?: any): APIErrorClass {
  return new APIErrorClass(
    `Failed to communicate with ${service}`,
    500,
    ErrorCodes.EXTERNAL_API_ERROR,
    process.env.NODE_ENV === 'development' ? details : undefined
  );
}
