import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const mockAnalysis = {
      transactionId: id,
      riskFactors: [
        {
          label: "High-risk counterparty",
          value: Math.floor(Math.random() * 40) + 10,
          severity: Math.random() > 0.5 ? "high" : "medium",
          description: "Transaction involves addresses flagged in suspicious activity"
        },
        {
          label: "Unusual transaction pattern",
          value: Math.floor(Math.random() * 30) + 10,
          severity: Math.random() > 0.6 ? "medium" : "low",
          description: "Transaction size or timing deviates from normal patterns"
        },
        {
          label: "Chain mixing detected",
          value: Math.floor(Math.random() * 25) + 5,
          severity: "medium",
          description: "Funds moved across multiple blockchains in short timeframe"
        },
        {
          label: "Sanction list check",
          value: Math.floor(Math.random() * 20) + 5,
          severity: Math.random() > 0.7 ? "high" : "low",
          description: "Addresses checked against OFAC and EU sanction lists"
        },
        {
          label: "Smart contract interaction",
          value: Math.floor(Math.random() * 15) + 5,
          severity: "low",
          description: "Transaction interacts with unverified smart contracts"
        }
      ],
      relatedAddresses: Array.from({ length: 5 }, (_, i) => ({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        label: i === 0 ? "Exchange" : i === 1 ? "Mixer" : undefined,
        riskScore: Math.floor(Math.random() * 100),
        relationship: ["Direct", "1-hop", "2-hop"][Math.floor(Math.random() * 3)],
        transactionCount: Math.floor(Math.random() * 50) + 1
      })),
      flowData: {
        nodes: [
          {
            id: `0x${Math.random().toString(16).substr(2, 40)}`,
            label: "From",
            risk: Math.floor(Math.random() * 100)
          },
          {
            id: `0x${Math.random().toString(16).substr(2, 40)}`,
            label: "To",
            amount: parseFloat((Math.random() * 10).toFixed(4)),
            risk: Math.floor(Math.random() * 100)
          },
          {
            id: `0x${Math.random().toString(16).substr(2, 40)}`,
            label: "Intermediate",
            risk: Math.floor(Math.random() * 100)
          }
        ],
        edges: [
          {
            from: `0x${Math.random().toString(16).substr(2, 40)}`,
            to: `0x${Math.random().toString(16).substr(2, 40)}`,
            amount: parseFloat((Math.random() * 10).toFixed(4)),
            timestamp: new Date().toISOString()
          }
        ]
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 180000).toISOString(),
          event: "Transaction initiated",
          details: "Transaction sent from wallet",
          type: "transaction"
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString(),
          event: "Smart contract interaction",
          details: "Transaction processed through DEX aggregator",
          type: "interaction"
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          event: "Risk flag detected",
          details: "High-risk counterparty identified in transaction chain",
          type: "flag"
        },
        {
          timestamp: new Date().toISOString(),
          event: "Transaction confirmed",
          details: "Included in block",
          type: "transaction"
        }
      ],
      aiInsights: {
        summary: `This transaction shows ${
          Math.random() > 0.5 ? "moderate" : "low"
        } risk indicators. The transaction was completed with standard gas fees.`,
        redFlags:
          Math.random() > 0.5
            ? [
                "Transaction involves previously flagged addresses",
                "Unusual timing patterns detected",
                "Funds passed through multiple intermediaries",
                "Cross-chain activity within short timeframe"
              ]
            : ["No significant red flags detected"],
        recommendations:
          Math.random() > 0.7
            ? [
                "Flag this transaction for manual review",
                "Monitor related addresses for suspicious activity",
                "Consider additional KYC verification",
                "Alert compliance team for investigation"
              ]
            : Math.random() > 0.4
            ? [
                "Continue monitoring this address",
                "Review transaction patterns periodically",
                "Document in case file for future reference"
              ]
            : ["Transaction appears legitimate", "No immediate action required"]
      }
    }

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error("Error analyzing transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to analyze transaction" },
      { status: 500 }
    )
  }
}
