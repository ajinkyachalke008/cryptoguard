import { NextResponse } from "next/server"

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

    // Mock response - in production, update database
    return NextResponse.json({ 
      success: true,
      message: "API key revoked successfully"
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    )
  }
}