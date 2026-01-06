import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, userSessions } from "@/db/schema"
import { desc, eq, and, sql, like, or, count } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const offset = (page - 1) * limit

  try {
    let whereClause = undefined
    
    if (status && status !== "all") {
      whereClause = eq(users.status, status)
    }

    if (search) {
      const searchPattern = `%${search}%`
      const searchClause = like(users.email, searchPattern)
      whereClause = whereClause ? and(whereClause, searchClause) : searchClause
    }

    const usersList = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      accountType: users.accountType,
      signupMethod: users.signupMethod,
      emailVerified: users.emailVerified,
      lastLoginAt: users.lastLoginAt,
      suspendedAt: users.suspendedAt,
      suspendReason: users.suspendReason,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

    // Add active session counts for each user
    const usersWithSessions = await Promise.all(usersList.map(async (u) => {
      const [sessionCount] = await db.select({ value: count() })
        .from(userSessions)
        .where(and(eq(userSessions.userId, u.id), eq(userSessions.isActive, true)))
      
      return {
        ...u,
        emailMasked: u.email.replace(/^(.)(.*)(.@.*)$/, (_, f, m, l) => f + "*".repeat(m.length) + l),
        activeSessions: sessionCount.value,
        loginCount: 0, // Simplified
        failedLoginCount: 0,
        riskScore: 0,
        flagged: false
      }
    }))

    const [totalCount] = await db.select({ value: sql`count(*)` }).from(users).where(whereClause)

    return NextResponse.json({ 
      users: usersWithSessions, 
      total: Number(totalCount?.value || 0) 
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
