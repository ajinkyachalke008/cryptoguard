import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "15")
  const severity = searchParams.get("severity")
  const status = searchParams.get("status") || "active"
  const offset = (page - 1) * limit

  // Mock security alerts
  const mockAlerts = Array.from({ length: limit }).map((_, i) => ({
    id: offset + i + 1,
    userId: 100 + i,
    userEmail: `user${offset + i}@example.com`,
    alertType: ["multiple_failed_logins", "geo_anomaly", "bot_activity", "brute_force"][i % 4],
    description: [
      "Multiple failed login attempts detected in short interval",
      "Login detected from unusual geographic location",
      "Automated bot-like login frequency detected",
      "Potential brute force attack on account"
    ][i % 4],
    severity: severity && severity !== "all" ? severity : (i % 5 === 0 ? "critical" : i % 3 === 0 ? "high" : "medium"),
    status: status,
    metadata: {
      ip: `192.168.1.${10 + i}`,
      country: ["US", "CN", "RU", "NG"][i % 4],
      attempts: 5 + i
    },
    createdAt: new Date(Date.now() - (i * 45) * 60000).toISOString()
  }))

  return NextResponse.json({ alerts: mockAlerts, total: 50 })
}
