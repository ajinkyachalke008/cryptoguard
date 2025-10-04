import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock response - in production, fetch from database
    const apiKeys = [
      {
        id: "1",
        name: "Production API",
        key: "cg_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        created: "2025-01-15T00:00:00Z",
        lastUsed: "2025-10-03T12:30:00Z",
        status: "active"
      },
      {
        id: "2",
        name: "Development API",
        key: "cg_test_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4",
        created: "2025-02-20T00:00:00Z",
        lastUsed: null,
        status: "active"
      }
    ]

    return NextResponse.json({ 
      success: true,
      apiKeys 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}