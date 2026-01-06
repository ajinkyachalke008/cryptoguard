import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const offset = (page - 1) * limit

  // Mock audit logs
  const mockLogs = Array.from({ length: limit }).map((_, i) => ({
    id: offset + i + 1,
    adminUserId: 1,
    adminEmail: "admin@cryptoguard.com",
    targetUserId: 100 + i,
    targetEmail: `user${offset + i}@example.com`,
    action: ["suspend_user", "unsuspend_user", "force_logout", "reset_password", "view_details"][i % 5],
    actionDescription: [
      "Suspended user account",
      "Unsuspended user account",
      "Forced logout for all sessions",
      "Initiated password reset",
      "Viewed sensitive user details"
    ][i % 5],
    reason: i % 2 === 0 ? "Compliance review" : "Suspicious activity",
    createdAt: new Date(Date.now() - (i * 120) * 60000).toISOString()
  }))

  return NextResponse.json({ logs: mockLogs, total: 100 })
}
