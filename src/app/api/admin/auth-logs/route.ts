import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { authLogs } from "@/db/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const eventType = searchParams.get("eventType")
  const offset = (page - 1) * limit

  try {
    const whereClause = eventType && eventType !== "all" ? eq(authLogs.eventType, eventType) : undefined

    const logs = await db.select()
      .from(authLogs)
      .where(whereClause)
      .orderBy(desc(authLogs.createdAt))
      .limit(limit)
      .offset(offset)

    const [totalCount] = await db.select({ value: sql`count(*)` }).from(authLogs).where(whereClause)

    return NextResponse.json({ 
      logs, 
      total: Number(totalCount?.value || 0) 
    })
  } catch (error) {
    console.error("Auth logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
