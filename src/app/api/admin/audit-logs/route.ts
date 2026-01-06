import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { adminAuditLogs, users } from "@/db/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const offset = (page - 1) * limit

  try {
    const logs = await db.select({
      id: adminAuditLogs.id,
      adminUserId: adminAuditLogs.adminUserId,
      targetUserId: adminAuditLogs.targetUserId,
      action: adminAuditLogs.action,
      reason: adminAuditLogs.reason,
      details: adminAuditLogs.details,
      createdAt: adminAuditLogs.createdAt,
    })
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit)
    .offset(offset)

    // Enrich with email addresses
    const enrichedLogs = await Promise.all(logs.map(async (log) => {
      const details = log.details as any
      return {
        ...log,
        adminEmail: details?.adminEmail || "System",
        targetEmail: details?.targetEmail || "N/A",
        actionDescription: details?.actionDescription || log.action.replace(/_/g, ' ')
      }
    }))

    const [totalCount] = await db.select({ value: sql`count(*)` }).from(adminAuditLogs)

    return NextResponse.json({ 
      logs: enrichedLogs, 
      total: Number(totalCount?.value || 0) 
    })
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
