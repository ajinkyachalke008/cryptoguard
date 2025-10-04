import { NextResponse } from "next/server"

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
    const apiKey = `cg_live_${generateRandomString(32)}`
    
    // Mock response - in production, save to database
    const newKey = {
      id: Date.now().toString(),
      name,
      key: apiKey,
      created: new Date().toISOString(),
      lastUsed: null,
      status: "active"
    }

    return NextResponse.json({ 
      success: true, 
      apiKey: newKey 
    }, { status: 201 })
  } catch (error) {
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