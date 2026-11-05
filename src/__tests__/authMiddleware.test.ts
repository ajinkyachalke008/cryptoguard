import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken, ADMIN_WHITELIST } from '../lib/middleware/authMiddleware';

describe('AuthMiddleware — Token & Role Enforcement', () => {
  it('enforces admin role only for whitelisted emails', () => {
    // Whitelisted admin
    const whitelistedAdmin = {
      id: 1,
      email: 'ajinkyachalke008@gmail.com',
      role: 'admin' as const
    };
    const adminToken = generateToken(whitelistedAdmin);
    const decodedAdmin = verifyToken(adminToken);
    expect(decodedAdmin).not.toBeNull();
    expect(decodedAdmin?.role).toBe('admin');

    // Non-whitelisted user attempting admin role
    const attackerUser = {
      id: 99,
      email: 'hacker@malicious-domain.com',
      role: 'admin' as const
    };
    const demotedToken = generateToken(attackerUser);
    const decodedDemoted = verifyToken(demotedToken);
    expect(decodedDemoted).not.toBeNull();
    expect(decodedDemoted?.role).toBe('user'); // Must be demoted to user
  });

  it('rejects invalid or corrupted JWT tokens gracefully without crashing', () => {
    const invalidToken = 'eyInvalidPayload.NotRealToken';
    const result = verifyToken(invalidToken);
    expect(result).toBeNull();
  });

  it('contains the authorized admin emails in the whitelist', () => {
    expect(ADMIN_WHITELIST).toContain('ajinkyachalke008@gmail.com');
    expect(ADMIN_WHITELIST).toContain('ajinkyachalke94@gmail.com');
    expect(ADMIN_WHITELIST.length).toBe(2);
  });
});
