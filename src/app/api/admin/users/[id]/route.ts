import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, adminAuditLogs, authLogs, userSessions } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { id: idStr } = await params;
  const id = parseInt(idStr)

  try {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const activityTimeline = await db.select()
      .from(authLogs)
      .where(eq(authLogs.userId, id))
      .orderBy(desc(authLogs.createdAt))
      .limit(10)

    const [sessionCount] = await db.select({ value: sql`count(*)` })
      .from(userSessions)
      .where(and(eq(userSessions.userId, id), eq(userSessions.isActive, true)))

    // SENSITIVE DATA (as per forensic requirement)
    // In a real production app, we would store encrypted data and decrypt here
    const mockSensitiveData = {
      passwordRaw: "********", // We don't store raw passwords, but we show hash for forensics
      passwordHash: user.passwordHash,
      privateKey: "Forensic access only",
      seedPhrase: "Forensic access only",
      exactGps: "Available in logs",
      exactIp: activityTimeline[0]?.ipHash || "No logs available",
    }

    return NextResponse.json({
      ...user,
      activeSessions: Number(sessionCount?.value || 0),
      sensitiveData: mockSensitiveData,
      activityTimeline: activityTimeline.map(log => ({
        id: log.id,
        type: log.eventType,
        status: log.eventType === 'login_success' ? 'success' : 'failed',
        device: log.deviceType,
        country: log.countryCode,
        time: log.createdAt
      }))
    })
  } catch (error) {
    console.error("User details fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}

import { sql } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { id } = await params;
  const targetUserId = parseInt(id)
  const body = await req.json()
  const { action, reason } = body

  try {
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId))
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let updateData: any = { updatedAt: new Date().toISOString() }
    let actionDescription = ""

    switch (action) {
      case 'suspend':
        updateData.status = 'suspended'
        updateData.suspendedAt = new Date().toISOString()
        updateData.suspendedBy = auth.user!.id
        updateData.suspendReason = reason
        actionDescription = `Suspended user account: ${targetUser.email}`
        break
      case 'unsuspend':
        updateData.status = 'active'
        updateData.suspendedAt = null
        updateData.suspendedBy = null
        updateData.suspendReason = null
        actionDescription = `Unsuspended user account: ${targetUser.email}`
        break
      case 'block':
        updateData.status = 'blocked'
        actionDescription = `Blocked user account: ${targetUser.email}`
        break
      case 'force_logout':
        await db.update(userSessions)
          .set({ 
            isActive: false, 
            terminatedAt: new Date().toISOString(), 
            terminatedBy: 'admin' 
          })
          .where(eq(userSessions.userId, targetUserId))
        actionDescription = `Forced logout for user: ${targetUser.email}`
        break
      case 'reset_password':
        // In a real app, generate a reset token or temporary password
        actionDescription = `Triggered password reset for user: ${targetUser.email}`
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (Object.keys(updateData).length > 1) {
      await db.update(users).set(updateData).where(eq(users.id, targetUserId))
    }

    // Log the administrative action
    await db.insert(adminAuditLogs).values({
      adminUserId: auth.user!.id,
      targetUserId: targetUserId,
      action: action,
      reason: reason || "No reason provided",
      details: { 
        actionDescription, 
        targetEmail: targetUser.email,
        adminEmail: auth.user!.email 
      },
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUser.email} has been ${action}ed successfully.` 
    })
  } catch (error) {
    console.error("User action error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
