import { NextRequest, NextResponse } from "next/server"

function generateMockAuthLogs(filters: {
  page: number
  limit: number
  eventType?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const eventTypes = ['login_success', 'login_failed', 'signup', 'logout', 'password_reset']
  const loginMethods = ['password', 'oauth_google', 'wallet']
  const deviceTypes = ['desktop', 'mobile', 'tablet']
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
  const oses = ['Windows 11', 'macOS 14', 'Ubuntu 22', 'iOS 17', 'Android 14']
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CN', name: 'China' },
    { code: 'RU', name: 'Russia' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' }
  ]
  
  const failureReasons = [
    'Invalid password',
    'Account locked',
    'Email not verified',
    'Rate limit exceeded',
    'Suspicious activity detected',
    'Invalid 2FA code'
  ]

  const riskFlagOptions = [
    ['multiple_failed'],
    ['new_device'],
    ['geo_anomaly'],
    ['multiple_failed', 'geo_anomaly'],
    ['new_device', 'geo_anomaly'],
    ['bot_activity'],
    []
  ]

  const logs = []
  const totalLogs = 500
  
  for (let i = 0; i < totalLogs; i++) {
    const eventType = filters.eventType && filters.eventType !== 'all' 
      ? filters.eventType 
      : eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const isSuccess = eventType === 'login_success' || eventType === 'signup' || eventType === 'logout'
    const country = countries[Math.floor(Math.random() * countries.length)]
    const hasRisk = Math.random() > 0.85
    
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    const log = {
      id: totalLogs - i,
      userId: Math.floor(Math.random() * 10000) + 1,
      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
      eventType,
      loginMethod: loginMethods[Math.floor(Math.random() * loginMethods.length)],
      ipHash: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      userAgent: `Mozilla/5.0 (${oses[Math.floor(Math.random() * oses.length)]})`,
      deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: oses[Math.floor(Math.random() * oses.length)],
      countryCode: country.code,
      countryName: country.name,
      regionCode: ['CA', 'NY', 'TX', 'FL', 'WA', 'IL'][Math.floor(Math.random() * 6)],
      failureReason: eventType === 'login_failed' ? failureReasons[Math.floor(Math.random() * failureReasons.length)] : null,
      riskFlags: hasRisk ? riskFlagOptions[Math.floor(Math.random() * riskFlagOptions.length)] : [],
      createdAt: timestamp.toISOString()
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!log.email.toLowerCase().includes(searchLower) && 
          !log.ipHash.toLowerCase().includes(searchLower)) {
        continue
      }
    }
    
    logs.push(log)
  }

  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const start = (filters.page - 1) * filters.limit
  const paginatedLogs = logs.slice(start, start + filters.limit)
  
  return {
    logs: paginatedLogs,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: logs.length,
      totalPages: Math.ceil(logs.length / filters.limit)
    },
    summary: {
      totalLogins: logs.filter(l => l.eventType === 'login_success').length,
      failedLogins: logs.filter(l => l.eventType === 'login_failed').length,
      signups: logs.filter(l => l.eventType === 'signup').length,
      riskyEvents: logs.filter(l => l.riskFlags.length > 0).length
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const eventType = searchParams.get('eventType') || undefined
  const search = searchParams.get('search') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  const result = generateMockAuthLogs({
    page,
    limit,
    eventType,
    search,
    startDate,
    endDate
  })

  return NextResponse.json(result)
}
