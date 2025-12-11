import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
      id: `tx-${i + 1}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: parseFloat((Math.random() * 10).toFixed(4)),
      currency: ["ETH", "BTC", "USDT", "USDC", "BNB"][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
      riskScore: Math.floor(Math.random() * 100),
      chain: ["Ethereum", "Bitcoin", "BSC", "Polygon", "Arbitrum"][Math.floor(Math.random() * 5)],
      type: ["send", "receive", "swap"][Math.floor(Math.random() * 3)],
      gasUsed: (Math.random() * 0.01).toFixed(6),
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000
    }))

    return NextResponse.json({
      success: true,
      transactions: mockTransactions
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
