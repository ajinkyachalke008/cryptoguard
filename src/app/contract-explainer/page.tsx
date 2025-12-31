"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileCode, 
  Search,
  Zap,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Code,
  User,
  Briefcase,
  Info,
  Lock,
  Unlock,
  RefreshCw,
  Coins
} from "lucide-react"

interface ContractClause {
  id: string
  name: string
  function: string
  risk: "safe" | "caution" | "danger" | "critical"
  category: "ownership" | "transfer" | "mint" | "upgrade" | "governance"
  explanations: {
    beginner: string
    developer: string
    investor: string
  }
  codeSnippet: string
  implications: string[]
}

const mockClauses: ContractClause[] = [
  {
    id: "1",
    name: "Owner Mint Authority",
    function: "mint(address to, uint256 amount)",
    risk: "critical",
    category: "mint",
    explanations: {
      beginner: "The contract owner can create unlimited new tokens at any time. This means your tokens could be diluted instantly, making them worth less.",
      developer: "Unrestricted mint function callable by owner address. No cap enforcement, no timelock, no multi-sig requirement. Direct supply manipulation vector.",
      investor: "Unlimited token creation authority presents severe dilution risk. No governance controls. Owner can inflate supply at will, devaluing existing holdings."
    },
    codeSnippet: `function mint(address to, uint256 amount) public onlyOwner {
  _mint(to, amount);
}`,
    implications: [
      "Owner can inflate supply without limit",
      "No holder approval required",
      "Immediate execution - no timelock",
      "High rug pull risk indicator"
    ]
  },
  {
    id: "2",
    name: "Emergency Pause",
    function: "pause() / unpause()",
    risk: "danger",
    category: "transfer",
    explanations: {
      beginner: "The owner can freeze all token transfers. If activated, you cannot sell, send, or move your tokens until they decide to unpause.",
      developer: "Pausable pattern implementation with owner-only access. All transfers, approvals, and other token operations revert when paused.",
      investor: "Transfer freeze capability represents liquidity risk. Owner can prevent all trading activity. Consider implications for exit strategies."
    },
    codeSnippet: `function pause() public onlyOwner {
  _pause();
}

function unpause() public onlyOwner {
  _unpause();
}`,
    implications: [
      "All transfers can be halted instantly",
      "No automatic unpause mechanism",
      "Could be used to trap holders",
      "Legitimate use: emergency response"
    ]
  },
  {
    id: "3",
    name: "Ownership Transfer",
    function: "transferOwnership(address newOwner)",
    risk: "caution",
    category: "ownership",
    explanations: {
      beginner: "The current owner can give control of the contract to someone else. The new owner gets all the special powers.",
      developer: "Standard Ownable pattern. Single-step transfer with no confirmation. Consider two-step transfer for production contracts.",
      investor: "Control can change hands instantly. Monitor ownership changes. New owner inherits all privileged functions."
    },
    codeSnippet: `function transferOwnership(address newOwner) public onlyOwner {
  require(newOwner != address(0));
  _transferOwnership(newOwner);
}`,
    implications: [
      "Control can change without notice",
      "No timelock on ownership transfer",
      "New owner gets all privileges",
      "Monitor for ownership events"
    ]
  },
  {
    id: "4",
    name: "Proxy Upgrade Pattern",
    function: "upgradeTo(address newImplementation)",
    risk: "critical",
    category: "upgrade",
    explanations: {
      beginner: "The contract code can be completely replaced. This means all the rules about your tokens could change without warning.",
      developer: "UUPS/Transparent proxy pattern. Implementation contract can be swapped. State preserved, logic replaced. Extreme care required.",
      investor: "Contract upgradeability means terms can change post-investment. No code is final. Requires high trust in admin/governance."
    },
    codeSnippet: `function upgradeTo(address newImplementation) public onlyOwner {
  _authorizeUpgrade(newImplementation);
  _upgradeTo(newImplementation);
}`,
    implications: [
      "Entire contract logic can change",
      "Your tokens governed by new rules",
      "No holder vote required",
      "Common in legitimate protocols with timelock"
    ]
  },
  {
    id: "5",
    name: "Blacklist Function",
    function: "blacklist(address account)",
    risk: "danger",
    category: "transfer",
    explanations: {
      beginner: "Specific wallets can be blocked from using their tokens. If your wallet is blacklisted, your tokens become unusable.",
      developer: "Address-level transfer restriction. Blocked addresses cannot send or receive. Typically used for compliance but can be abused.",
      investor: "Wallet-level freeze risk. Your specific holdings could be frozen. Check if there's an appeal process or decentralized governance."
    },
    codeSnippet: `mapping(address => bool) public blacklisted;

function blacklist(address account) public onlyOwner {
  blacklisted[account] = true;
}`,
    implications: [
      "Individual wallets can be frozen",
      "No automatic removal mechanism",
      "Often used for regulatory compliance",
      "Can be weaponized against holders"
    ]
  },
  {
    id: "6",
    name: "Renounce Ownership",
    function: "renounceOwnership()",
    risk: "safe",
    category: "ownership",
    explanations: {
      beginner: "The owner permanently gives up control. No one can use owner-only features anymore. This is usually a good sign!",
      developer: "Irreversible ownership renunciation. Owner set to zero address. All onlyOwner functions become permanently inaccessible.",
      investor: "Positive decentralization indicator. Owner privileges removed. Contract becomes immutable (if not upgradeable). Reduced admin risk."
    },
    codeSnippet: `function renounceOwnership() public onlyOwner {
  _transferOwnership(address(0));
}`,
    implications: [
      "No more owner privileges",
      "Cannot be reversed",
      "Strong decentralization signal",
      "Verify it was actually called"
    ]
  }
]

const getRiskColor = (risk: ContractClause["risk"]) => {
  switch (risk) {
    case "safe": return "#22c55e"
    case "caution": return "#f59e0b"
    case "danger": return "#ef4444"
    case "critical": return "#dc2626"
  }
}

const getRiskIcon = (risk: ContractClause["risk"]) => {
  switch (risk) {
    case "safe": return <ShieldCheck className="w-5 h-5" />
    case "caution": return <Shield className="w-5 h-5" />
    case "danger": return <ShieldAlert className="w-5 h-5" />
    case "critical": return <AlertTriangle className="w-5 h-5" />
  }
}

const getCategoryIcon = (category: ContractClause["category"]) => {
  switch (category) {
    case "ownership": return <User className="w-4 h-4" />
    case "transfer": return <RefreshCw className="w-4 h-4" />
    case "mint": return <Coins className="w-4 h-4" />
    case "upgrade": return <Code className="w-4 h-4" />
    case "governance": return <Briefcase className="w-4 h-4" />
  }
}

export default function ContractExplainerPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set(["1"]))
  const [viewMode, setViewMode] = useState<"beginner" | "developer" | "investor">("beginner")

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2500)
  }

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const criticalCount = mockClauses.filter(c => c.risk === "critical").length
  const dangerCount = mockClauses.filter(c => c.risk === "danger").length
  const safeCount = mockClauses.filter(c => c.risk === "safe").length

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Smart Contract Explainer</h1>
              <p className="text-gray-400 text-sm">Translate dangerous contract logic into human intent</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter smart contract address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileCode className="w-4 h-4 mr-2" />
                    Analyze Contract
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-300">Contract Clauses</h3>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                  <TabsList className="bg-black/60 border border-yellow-500/30">
                    <TabsTrigger value="beginner" className="text-xs data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      <User className="w-3 h-3 mr-1" />
                      Beginner
                    </TabsTrigger>
                    <TabsTrigger value="developer" className="text-xs data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      <Code className="w-3 h-3 mr-1" />
                      Developer
                    </TabsTrigger>
                    <TabsTrigger value="investor" className="text-xs data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Investor
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {mockClauses.map(clause => (
                <Card 
                  key={clause.id}
                  className={`border bg-black/40 backdrop-blur-sm overflow-hidden transition-all cursor-pointer ${
                    expandedClauses.has(clause.id) ? "border-yellow-500/50" : "border-gray-800 hover:border-yellow-500/30"
                  }`}
                  onClick={() => toggleClause(clause.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${getRiskColor(clause.risk)}20`,
                              border: `1px solid ${getRiskColor(clause.risk)}40`
                            }}
                          >
                            {getRiskIcon(clause.risk)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white">{clause.name}</h4>
                              <Badge 
                                variant="outline"
                                className="text-xs"
                                style={{ 
                                  borderColor: getRiskColor(clause.risk),
                                  color: getRiskColor(clause.risk)
                                }}
                              >
                                {clause.risk}
                              </Badge>
                            </div>
                            <code className="text-xs text-gray-500 font-mono">{clause.function}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {getCategoryIcon(clause.category)}
                            <span className="ml-1">{clause.category}</span>
                          </Badge>
                          {expandedClauses.has(clause.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedClauses.has(clause.id) && (
                      <div className="border-t border-yellow-500/20 p-4 animate-in slide-in-from-top-2">
                        <div 
                          className="p-4 rounded-lg mb-4"
                          style={{ 
                            backgroundColor: `${getRiskColor(clause.risk)}10`,
                            borderLeft: `3px solid ${getRiskColor(clause.risk)}`
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: getRiskColor(clause.risk) }} />
                            <p className="text-sm text-gray-300">{clause.explanations[viewMode]}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Code</div>
                          <pre className="bg-black/60 rounded-lg p-3 overflow-x-auto">
                            <code className="text-xs font-mono text-emerald-400">{clause.codeSnippet}</code>
                          </pre>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Implications</div>
                          <div className="grid grid-cols-2 gap-2">
                            {clause.implications.map((imp, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getRiskColor(clause.risk) }}
                                />
                                {imp}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">{dangerCount}</div>
                      <div className="text-xs text-gray-500">Danger</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {mockClauses.filter(c => c.risk === "caution").length}
                      </div>
                      <div className="text-xs text-gray-500">Caution</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">{safeCount}</div>
                      <div className="text-xs text-gray-500">Safe</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">By Category</div>
                    {["ownership", "transfer", "mint", "upgrade", "governance"].map(cat => {
                      const count = mockClauses.filter(c => c.category === cat).length
                      if (count === 0) return null
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cat as ContractClause["category"])}
                            <span className="text-sm text-gray-400 capitalize">{cat}</span>
                          </div>
                          <span className="text-sm font-mono text-white">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Key Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockClauses.filter(c => c.risk === "critical" || c.risk === "danger").map(clause => (
                      <div 
                        key={clause.id}
                        className="p-3 bg-black/40 rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors"
                        onClick={() => {
                          setExpandedClauses(new Set([clause.id]))
                          document.getElementById(`clause-${clause.id}`)?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getRiskIcon(clause.risk)}
                          <span className="text-sm font-semibold text-white">{clause.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{clause.explanations.beginner}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Verdict
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    This contract contains <span className="text-red-400 font-bold">high-risk ownership privileges</span>. 
                    The combination of unlimited mint authority and pause functionality gives the owner 
                    <span className="text-red-400 font-bold"> complete control</span> over all tokens.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Recommendation</div>
                    <p className="text-sm text-white">
                      Do not invest unless ownership is renounced or transferred to a timelock/multisig with 
                      community governance.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    View Modes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-0.5 text-blue-400" />
                      <div>
                        <span className="text-white font-medium">Beginner:</span> Plain language explanations of what each function means for your tokens.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Code className="w-4 h-4 mt-0.5 text-green-400" />
                      <div>
                        <span className="text-white font-medium">Developer:</span> Technical analysis with implementation details and security considerations.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 mt-0.5 text-purple-400" />
                      <div>
                        <span className="text-white font-medium">Investor:</span> Risk assessment focused on control rights and governance implications.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
