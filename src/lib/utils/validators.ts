/**
 * Validation Utilities
 * 
 * Provides validation functions for wallet addresses, transaction hashes,
 * email addresses, passwords, and other input data.
 */

import { ethers } from 'ethers';

/**
 * Validate Ethereum-like wallet address
 * Works for Ethereum, BSC, Polygon, and other EVM chains
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    // ethers.js validates the address format and checksum
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate transaction hash format
 * Standard 0x-prefixed 64-character hex string
 */
export function isValidTransactionHash(txHash: string): boolean {
  if (!txHash || typeof txHash !== 'string') {
    return false;
  }

  // Transaction hash should be 0x followed by 64 hex characters
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(txHash);
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate blockchain chain name
 */
export function isValidChain(chain: string): boolean {
  const validChains = ['eth', 'bsc', 'polygon', 'avalanche', 'arbitrum', 'optimism'];
  return validChains.includes(chain.toLowerCase());
}

/**
 * Validate risk level enum
 */
export function isValidRiskLevel(level: string): boolean {
  const validLevels = ['low', 'medium', 'high', 'critical'];
  return validLevels.includes(level.toLowerCase());
}

/**
 * Validate risk score range (0-100)
 */
export function isValidRiskScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100 && Number.isInteger(score);
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: string | number, offset?: string | number): {
  valid: boolean;
  limit: number;
  offset: number;
  errors: string[];
} {
  const errors: string[] = [];
  let validatedLimit = 20; // default
  let validatedOffset = 0; // default

  // Validate limit
  if (limit !== undefined && limit !== null) {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      errors.push('Limit must be a positive integer');
    } else if (parsedLimit > 100) {
      errors.push('Limit cannot exceed 100');
    } else {
      validatedLimit = parsedLimit;
    }
  }

  // Validate offset
  if (offset !== undefined && offset !== null) {
    const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      errors.push('Offset must be a non-negative integer');
    } else {
      validatedOffset = parsedOffset;
    }
  }

  return {
    valid: errors.length === 0,
    limit: validatedLimit,
    offset: validatedOffset,
    errors,
  };
}
