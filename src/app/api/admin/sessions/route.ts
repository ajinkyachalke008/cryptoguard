import { NextRequest, NextResponse } from "next/server"

function generateMockSessions(filters: {
  page: number
  limit: number
  userId?: number
  active?: boolean
}) {
  const deviceTypes = ['desktop', 'mobile', 'tablet']
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
  const oses = ['Windows 11', 'macOS 14', 'Ubuntu 22', 'iOS 17', 'Android 14']
  const countries = ['US', 'GB', 'DE', 'FR', 'CN', 'RU', 'IN', 'BR', 'JP', 'KR']
  
  const sessions = []
  const totalSessions = 150
  
  for (let i = 0; i < totalSessions; i++) {
    const isActive = filters.active !== undefined ? filters.active : Math.random() > 0.3
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const lastActivity = new Date(Date.now() - Math.random() * 60 * 60 * 1000)
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
    
    const session = {
      id: totalSessions - i,
      userId: filters.userId || Math.floor(Math.random() * 10000) + 1,
      userEmail: `user${filters.userId || Math.floor(Math.random() * 10000)}@example.com`,
      sessionToken: `sess_${Math.random().toString(36).substring(2, 15)}`,
      ipHash: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      userAgent: `Mozilla/5.0 (${oses[Math.floor(Math.random() * oses.length)]})`,
      deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: oses[Math.floor(Math.random() * oses.length)],
      countryCode: countries[Math.floor(Math.random() * countries.length)],
      lastActivityAt: lastActivity.toISOString(),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive,
      terminatedBy: !isActive ? ['user', 'admin', 'system'][Math.floor(Math.random() * 3)] : null,
      terminatedAt: !isActive ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null
    }
    
    sessions.push(session)
  }

  sessions.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
  
  const start = (filters.page - 1) * filters.limit
  const paginatedSessions = sessions.slice(start, start + filters.limit)
  
  return {
    sessions: paginatedSessions,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: sessions.length,
      totalPages: Math.ceil(sessions.length / filters.limit)
    },
    summary: {
      active: sessions.filter(s => s.isActive).length,
      terminated: sessions.filter(s => !s.isActive).length,
      byDevice: {
        desktop: sessions.filter(s => s.deviceType === 'desktop').length,
        mobile: sessions.filter(s => s.deviceType === 'mobile').length,
        tablet: sessions.filter(s => s.deviceType === 'tablet').length
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined
  const active = searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined

  const result = generateMockSessions({
    page,
    limit,
    userId,
    active
  })

  return NextResponse.json(result)
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { sessionIds, userId, terminateAll } = body
  
  if (terminateAll && userId) {
    return NextResponse.json({
      success: true,
      message: `All sessions for user ${userId} have been terminated`,
      terminatedCount: Math.floor(Math.random() * 5) + 1
    })
  }
  
  if (sessionIds && sessionIds.length > 0) {
    return NextResponse.json({
      success: true,
      message: `${sessionIds.length} session(s) have been terminated`,
      terminatedCount: sessionIds.length
    })
  }
  
  return NextResponse.json({ error: 'No sessions specified' }, { status: 400 })
}
