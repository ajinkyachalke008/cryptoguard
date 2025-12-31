"use client"

import { useState, useEffect, useRef } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
import { 
  Target, 
  Search,
  Zap,
  AlertTriangle,
History,
TrendingUp,
TrendingDown,
Droplets, 
Users, 
Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"

interface ScamPattern {
  id: string
  name: string
  category: "rug_pull" | "honeypot" | "pump_dump" | "liquidity_drain"
  similarity: number
  historicalCase: string
  date: string
  lossAmount: string
  matchingFeatures: string[]
  confidence: number
}

interface FeatureMatch {
  feature: string
  current: string
  pattern: string
  match: boolean
  weight: number
}

const mockPatterns: ScamPattern[] = [
  {
    id: "1",
    name: "Classic Rug Pull",
    category: "rug_pull",
    similarity: 82,
    historicalCase: "$SQUID Token",
    date: "Nov 2021",
    lossAmount: "$3.4M",
    matchingFeatures: [
      "Liquidity lock bypass",
      "Dev wallet concentration >30%",
      "Social hype before removal",
      "No audit verification"
    ],
    confidence: 88
  },
  {
    id: "2",
    name: "Slow Rug Pattern",
    category: "liquidity_drain",
    similarity: 67,
    historicalCase: "$TITAN Finance",
    date: "Jun 2021",
    lossAmount: "$42M",
    matchingFeatures: [
      "Gradual liquidity removal",
      "Price manipulation periods",
      "Insider accumulation phase"
    ],
    confidence: 72
  },
  {
    id: "3",
    name: "Honeypot Variant A",
    category: "honeypot",
    similarity: 45,
    historicalCase: "Various ERC20 Honeypots",
    date: "2022-2023",
    lossAmount: "$12M+",
    matchingFeatures: [
      "Transfer restrictions detected",
      "Hidden fee mechanism"
    ],
    confidence: 54
  },
  {
    id: "4",
    name: "Coordinated P&D",
    category: "pump_dump",
    similarity: 73,
    historicalCase: "$EMAX Token",
    date: "May 2021",
    lossAmount: "$8M",
    matchingFeatures: [
      "Influencer coordination",
      "Whale wallet timing",
      "Social bot activity"
    ],
    confidence: 78
  }
]

const featureMatches: FeatureMatch[] = [
  { feature: "Liquidity Decay Rate", current: "18.4%/day", pattern: ">15%/day", match: true, weight: 0.25 },
  { feature: "Wallet Graph Topology", current: "Centralized", pattern: "Centralized", match: true, weight: 0.20 },
  { feature: "Time-to-Dump Ratio", current: "4.2 days", pattern: "3-7 days", match: true, weight: 0.18 },
  { feature: "Social Hype Velocity", current: "340%/hr", pattern: ">200%/hr", match: true, weight: 0.15 },
  { feature: "Contract Upgradeability", current: "Yes", pattern: "Yes", match: true, weight: 0.12 },
  { feature: "Audit Verification", current: "None", pattern: "None/Fake", match: true, weight: 0.10 }
]

const getCategoryColor = (category: ScamPattern["category"]) => {
  switch (category) {
    case "rug_pull": return "#ef4444"
    case "honeypot": return "#f59e0b"
    case "pump_dump": return "#a855f7"
    case "liquidity_drain": return "#3b82f6"
  }
}

const getCategoryIcon = (category: ScamPattern["category"]) => {
  switch (category) {
    case "rug_pull": return <TrendingDown className="w-4 h-4" />
    case "honeypot": return <AlertTriangle className="w-4 h-4" />
    case "pump_dump": return <Users className="w-4 h-4" />
    case "liquidity_drain": return <Droplets className="w-4 h-4" />
  }
}

export default function PatternMatcherPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [selectedPattern, setSelectedPattern] = useState<ScamPattern | null>(mockPatterns[0])
  const [animatedSimilarity, setAnimatedSimilarity] = useState(0)
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (showResults && selectedPattern) {
      setAnimatedSimilarity(0)
      const timer = setInterval(() => {
        setAnimatedSimilarity(prev => {
          if (prev >= selectedPattern.similarity) {
            clearInterval(timer)
            return selectedPattern.similarity
          }
          return prev + 1
        })
      }, 15)
      return () => clearInterval(timer)
    }
  }, [showResults, selectedPattern])

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2500)
  }

  const circumference = 2 * Math.PI * 80
  const strokeDashoffset = circumference - (animatedSimilarity / 100) * circumference

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return "#ef4444"
    if (similarity >= 60) return "#f59e0b"
    if (similarity >= 40) return "#eab308"
    return "#22c55e"
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Scam Pattern Matcher</h1>
              <p className="text-gray-400 text-sm">Match behavior with known scam archetypes</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter token contract or wallet address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-red-500 hover:bg-red-400 text-white font-semibold"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Match Patterns
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {selectedPattern && (
                <Card className="border-2 bg-black/60 backdrop-blur-sm overflow-hidden" style={{ borderColor: getCategoryColor(selectedPattern.category) }}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                          <svg width="200" height="200" className="transform -rotate-90">
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="12"
                              fill="none"
                            />
                            <circle
                              ref={ringRef}
                              cx="100"
                              cy="100"
                              r="80"
                              stroke={getSimilarityColor(animatedSimilarity)}
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              style={{ 
                                transition: "stroke-dashoffset 0.3s ease",
                                filter: `drop-shadow(0 0 10px ${getSimilarityColor(animatedSimilarity)})`
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span 
                              className="text-5xl font-mono font-bold"
                              style={{ color: getSimilarityColor(animatedSimilarity) }}
                            >
                              {animatedSimilarity}%
                            </span>
                            <span className="text-sm text-gray-400">Similarity</span>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <Badge 
                            className="text-sm px-3 py-1"
                            style={{ 
                              backgroundColor: `${getCategoryColor(selectedPattern.category)}20`,
                              color: getCategoryColor(selectedPattern.category),
                              borderColor: getCategoryColor(selectedPattern.category)
                            }}
                          >
                            {getCategoryIcon(selectedPattern.category)}
                            <span className="ml-2">{selectedPattern.category.replace("_", " ").toUpperCase()}</span>
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{selectedPattern.name}</h3>
                        <div className="space-y-4">
                          <div className="bg-black/40 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <History className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-yellow-300">Historical Match</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{selectedPattern.historicalCase}</div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span><Clock className="w-3 h-3 inline mr-1" />{selectedPattern.date}</span>
                              <span className="text-red-400">Loss: {selectedPattern.lossAmount}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-500 mb-2">Matching Features</div>
                            <div className="space-y-2">
                              {selectedPattern.matchingFeatures.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-red-400" />
                                  <span className="text-gray-300">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                            <span className="text-sm text-gray-500">AI Confidence</span>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedPattern.confidence} className="w-24 h-2" />
                              <span className="text-sm font-mono text-white">{selectedPattern.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Feature Vector Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {featureMatches.map((feature, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border ${
                          feature.match 
                            ? "bg-red-500/10 border-red-500/30" 
                            : "bg-green-500/10 border-green-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {feature.match ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            <span className="font-medium text-white">{feature.feature}</span>
                          </div>
                          <span className="text-xs text-gray-500">Weight: {(feature.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current: </span>
                            <span className="text-white font-mono">{feature.current}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pattern: </span>
                            <span className="text-gray-300 font-mono">{feature.pattern}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Pattern Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPatterns.map(pattern => (
                      <div 
                        key={pattern.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPattern?.id === pattern.id
                            ? "bg-yellow-500/10 border-yellow-500/50"
                            : "bg-black/40 border-gray-800 hover:border-yellow-500/30"
                        }`}
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${getCategoryColor(pattern.category)}20` }}
                            >
                              {getCategoryIcon(pattern.category)}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{pattern.name}</div>
                              <div className="text-xs text-gray-500">{pattern.historicalCase}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${pattern.similarity}%`,
                                  backgroundColor: getSimilarityColor(pattern.similarity)
                                }}
                              />
                            </div>
                          </div>
                          <span 
                            className="ml-3 text-sm font-mono font-bold"
                            style={{ color: getSimilarityColor(pattern.similarity) }}
                          >
                            {pattern.similarity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    This token exhibits <span className="text-red-400 font-bold">strong similarity</span> to 
                    the $SQUID rug pull pattern. The combination of liquidity decay rate, 
                    centralized wallet topology, and social hype velocity creates a 
                    <span className="text-red-400 font-bold"> high-risk profile</span>.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Prediction</div>
                    <p className="text-sm text-white">
                      Based on historical patterns, there is a <span className="text-red-400 font-bold">76% probability</span> of 
                      significant value loss within the next 5-10 days if current trends continue.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-400">
                    <p>
                      The AI Pattern Matcher uses cosine similarity and clustering algorithms to compare 
                      current token behavior against a database of 500+ historical scam cases.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2" />
                        <span>Feature vectors extracted from on-chain data</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2" />
                        <span>Multi-dimensional similarity scoring</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2" />
                        <span>Weighted matching based on scam category</span>
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
