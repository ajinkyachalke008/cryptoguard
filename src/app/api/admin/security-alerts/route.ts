import { NextRequest, NextResponse } from "next/server"

function generateMockSecurityAlerts(filters: {
  page: number
  limit: number
  severity?: string
  status?: string
}) {
  const alertTypes = [
    { type: 'multiple_failed_logins', description: 'Multiple failed login attempts detected' },
    { type: 'geo_anomaly', description: 'Login from unusual geographic location' },
    { type: 'bot_activity', description: 'Automated/bot-like login patterns detected' },
    { type: 'brute_force', description: 'Potential brute force attack detected' },
    { type: 'new_device', description: 'Login from new device in high-risk region' },
    { type: 'impossible_travel', description: 'Login from geographically distant locations in short time' },
    { type: 'suspicious_ip', description: 'Login from known suspicious IP range' },
    { type: 'rate_limit_exceeded', description: 'API rate limit exceeded multiple times' }
  ]
  
  const severities = ['low', 'medium', 'high', 'critical']
  const statuses = ['active', 'resolved', 'dismissed']
  const countries = ['CN', 'RU', 'NG', 'BR', 'IN', 'US', 'GB', 'DE']
  
  const alerts = []
  const totalAlerts = 100
  
  for (let i = 0; i < totalAlerts; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = filters.severity && filters.severity !== 'all'
      ? filters.severity
      : severities[Math.floor(Math.random() * severities.length)]
    const status = filters.status && filters.status !== 'all'
      ? filters.status
      : statuses[Math.floor(Math.random() * statuses.length)]
    
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    const alert = {
      id: totalAlerts - i,
      userId: Math.floor(Math.random() * 10000) + 1,
      userEmail: `user${Math.floor(Math.random() * 10000)}@example.com`,
      alertType: alertType.type,
      description: alertType.description,
      severity,
      status,
      metadata: {
        ipHash: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        failedAttempts: alertType.type === 'multiple_failed_logins' ? Math.floor(Math.random() * 10) + 3 : undefined,
        deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        browser: ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)]
      },
      resolvedBy: status === 'resolved' ? Math.floor(Math.random() * 100) + 1 : null,
      resolvedAt: status !== 'active' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: createdAt.toISOString()
    }
    
    alerts.push(alert)
  }

  alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (a.status === 'active' && b.status !== 'active') return -1
    if (b.status === 'active' && a.status !== 'active') return 1
    return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
  })
  
  const start = (filters.page - 1) * filters.limit
  const paginatedAlerts = alerts.slice(start, start + filters.limit)
  
  return {
    alerts: paginatedAlerts,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: alerts.length,
      totalPages: Math.ceil(alerts.length / filters.limit)
    },
    summary: {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const severity = searchParams.get('severity') || undefined
  const status = searchParams.get('status') || undefined

  const result = generateMockSecurityAlerts({
    page,
    limit,
    severity,
    status
  })

  return NextResponse.json(result)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { alertId, action, reason } = body
  
  if (!['resolve', 'dismiss', 'reopen'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Alert ${alertId} has been ${action}ed`,
    alertId
  })
}
