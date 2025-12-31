import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { timezoneProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address

  try {
    const profile = await db.query.timezoneProfiles.findFirst({
      where: eq(timezoneProfiles.walletAddress, address),
    })

    if (profile) {
      return NextResponse.json({
        peak_hours_utc: profile.peakHours,
        activity_distribution: profile.hourlyActivityDistribution,
        likely_timezone_range: "UTC+0 to UTC+8", // Simplified for MVP
        confidence: profile.confidence,
      })
    }

    // Mock data based on address for MVP
    const isOdd = address.length % 2 === 1
    const mockDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 100) * (i >= 9 && i <= 17 ? 2 : 0.5)
    }))

    return NextResponse.json({
      peak_hours_utc: isOdd ? [9, 10, 11, 12, 13] : [2, 3, 4, 5],
      activity_distribution: mockDistribution,
      likely_timezone_range: isOdd ? "UTC+0 to UTC+4 (Europe/Middle East)" : "UTC+7 to UTC+10 (Asia/Pacific)",
      confidence: isOdd ? "high" : "medium",
    })
  } catch (error) {
    console.error("Error fetching timezone data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
