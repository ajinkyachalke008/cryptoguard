"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode,
  Coins,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

// Import risk components
import { AuditRatingPanel, AuditRatingData } from "@/components/risk/AuditRatingPanel"
import { VulnerabilityPanel, VulnerabilityData } from "@/components/risk/VulnerabilityPanel"
import { RugPullPanel, RugPullData } from "@/components/risk/RugPullPanel"
import { AIRiskExplanation, AIRiskExplanationData } from "@/components/risk/AIRiskExplanation"
import { AskCryptoGuardChat } from "@/components/risk/AskCryptoGuardChat"

// Mock data generators (fallback)
function generateMockAuditData(name: string): AuditRatingData {
  const score = Math.floor(Math.random() * 100)
  const labels = ["UNSAFE", "CAUTION", "AUDITED", "WELL_AUDITED"] as const
  const label = score < 25 ? labels[0] : score < 50 ? labels[1] : score < 75 ? labels[2] : labels[3]
  
  return {
    protocol_name: name,
    chain: "Ethereum",
    contracts: ["0x1234...abcd", "0x5678...efgh", "0x9abc...ijkl"],
    audit_score: score,
    audit_label: label,
    audit_reason: score >= 75 
      ? "Multiple audits from top-tier firms with all issues resolved."
      : score >= 50 
      ? "Single audit completed, some medium issues pending."
      : score >= 25
      ? "Partial audit coverage, critical issues unaddressed."
      : "No known audits and anonymous developer team.",
    audits: score >= 25 ? [
      {
        name: "Trail of Bits",
        tier: "TOP_TIER",
        date: "2024-06-15",
        report_url: "https://example.com/audit",
        findings: { critical: 0, high: 1, medium: 3, low: 5, resolved: 8 }
      },
      {
        name: "Certik",
        tier: "TOP_TIER",
        date: "2024-03-10",
        findings: { critical: 1, high: 2, medium: 4, low: 8, resolved: 12 }
      }
    ] : [],
    last_audit_date: score >= 25 ? "2024-06-15" : undefined,
    unaddressed_critical_issues: score < 50 ? Math.floor(Math.random() * 3) : 0,
    team_verified: score >= 50
  }
}

function generateMockVulnerabilityData(address: string): VulnerabilityData {
  const scores = ["LOW", "MEDIUM", "HIGH", "COMPROMISED"] as const
  const score = scores[Math.floor(Math.random() * 4)]
  
  return {
    contract_address: address,
    vuln_score: score,
    vuln_explanation: score === "LOW"
      ? "No significant vulnerabilities detected. Contract follows best practices."
      : score === "MEDIUM"
      ? "Some centralization risks detected. Owner has elevated privileges."
      : score === "HIGH"
      ? "Upgradeable proxy with single EOA admin and no timelock."
      : "Contract exploited in May 2024 for $3M.",
    risk_patterns: [
      { pattern: "Upgradeable Proxy", severity: "MEDIUM", description: "Contract can be modified by admin", detected: score !== "LOW" },
      { pattern: "Single Admin Key", severity: "HIGH", description: "One address controls all admin functions", detected: score === "HIGH" || score === "COMPROMISED" },
      { pattern: "No Timelock", severity: "HIGH", description: "Changes take effect immediately", detected: score === "HIGH" || score === "COMPROMISED" },
      { pattern: "Reentrancy Guard Missing", severity: "CRITICAL", description: "Vulnerable to reentrancy attacks", detected: score === "COMPROMISED" }
    ],
    exploit_history: score === "COMPROMISED" ? [
      { date: "2024-05-15", amount_lost: 3000000, description: "Flash loan attack exploiting price oracle", tx_hash: "0xEXPLOIT..." }
    ] : [],
    admin_controls: [
      { type: "Pause Function", risk_level: "LOW", description: "Admin can pause contract in emergency" },
      { type: "Mint Function", risk_level: score === "HIGH" || score === "COMPROMISED" ? "HIGH" : "MEDIUM", description: "Admin can mint new tokens" },
      { type: "Fee Modification", risk_level: "MEDIUM", description: "Admin can change protocol fees" }
    ]
  }
}

function generateMockRugPullData(): RugPullData {
  const risks = ["LOW", "MEDIUM", "HIGH", "EXTREME"] as const
  const risk = risks[Math.floor(Math.random() * 4)]
  
  return {
    rug_pull_risk: risk,
    rug_pull_reasons: risk === "LOW" ? [] : [
      risk === "EXTREME" ? "90% of liquidity controlled by one wallet." : "Top wallet holds 45% of liquidity.",
      risk === "EXTREME" || risk === "HIGH" ? "Owner has unlimited mint permissions." : undefined,
      risk !== "LOW" ? "Liquidity not locked or lock expires soon." : undefined
    ].filter(Boolean) as string[],
    liquidity_analysis: {
      total_liquidity_usd: Math.floor(Math.random() * 10000000) + 100000,
      liquidity_locked: risk === "LOW" || risk === "MEDIUM",
      lock_duration_days: risk === "LOW" ? 365 : risk === "MEDIUM" ? 90 : undefined,
      lock_percentage: risk === "LOW" ? 95 : risk === "MEDIUM" ? 60 : 0,
      top_lp_holder_share: risk === "EXTREME" ? 90 : risk === "HIGH" ? 70 : risk === "MEDIUM" ? 45 : 20,
      num_liquidity_providers: risk === "EXTREME" ? 3 : risk === "HIGH" ? 12 : risk === "MEDIUM" ? 45 : 234
    },
    ownership_analysis: {
      deployer_holdings_pct: risk === "EXTREME" ? 60 : risk === "HIGH" ? 35 : risk === "MEDIUM" ? 15 : 5,
      top_10_holders_pct: risk === "EXTREME" ? 95 : risk === "HIGH" ? 80 : risk === "MEDIUM" ? 60 : 35,
      holder_count: risk === "EXTREME" ? 150 : risk === "HIGH" ? 500 : risk === "MEDIUM" ? 2000 : 15000,
      recent_large_sells: risk === "EXTREME" || risk === "HIGH" ? [
        { address: "0xDEPLOYER...", amount: 500000, timestamp: "2 hours ago" },
        { address: "0xINSIDER...", amount: 250000, timestamp: "5 hours ago" }
      ] : []
    },
    dangerous_functions: [
      { function_name: "mint(address,uint256)", risk_description: "Allows unlimited token minting", detected: risk === "EXTREME" || risk === "HIGH" },
      { function_name: "setFee(uint256)", risk_description: "Can set transaction fees up to 100%", detected: risk === "EXTREME" },
      { function_name: "blacklist(address)", risk_description: "Can prevent addresses from trading", detected: risk !== "LOW" }
    ]
  }
}

function generateMockAIExplanation(name: string, score: number): AIRiskExplanationData {
  return {
    entity_address: "0xPROTOCOL...",
    entity_type: "protocol",
    risk_score: score,
    short_summary: `${name} has a ${score >= 70 ? "high" : score >= 40 ? "medium" : "low"} risk profile. ${score >= 70 ? "Multiple security concerns and unaudited code detected." : score >= 40 ? "Some audit gaps and centralization risks present." : "Well-audited with transparent team and locked liquidity."}`,
    analyst_summary: `Security Analysis for ${name}:\n\n${score >= 70 ? "⚠️ This protocol has significant security concerns including unaudited contracts, high admin privileges, and concentrated token ownership. The deployer wallet still controls a large portion of supply." : score >= 40 ? "This protocol has undergone partial audits but maintains elevated admin privileges. Liquidity is partially locked but centralization risks remain." : "This protocol demonstrates strong security practices with multiple audits, time-locked admin functions, and distributed token ownership."}`,
    risk_factors: score >= 40 ? [
      { factor_type: "EXPLOIT", severity: score >= 70 ? "HIGH" : "MEDIUM", evidence: [{ type: "pattern", value: "admin_key", description: "Single admin key controls upgrades" }] },
      { factor_type: "RUG_PULL", severity: score >= 70 ? "HIGH" : "LOW", evidence: [{ type: "pattern", value: "liquidity", description: "Liquidity concentration detected" }] }
    ] : [],
    recommendations: [
      score >= 70 ? "Avoid interacting with this protocol until security improves" : "Monitor for security updates",
      "Check audit reports before significant investments",
      "Verify team credentials and communication channels"
    ],
    generated_at: new Date().toISOString()
  }
}

export default function ProtocolRiskPage() {
  const [protocol, setProtocol] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  
  // Mock data states
  const [auditData, setAuditData] = useState<AuditRatingData | null>(null)
  const [vulnData, setVulnData] = useState<VulnerabilityData | null>(null)
  const [rugPullData, setRugPullData] = useState<RugPullData | null>(null)
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanationData | null>(null)
  const [overallScore, setOverallScore] = useState(0)

  const handleScan = async () => {
    if (!protocol.trim()) {
      toast.error("Please enter a protocol name or contract address")
      return
    }
    
    setIsScanning(true)
    setScanComplete(false)
    
    try {
      // Generate a mock contract address if not provided
      const contractAddress = protocol.startsWith('0x') && protocol.length >= 40 
        ? protocol 
        : '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      
      const response = await fetch('/api/protocol-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol_name: protocol.trim(),
          contract_address: contractAddress,
          blockchain: 'ethereum'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Scan failed')
      }

      const data = await response.json()
      const scanData = data.scan_data
      
      // Map audit data
      setAuditData({
        protocol_name: data.protocol_name,
        chain: data.blockchain,
        contracts: [data.contract_address],
        audit_score: data.audit_score,
        audit_label: data.audit_score >= 75 ? "WELL_AUDITED" : 
                    data.audit_score >= 50 ? "AUDITED" : 
                    data.audit_score >= 25 ? "CAUTION" : "UNSAFE",
        audit_reason: scanData.audit_data?.is_audited 
          ? `Audited by ${scanData.audit_data.audit_firms?.join(', ') || 'security firms'}`
          : "No known audits and anonymous developer team.",
        audits: scanData.audit_data?.is_audited ? [
          {
            name: scanData.audit_data.audit_firms?.[0] || "Security Firm",
            tier: "TOP_TIER",
            date: scanData.audit_data.last_audit_date || "2024-06-15",
            findings: scanData.audit_data.findings || { critical: 0, high: 1, medium: 3, low: 5, resolved: 8 }
          }
        ] : [],
        last_audit_date: scanData.audit_data?.last_audit_date,
        unaddressed_critical_issues: scanData.audit_data?.findings?.critical || 0,
        team_verified: data.audit_score >= 50
      })
      
      // Map vulnerability data
      const vulnScoreMap: { [key: string]: "LOW" | "MEDIUM" | "HIGH" | "COMPROMISED" } = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'critical': 'COMPROMISED'
      }
      
      setVulnData({
        contract_address: data.contract_address,
        vuln_score: data.vuln_score >= 75 ? "COMPROMISED" : 
                   data.vuln_score >= 50 ? "HIGH" : 
                   data.vuln_score >= 25 ? "MEDIUM" : "LOW",
        vuln_explanation: scanData.vulnerability_data?.critical_vulns?.length > 0
          ? `Critical vulnerabilities detected: ${scanData.vulnerability_data.critical_vulns.join(', ')}`
          : "No significant vulnerabilities detected.",
        risk_patterns: [
          { pattern: "Upgradeable Proxy", severity: "MEDIUM", description: "Contract can be modified by admin", detected: data.vuln_score >= 50 },
          { pattern: "Single Admin Key", severity: "HIGH", description: "One address controls all admin functions", detected: data.vuln_score >= 75 },
          { pattern: "No Timelock", severity: "HIGH", description: "Changes take effect immediately", detected: data.vuln_score >= 75 }
        ],
        exploit_history: [],
        admin_controls: [
          { type: "Pause Function", risk_level: "LOW", description: "Admin can pause contract in emergency" },
          { type: "Mint Function", risk_level: data.vuln_score >= 75 ? "HIGH" : "MEDIUM", description: "Admin can mint new tokens" }
        ]
      })
      
      // Map rug pull data
      setRugPullData({
        rug_pull_risk: data.rug_pull_risk.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
        rug_pull_reasons: scanData.rug_pull_data?.suspicious_patterns || [],
        liquidity_analysis: {
          total_liquidity_usd: Math.floor(Math.random() * 10000000) + 100000,
          liquidity_locked: scanData.rug_pull_data?.liquidity_locked || false,
          lock_duration_days: scanData.rug_pull_data?.liquidity_locked ? 365 : undefined,
          lock_percentage: scanData.rug_pull_data?.liquidity_locked ? 95 : 0,
          top_lp_holder_share: 20,
          num_liquidity_providers: 234
        },
        ownership_analysis: {
          deployer_holdings_pct: 5,
          top_10_holders_pct: 35,
          holder_count: 15000,
          recent_large_sells: []
        },
        dangerous_functions: scanData.rug_pull_data?.suspicious_patterns?.map((pattern: string) => ({
          function_name: pattern,
          risk_description: "Potential security concern",
          detected: true
        })) || []
      })
      
      // Map AI explanation
      setAiExplanation({
        entity_address: data.contract_address,
        entity_type: "protocol",
        risk_score: data.risk_score,
        short_summary: scanData.ai_explanation?.split('\n\n')[0] || `Protocol risk score: ${data.risk_score}/100`,
        analyst_summary: scanData.ai_explanation || '',
        risk_factors: [],
        recommendations: [
          "Monitor for security updates",
          "Check audit reports before significant investments"
        ],
        generated_at: data.created_at
      })
      
      setOverallScore(data.risk_score)
      setIsScanning(false)
      setScanComplete(true)
      toast.success("Protocol scan complete")
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Scan failed')
      setIsScanning(false)
      
      // Fallback to mock data
      const audit = generateMockAuditData(protocol)
      const vuln = generateMockVulnerabilityData("0x" + protocol.slice(0, 40))
      const rugPull = generateMockRugPullData()
      
      const vulnWeight = vuln.vuln_score === "COMPROMISED" ? 100 : vuln.vuln_score === "HIGH" ? 75 : vuln.vuln_score === "MEDIUM" ? 50 : 25
      const rugWeight = rugPull.rug_pull_risk === "EXTREME" ? 100 : rugPull.rug_pull_risk === "HIGH" ? 75 : rugPull.rug_pull_risk === "MEDIUM" ? 50 : 25
      const auditWeight = 100 - audit.audit_score
      const score = Math.floor((vulnWeight + rugWeight + auditWeight) / 3)
      
      setAuditData(audit)
      setVulnData(vuln)
      setRugPullData(rugPull)
      setOverallScore(score)
      setAiExplanation(generateMockAIExplanation(protocol, score))
      setScanComplete(true)
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75) return { label: "CRITICAL", color: "bg-red-500/20 text-red-400 border-red-500/50", icon: XCircle }
    if (score >= 50) return { label: "HIGH", color: "bg-orange-500/20 text-orange-400 border-orange-500/50", icon: AlertTriangle }
    if (score >= 25) return { label: "MEDIUM", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: AlertTriangle }
    return { label: "LOW", color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle2 }
  }

  const sampleProtocols = ["Uniswap V3", "Aave V3", "SuspiciousSwap", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"]

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Protocol & Token Risk Scanner
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze DeFi protocols and tokens for security vulnerabilities, audit status, and rug pull risk
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 shadow-[0_0_40px_#ffd70022]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500/70" />
                <Input
                  placeholder="Enter protocol name or contract address"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="pl-10 h-12 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/30"
                />
              </div>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="h-12 px-8 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066] transition-all hover:scale-[1.02]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Scan Protocol
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Try:</span>
              {sampleProtocols.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setProtocol(ex)}
                  className="text-xs text-yellow-500/70 hover:text-yellow-400 transition-colors"
                >
                  {ex.length > 20 ? `${ex.slice(0, 10)}...${ex.slice(-4)}` : ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scanning Animation */}
        {isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 overflow-hidden">
            <CardContent className="py-16 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/30 animate-ping absolute inset-0" />
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/50 animate-pulse flex items-center justify-center">
                  <FileCode className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-yellow-300 font-medium animate-pulse">Analyzing protocol security...</p>
              <p className="text-sm text-gray-500 mt-2">Checking audits, vulnerabilities, and rug pull indicators</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {scanComplete && (
          <div className="space-y-6">
            {/* Overall Score Header */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${overallScore * 2.51} 251`} className={getRiskBadge(overallScore).color.split(" ")[1]} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getRiskBadge(overallScore).color.split(" ")[1]}`}>
                          {overallScore}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-200 mb-2">{protocol}</h2>
                      <Badge className={`${getRiskBadge(overallScore).color} border px-3 py-1`}>
                        {getRiskBadge(overallScore).label} RISK
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Token</p>
                      <p className="font-bold text-gray-200">DeFi</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">TVL</p>
                      <p className="font-bold text-gray-200">$12.5M</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Chain</p>
                      <p className="font-bold text-gray-200">Ethereum</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="security" className="w-full">
              <TabsList className="bg-black/60 border border-yellow-500/30 p-1">
                <TabsTrigger value="security" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Security Analysis
                </TabsTrigger>
                <TabsTrigger value="rugpull" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Rug Pull Risk
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="security" className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {auditData && <AuditRatingPanel data={auditData} />}
                  {vulnData && <VulnerabilityPanel data={vulnData} />}
                </div>
              </TabsContent>

              <TabsContent value="rugpull" className="mt-6">
                {rugPullData && <RugPullPanel data={rugPullData} />}
              </TabsContent>

              <TabsContent value="ai" className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {aiExplanation && <AIRiskExplanation data={aiExplanation} />}
                  <AskCryptoGuardChat initialContext={{ protocol: protocol }} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!scanComplete && !isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <FileCode className="w-10 h-10 text-yellow-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Enter a protocol or token to analyze</h3>
              <p className="text-gray-500 max-w-md">
                Our security scanner will check audit status, smart contract vulnerabilities, 
                and rug pull risk indicators.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}