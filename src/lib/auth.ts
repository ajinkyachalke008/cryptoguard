import { NextRequest } from 'next/server';

// Mock authentication helper for API routes
// In production, this would validate JWT tokens or session cookies
export async function getCurrentUser(request: NextRequest) {
  // For now, return a mock user with id: 1
  // This will be replaced when proper authentication is added
  return {
    id: 1,
    email: 'demo@cryptoguard.com',
    name: 'Demo User'
  };
}

// Helper to check if user is authenticated
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null;
}
