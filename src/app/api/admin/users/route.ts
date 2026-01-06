import { NextRequest, NextResponse } from "next/server"
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

  // Mock data for user management
  const mockUsers = Array.from({ length: limit }).map((_, i) => ({
    id: offset + i + 1,
    email: `user${offset + i}@example.com`,
    emailMasked: `u***${offset + i}@e******.com`,
    role: i % 10 === 0 ? "admin" : "user",
    status: status && status !== "all" ? status : (i % 15 === 0 ? "suspended" : i % 20 === 0 ? "blocked" : "active"),
    accountType: ["user", "developer", "enterprise"][i % 3],
    signupMethod: ["email", "oauth_google", "wallet"][i % 3],
    emailVerified: i % 5 !== 0,
    lastLoginAt: new Date(Date.now() - (i * 2) * 3600000).toISOString(),
    lastLoginCountry: ["US", "GB", "DE", "CN", "RU"][i % 5],
    loginCount: 10 + i,
    failedLoginCount: i % 4 === 0 ? 2 : 0,
    activeSessions: i % 3 === 0 ? 1 : 0,
    suspendedAt: i % 15 === 0 ? new Date().toISOString() : null,
    suspendReason: i % 15 === 0 ? "Suspicious activity detected" : null,
    createdAt: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
    riskScore: Math.floor(Math.random() * 100),
    flagged: i % 8 === 0
  }))

  return NextResponse.json({ users: mockUsers, total: 500 })
}
