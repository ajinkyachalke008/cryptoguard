import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const active = searchParams.get("active") === "true"
  const offset = (page - 1) * limit

  // Mock sessions
  const mockSessions = Array.from({ length: limit }).map((_, i) => ({
    id: offset + i + 1,
    userId: 100 + i,
    userEmail: `user${offset + i}@example.com`,
    sessionToken: `sess_${Math.random().toString(36).substring(7)}`,
    ipHash: `192.168.1.${50 + i}`,
    deviceType: i % 3 === 0 ? "desktop" : "mobile",
    browser: i % 2 === 0 ? "Chrome" : "Firefox",
    os: i % 2 === 0 ? "macOS" : "Android",
    countryCode: ["US", "FR", "JP", "IN"][i % 4],
    lastActivityAt: new Date(Date.now() - (i * 10) * 60000).toISOString(),
    createdAt: new Date(Date.now() - (i * 60) * 60000).toISOString(),
    isActive: true
  }))

  return NextResponse.json({ sessions: mockSessions, total: 30 })
}
