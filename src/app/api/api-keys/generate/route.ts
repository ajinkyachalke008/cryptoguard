import { NextResponse } from "next/server"
import { db } from "@/db"
import { apiKeys } from "@/db/schema"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKeyString = `cg_live_${generateRandomString(32)}`
    
    // Save to database
    const [newKey] = await db.insert(apiKeys).values({
      name,
      key: apiKeyString,
      status: 'active',
      createdAt: new Date().toISOString(),
    }).returning()

    return NextResponse.json({ 
      success: true, 
      apiKey: {
        id: newKey.id.toString(),
        name: newKey.name,
        key: newKey.key,
        created: newKey.createdAt,
        lastUsed: newKey.lastUsedAt,
        status: newKey.status
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to generate API key:", error)
    return NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 }
    )
  }
}

function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
