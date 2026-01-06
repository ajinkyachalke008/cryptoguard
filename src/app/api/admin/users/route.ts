import { NextRequest, NextResponse } from "next/server"

function generateMockUsers(filters: {
  page: number
  limit: number
  status?: string
  search?: string
  role?: string
}) {
  const statuses = ['active', 'suspended', 'blocked', 'pending_verification']
  const roles = ['user', 'developer', 'enterprise', 'admin']
  const accountTypes = ['user', 'developer', 'enterprise']
  const signupMethods = ['email', 'oauth_google', 'wallet']
  const countries = ['US', 'GB', 'DE', 'FR', 'CN', 'RU', 'IN', 'BR', 'JP', 'KR']

  const users = []
  const totalUsers = 250
  
  for (let i = 0; i < totalUsers; i++) {
    const status = filters.status && filters.status !== 'all'
      ? filters.status
      : statuses[Math.floor(Math.random() * statuses.length)]
    
    const role = filters.role && filters.role !== 'all'
      ? filters.role
      : roles[Math.floor(Math.random() * roles.length)]
    
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    const lastLoginAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    const user = {
      id: totalUsers - i,
      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
      emailMasked: `use***${Math.floor(Math.random() * 100)}@***.com`,
      role,
      status,
      accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
      signupMethod: signupMethods[Math.floor(Math.random() * signupMethods.length)],
      emailVerified: Math.random() > 0.15,
      lastLoginAt: lastLoginAt.toISOString(),
      lastLoginCountry: countries[Math.floor(Math.random() * countries.length)],
      loginCount: Math.floor(Math.random() * 500) + 1,
      failedLoginCount: Math.floor(Math.random() * 10),
      activeSessions: Math.floor(Math.random() * 5),
      suspendedAt: status === 'suspended' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      suspendReason: status === 'suspended' ? ['Suspicious activity', 'Terms violation', 'Multiple failed logins', 'Bot activity'][Math.floor(Math.random() * 4)] : null,
      createdAt: createdAt.toISOString(),
      riskScore: Math.floor(Math.random() * 100),
      flagged: Math.random() > 0.9
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!user.email.toLowerCase().includes(searchLower) && 
          !user.id.toString().includes(searchLower)) {
        continue
      }
    }
    
    users.push(user)
  }

  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const start = (filters.page - 1) * filters.limit
  const paginatedUsers = users.slice(start, start + filters.limit)
  
  return {
    users: paginatedUsers,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: users.length,
      totalPages: Math.ceil(users.length / filters.limit)
    },
    summary: {
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      blocked: users.filter(u => u.status === 'blocked').length,
      pending: users.filter(u => u.status === 'pending_verification').length,
      flagged: users.filter(u => u.flagged).length
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined
  const role = searchParams.get('role') || undefined

  const result = generateMockUsers({
    page,
    limit,
    status,
    search,
    role
  })

  return NextResponse.json(result)
}
