import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = parseInt(id)
  
  const countries = ['US', 'GB', 'DE', 'FR', 'CN', 'RU', 'IN', 'BR', 'JP', 'KR']
  const statuses = ['active', 'suspended', 'blocked', 'pending_verification']
  const roles = ['user', 'developer', 'enterprise', 'admin']
  
  const user = {
    id: userId,
    email: `user${userId}@example.com`,
    emailMasked: `use***${userId % 100}@***.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    accountType: ['user', 'developer', 'enterprise'][Math.floor(Math.random() * 3)],
    signupMethod: ['email', 'oauth_google', 'wallet'][Math.floor(Math.random() * 3)],
    emailVerified: Math.random() > 0.15,
    lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginCountry: countries[Math.floor(Math.random() * countries.length)],
    loginCount: Math.floor(Math.random() * 500) + 1,
    failedLoginCount: Math.floor(Math.random() * 10),
    activeSessions: Math.floor(Math.random() * 5),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    riskScore: Math.floor(Math.random() * 100),
    flagged: Math.random() > 0.9,
    recentActivity: [
      { type: 'login', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), details: 'Successful login from Chrome/Windows' },
      { type: 'scan', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), details: 'Wallet scan: 0x1234...5678' },
      { type: 'api_call', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), details: 'API key used: risk-analysis endpoint' },
    ],
    securityEvents: Math.random() > 0.7 ? [
      { type: 'failed_login', count: Math.floor(Math.random() * 5) + 1, lastOccurrence: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'geo_anomaly', count: 1, lastOccurrence: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString() }
    ] : []
  }

  return NextResponse.json(user)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action, reason } = body
  
  const validActions = ['suspend', 'unsuspend', 'block', 'unblock', 'force_logout', 'reset_password', 'verify_email']
  
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  
  const auditLog = {
    adminUserId: 1,
    targetUserId: parseInt(id),
    action,
    reason: reason || null,
    createdAt: new Date().toISOString()
  }
  
  let resultMessage = ''
  switch (action) {
    case 'suspend':
      resultMessage = `User ${id} has been suspended${reason ? `: ${reason}` : ''}`
      break
    case 'unsuspend':
      resultMessage = `User ${id} has been unsuspended`
      break
    case 'block':
      resultMessage = `User ${id} has been blocked${reason ? `: ${reason}` : ''}`
      break
    case 'unblock':
      resultMessage = `User ${id} has been unblocked`
      break
    case 'force_logout':
      resultMessage = `All sessions for user ${id} have been terminated`
      break
    case 'reset_password':
      resultMessage = `Password reset initiated for user ${id}`
      break
    case 'verify_email':
      resultMessage = `Email verified for user ${id}`
      break
  }

  return NextResponse.json({
    success: true,
    message: resultMessage,
    auditLog
  })
}
