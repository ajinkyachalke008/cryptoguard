import { NextResponse } from "next/server"
import { db } from "@/db"
import { apiKeys } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { keyId } = body

    if (!keyId) {
      return NextResponse.json(
        { error: "Key ID is required" },
        { status: 400 }
      )
    }

    // Update status in database
    await db.update(apiKeys)
      .set({ status: 'revoked' })
      .where(eq(apiKeys.id, parseInt(keyId)))

    return NextResponse.json({ 
      success: true,
      message: "API key revoked successfully"
    })
  } catch (error) {
    console.error("Failed to revoke API key:", error)
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    )
  }
}
