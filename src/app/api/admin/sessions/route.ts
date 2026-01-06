import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { userSessions, adminAuditLogs } from "@/db/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const active = searchParams.get("active") === "true"
  const offset = (page - 1) * limit

  try {
    const whereClause = active ? eq(userSessions.isActive, true) : undefined

    const sessions = await db.select()
      .from(userSessions)
      .where(whereClause)
      .orderBy(desc(userSessions.lastActivityAt))
      .limit(limit)
      .offset(offset)

    const [totalCount] = await db.select({ value: sql`count(*)` }).from(userSessions).where(whereClause)

    return NextResponse.json({ 
      sessions: sessions.map(s => ({
        ...s,
        userEmail: "Hidden (Forensic only)" // In a real app we'd join with users table
      })), 
      total: Number(totalCount?.value || 0) 
    })
  } catch (error) {
    console.error("Sessions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 })
    }

    await db.update(userSessions)
      .set({ 
        isActive: false, 
        terminatedAt: new Date().toISOString(), 
        terminatedBy: 'admin' 
      })
      .where(eq(userSessions.id, parseInt(sessionId)))

    // Log the action
    await db.insert(adminAuditLogs).values({
      adminUserId: auth.user!.id,
      action: 'terminate_session',
      details: { sessionId },
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, message: "Session terminated successfully." })
  } catch (error) {
    console.error("Session termination error:", error)
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 })
  }
}
