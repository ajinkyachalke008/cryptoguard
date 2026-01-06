import { NextRequest, NextResponse } from "next/server"

function generateMockAuditLogs(filters: {
  page: number
  limit: number
  action?: string
  adminId?: number
}) {
  const actions = [
    { action: 'suspend_user', description: 'Suspended user account' },
    { action: 'unsuspend_user', description: 'Unsuspended user account' },
    { action: 'block_user', description: 'Blocked user account' },
    { action: 'unblock_user', description: 'Unblocked user account' },
    { action: 'force_logout', description: 'Force logged out user' },
    { action: 'reset_password', description: 'Initiated password reset' },
    { action: 'view_details', description: 'Viewed user details' },
    { action: 'verify_email', description: 'Manually verified user email' },
    { action: 'resolve_alert', description: 'Resolved security alert' },
    { action: 'dismiss_alert', description: 'Dismissed security alert' },
    { action: 'terminate_session', description: 'Terminated user session' },
    { action: 'update_role', description: 'Updated user role' },
    { action: 'export_data', description: 'Exported user data' },
    { action: 'api_key_revoke', description: 'Revoked API key' }
  ]
  
  const reasons = [
    'Suspicious activity detected',
    'Terms of service violation',
    'User request',
    'Routine security check',
    'Compliance review',
    'Multiple failed login attempts',
    'Bot activity confirmed',
    'Account compromise suspected',
    null
  ]
  
  const logs = []
  const totalLogs = 200
  
  for (let i = 0; i < totalLogs; i++) {
    const actionData = actions[Math.floor(Math.random() * actions.length)]
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    const log = {
      id: totalLogs - i,
      adminUserId: filters.adminId || Math.floor(Math.random() * 10) + 1,
      adminEmail: `admin${Math.floor(Math.random() * 10) + 1}@cryptoguard.com`,
      targetUserId: Math.floor(Math.random() * 10000) + 1,
      targetEmail: `user${Math.floor(Math.random() * 10000)}@example.com`,
      action: actionData.action,
      actionDescription: actionData.description,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      details: {
        previousValue: actionData.action.includes('role') ? 'user' : undefined,
        newValue: actionData.action.includes('role') ? 'developer' : undefined,
        ipHash: `${Math.random().toString(36).substring(2, 10)}...`,
        sessionCount: actionData.action === 'force_logout' ? Math.floor(Math.random() * 5) + 1 : undefined
      },
      createdAt: createdAt.toISOString()
    }
    
    if (filters.action && filters.action !== 'all' && log.action !== filters.action) {
      continue
    }
    
    logs.push(log)
  }

  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const start = (filters.page - 1) * filters.limit
  const paginatedLogs = logs.slice(start, start + filters.limit)
  
  const actionCounts: Record<string, number> = {}
  logs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
  })
  
  return {
    logs: paginatedLogs,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: logs.length,
      totalPages: Math.ceil(logs.length / filters.limit)
    },
    summary: {
      total: logs.length,
      actionCounts,
      uniqueAdmins: new Set(logs.map(l => l.adminUserId)).size,
      uniqueTargets: new Set(logs.map(l => l.targetUserId)).size
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const action = searchParams.get('action') || undefined
  const adminId = searchParams.get('adminId') ? parseInt(searchParams.get('adminId')!) : undefined

  const result = generateMockAuditLogs({
    page,
    limit,
    action,
    adminId
  })

  return NextResponse.json(result)
}
