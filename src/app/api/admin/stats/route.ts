import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, authLogs, userSessions, securityAlerts } from "@/db/schema"
import { count, eq, and, gte, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Users Stats
    const [totalUsers] = await db.select({ value: count() }).from(users)
    const [activeUsers] = await db.select({ value: count() }).from(users).where(eq(users.status, 'active'))
    const [suspendedUsers] = await db.select({ value: count() }).from(users).where(eq(users.status, 'suspended'))
    const [blockedUsers] = await db.select({ value: count() }).from(users).where(eq(users.status, 'blocked'))
    const [pendingUsers] = await db.select({ value: count() }).from(users).where(eq(users.status, 'pending_verification'))
    const [newToday] = await db.select({ value: count() }).from(users).where(gte(users.createdAt, today))
    const [newThisWeek] = await db.select({ value: count() }).from(users).where(gte(users.createdAt, weekAgo))
    
    // Growth Rate calculation (last 30 days)
    const [usersMonthAgo] = await db.select({ value: count() }).from(users).where(sql`created_at < ${monthAgo}`)
    const growthRate = usersMonthAgo.value > 0 
      ? Math.round(((totalUsers.value - usersMonthAgo.value) / usersMonthAgo.value) * 1000) / 10
      : 0

    // Signups Stats
    const [signupsToday] = await db.select({ value: count() }).from(authLogs).where(
      and(eq(authLogs.eventType, 'signup'), gte(authLogs.createdAt, today))
    )
    const [signupsWeek] = await db.select({ value: count() }).from(authLogs).where(
      and(eq(authLogs.eventType, 'signup'), gte(authLogs.createdAt, weekAgo))
    )

    // Logins Stats
    const [loginsToday] = await db.select({ value: count() }).from(authLogs).where(
      and(eq(authLogs.eventType, 'login_success'), gte(authLogs.createdAt, today))
    )
    const [failedToday] = await db.select({ value: count() }).from(authLogs).where(
      and(eq(authLogs.eventType, 'login_failed'), gte(authLogs.createdAt, today))
    )
    const totalLoginsToday = loginsToday.value + failedToday.value
    const successRate = totalLoginsToday > 0 ? Math.round((loginsToday.value / totalLoginsToday) * 1000) / 10 : 0

    // Security Stats
    const [activeAlerts] = await db.select({ value: count() }).from(securityAlerts).where(eq(securityAlerts.status, 'active'))
    const [criticalAlerts] = await db.select({ value: count() }).from(securityAlerts).where(
      and(eq(securityAlerts.status, 'active'), eq(securityAlerts.severity, 'critical'))
    )

    // Sessions Stats
    const [activeSessions] = await db.select({ value: count() }).from(userSessions).where(eq(userSessions.isActive, true))

    const stats = {
      users: {
        total: totalUsers.value,
        active: activeUsers.value,
        suspended: suspendedUsers.value,
        blocked: blockedUsers.value,
        pending_verification: pendingUsers.value,
        new_today: newToday.value,
        new_this_week: newThisWeek.value,
        growth_rate: growthRate
      },
      signups: {
        total_today: signupsToday.value,
        total_week: signupsWeek.value,
        by_method: {
          email: 0, // In a real app we'd group by loginMethod
          oauth_google: 0,
          wallet: 0
        },
        by_account_type: {
          user: activeUsers.value,
          developer: 0,
          enterprise: 0
        }
      },
      logins: {
        total_today: totalLoginsToday,
        success_rate: successRate,
        failed_attempts: failedToday.value,
        unique_users: loginsToday.value // Simplified
      },
      security: {
        active_alerts: activeAlerts.value,
        critical_alerts: criticalAlerts.value,
        suspicious_logins: 0,
        blocked_attempts: 0,
        geo_anomalies: 0
      },
      sessions: {
        active: activeSessions.value,
        average_duration_minutes: 0,
        peak_concurrent: 0
      },
      fraud_detection: {
        flagged_accounts: 0,
        auto_blocked: 0,
        under_review: 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
