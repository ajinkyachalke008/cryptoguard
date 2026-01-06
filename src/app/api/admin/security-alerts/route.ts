import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { securityAlerts, adminAuditLogs } from "@/db/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const severity = searchParams.get("severity")
  const status = searchParams.get("status") || "active"
  const offset = (page - 1) * limit

  try {
    let whereClause = eq(securityAlerts.status, status)
    
    if (severity && severity !== "all") {
      whereClause = and(whereClause, eq(securityAlerts.severity, severity))
    }

    const alerts = await db.select()
      .from(securityAlerts)
      .where(whereClause)
      .orderBy(desc(securityAlerts.createdAt))
      .limit(limit)
      .offset(offset)

    const [totalCount] = await db.select({ value: sql`count(*)` }).from(securityAlerts).where(whereClause)

    return NextResponse.json({ 
      alerts, 
      total: Number(totalCount?.value || 0) 
    })
  } catch (error) {
    console.error("Security alerts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const body = await req.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 })
    }

    const status = action === 'resolve' ? 'resolved' : 'dismissed'
    
    await db.update(securityAlerts)
      .set({ 
        status, 
        resolvedBy: auth.user!.id,
        resolvedAt: new Date().toISOString()
      })
      .where(eq(securityAlerts.id, id))

    // Log the action
    await db.insert(adminAuditLogs).values({
      adminUserId: auth.user!.id,
      action: `${action}_security_alert`,
      details: { alertId: id, action, status },
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, message: `Alert ${status} successfully.` })
  } catch (error) {
    console.error("Security alert update error:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
