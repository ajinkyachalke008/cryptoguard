import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { geoInferenceProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address

  try {
    const profile = await db.query.geoInferenceProfiles.findFirst({
      where: eq(geoInferenceProfiles.walletAddress, address),
    })

    if (profile) {
      return NextResponse.json({
        regions: profile.regionProbabilities,
        confidence: profile.confidence,
      })
    }

    // Mock data based on address for MVP
    const isOdd = address.length % 2 === 1
    return NextResponse.json({
      regions: isOdd 
        ? [
            { region: "South Asia", probability: "71%" },
            { region: "Eastern Europe", probability: "19%" },
            { region: "Other", probability: "10%" }
          ]
        : [
            { region: "North America", probability: "55%" },
            { region: "Western Europe", probability: "35%" },
            { region: "Other", probability: "10%" }
          ],
      confidence: isOdd ? "high" : "low",
    })
  } catch (error) {
    console.error("Error fetching geo data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
