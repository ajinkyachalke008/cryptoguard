import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/authMiddleware"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const id = params.id

  // Comprehensive mock user data with sensitive information as requested
  const mockUser = {
    id: parseInt(id),
    email: `user${id}@example.com`,
    role: "user",
    status: "active",
    accountType: "developer",
    signupMethod: "email",
    emailVerified: true,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    lastLoginCountry: "US",
    loginCount: 42,
    failedLoginCount: 0,
    activeSessions: 1,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    riskScore: 12,
    
    // SENSITIVE DATA (as per user request)
    sensitiveData: {
      passwordRaw: "CryptoPass2025!",
      passwordHash: "$2b$12$LQv3c1VqBWVH6Dk/mH.M/uU.K9W0U/Gv3K.Gv3K.Gv3K.Gv3K.Gv3K",
      privateKey: "0x4c54456d6f7265207468616e20796f75206b6e6f7720616e6420796f75206b6e6f7721",
      seedPhrase: "apple banana cherry date elderberry fig grape honeydew iceberg jackfruit kiwi lemon",
      exactGps: "37.7749° N, 122.4194° W (San Francisco, CA)",
      exactIp: "192.168.1.105",
      walletPrivateData: "Encrypted BLOB: [0x54, 0x68, 0x69, 0x73, 0x20, 0x69, 0x73, 0x20, 0x70, 0x72, 0x69, 0x76, 0x61, 0x74, 0x65]",
    },
    
    activityTimeline: [
      { id: 1, type: "login", status: "success", device: "Desktop", country: "US", time: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, type: "scan", target: "0x71C...4e5", result: "Safe", time: new Date(Date.now() - 7200000).toISOString() },
      { id: 3, type: "login", status: "success", device: "Mobile", country: "US", time: new Date(Date.now() - 86400000).toISOString() },
    ]
  }

  return NextResponse.json(mockUser)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  const body = await req.json()
  const { action, reason } = body

  // Log the action to audit trail (simulated)
  console.log(`Admin Action: ${action} on User ${params.id}. Reason: ${reason}`)

  return NextResponse.json({ 
    success: true, 
    message: `User ${params.id} has been ${action}ed successfully.` 
  })
}
