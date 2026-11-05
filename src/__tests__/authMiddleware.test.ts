import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateToken,
  verifyToken,
  getAdminWhitelist,
  isWhitelistedAdmin,
  ADMIN_WHITELIST
} from '../lib/middleware/authMiddleware';

describe('AuthMiddleware — Token & Role Enforcement', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enforces admin role only for whitelisted emails by default', () => {
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

  it('contains the authorized default admin emails', () => {
    expect(ADMIN_WHITELIST).toContain('ajinkyachalke008@gmail.com');
    expect(ADMIN_WHITELIST).toContain('ajinkyachalke94@gmail.com');
    expect(isWhitelistedAdmin('ajinkyachalke008@gmail.com')).toBe(true);
    expect(isWhitelistedAdmin('ajinkyachalke94@gmail.com')).toBe(true);
    expect(isWhitelistedAdmin('AJINKYACHALKE008@GMAIL.COM')).toBe(true); // Case-insensitive
    expect(isWhitelistedAdmin('unknown@random.org')).toBe(false);
    expect(isWhitelistedAdmin(null)).toBe(false);
    expect(isWhitelistedAdmin(undefined)).toBe(false);
  });

  it('supports dynamic ADMIN_WHITELIST environment variable override', () => {
    vi.stubEnv('ADMIN_WHITELIST', 'ops_lead@cryptoguard.io,  security_auditor@certik.com  ');

    const dynamicAdmins = getAdminWhitelist();
    expect(dynamicAdmins).toHaveLength(2);
    expect(dynamicAdmins).toContain('ops_lead@cryptoguard.io');
    expect(dynamicAdmins).toContain('security_auditor@certik.com');

    expect(isWhitelistedAdmin('ops_lead@cryptoguard.io')).toBe(true);
    expect(isWhitelistedAdmin('security_auditor@certik.com')).toBe(true);

    // Dynamic token generation grants admin to the new env admin
    const newAdminToken = generateToken({
      id: 5,
      email: 'ops_lead@cryptoguard.io',
      role: 'admin'
    });
    const decodedNewAdmin = verifyToken(newAdminToken);
    expect(decodedNewAdmin?.role).toBe('admin');

    // Unlisted email is rejected
    expect(isWhitelistedAdmin('ajinkyachalke008@gmail.com')).toBe(false);
  });
});
