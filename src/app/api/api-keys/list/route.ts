import { NextResponse } from "next/server"
import { db } from "@/db"
import { apiKeys } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    // In a real app, we'd get the userId from the session
    // For this demo/implementation, we'll fetch all active keys
    const keys = await db.query.apiKeys.findMany({
      orderBy: [desc(apiKeys.createdAt)]
    })

    return NextResponse.json({ 
      success: true,
      apiKeys: keys.map(k => ({
        id: k.id.toString(),
        name: k.name,
        key: k.key,
        created: k.createdAt,
        lastUsed: k.lastUsedAt,
        status: k.status
      }))
    })
  } catch (error) {
    console.error("Failed to fetch API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}
