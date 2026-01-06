import { NextResponse } from "next/server"
import { db } from "@/db"
import { authLogs } from "@/db/schema"
import { desc, eq, and } from "drizzle-orm"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const eventType = searchParams.get("eventType")
  const offset = (page - 1) * limit

  try {
    // In a real app, we would query the DB
    // const logs = await db.query.authLogs.findMany({
    //   where: eventType && eventType !== "all" ? eq(authLogs.eventType, eventType) : undefined,
    //   orderBy: [desc(authLogs.createdAt)],
    //   limit,
    //   offset
    // })

    // Returning realistic mock data for the demo
    const mockLogs = Array.from({ length: limit }).map((_, i) => ({
      id: offset + i + 1,
      userId: 100 + i,
      email: `user${offset + i}@example.com`,
      eventType: eventType && eventType !== "all" ? eventType : (i % 3 === 0 ? "login_success" : i % 3 === 1 ? "login_failed" : "signup"),
      loginMethod: i % 2 === 0 ? "password" : "oauth_google",
      ipHash: "192.168.1.*** (hashed)",
      deviceType: i % 3 === 0 ? "desktop" : "mobile",
      browser: i % 2 === 0 ? "Chrome" : "Safari",
      os: i % 2 === 0 ? "Windows" : "iOS",
      countryCode: ["US", "GB", "DE", "CN", "RU"][i % 5],
      countryName: ["United States", "United Kingdom", "Germany", "China", "Russia"][i % 5],
      failureReason: i % 3 === 1 ? "Wrong password" : null,
      riskFlags: i % 5 === 0 ? ["multiple_failed"] : [],
      createdAt: new Date(Date.now() - (offset + i) * 15 * 60000).toISOString()
    }))

    return NextResponse.json({ logs: mockLogs, total: 150 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
