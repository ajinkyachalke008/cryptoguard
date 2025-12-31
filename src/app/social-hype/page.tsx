"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Search,
  Zap,
  AlertTriangle,
  Bot,
  Users,
  TrendingUp,
  Clock,
  Twitter,
  Hash,
  UserCheck,
  UserX,
  BarChart3,
  Activity
} from "lucide-react"

interface SocialMetric {
  platform: string
  icon: React.ReactNode
  mentions: number
  mentionsChange: number
  sentiment: number
  botLikelihood: number
  uniqueAuthors: number
  engagement: number
}

interface InfluencerPost {
  id: string
  author: string
  followers: string
  content: string
  engagement: number
  timestamp: Date
  botScore: number
  platform: "twitter" | "telegram" | "discord"
}

interface TimelinePoint {
  time: string
  organic: number
  artificial: number
  price: number
}

const socialMetrics: SocialMetric[] = [
  {
    platform: "Twitter/X",
    icon: <Twitter className="w-5 h-5" />,
    mentions: 11420,
    mentionsChange: 340,
    sentiment: 78,
    botLikelihood: 34,
    uniqueAuthors: 2847,
    engagement: 89400
  },
  {
    platform: "Telegram",
    icon: <MessageSquare className="w-5 h-5" />,
    mentions: 4230,
    mentionsChange: 180,
    sentiment: 82,
    botLikelihood: 28,
    uniqueAuthors: 1204,
    engagement: 34200
  },
  {
    platform: "Discord",
    icon: <Hash className="w-5 h-5" />,
    mentions: 2180,
    mentionsChange: 95,
    sentiment: 71,
    botLikelihood: 19,
    uniqueAuthors: 847,
    engagement: 12800
  }
]

const influencerPosts: InfluencerPost[] = [
  {
    id: "1",
    author: "@CryptoWhale",
    followers: "847K",
    content: "Just loaded up on $TOKEN - this is going to 100x easy! Not financial advice but you'd be crazy to miss this one 🚀🚀🚀",
    engagement: 12400,
    timestamp: new Date(Date.now() - 3600000 * 2),
    botScore: 67,
    platform: "twitter"
  },
  {
    id: "2",
    author: "@DeFiGems",
    followers: "324K",
    content: "Hidden gem alert: $TOKEN is the next big thing. Dev team is solid, tokenomics are perfect. DYOR but this is a moonshot 🌙",
    engagement: 8700,
    timestamp: new Date(Date.now() - 3600000 * 4),
    botScore: 72,
    platform: "twitter"
  },
  {
    id: "3",
    author: "@AltcoinBuzz",
    followers: "512K",
    content: "Breaking: $TOKEN just broke key resistance. Volume is insane right now. Don't say I didn't warn you 📈",
    engagement: 15200,
    timestamp: new Date(Date.now() - 3600000 * 6),
    botScore: 45,
    platform: "twitter"
  },
  {
    id: "4",
    author: "Telegram: TokenAlpha",
    followers: "48K",
    content: "New alpha drop 🔥 $TOKEN launching presale in 2 hours. Whitelisted members get 50% bonus. Join now!",
    engagement: 3400,
    timestamp: new Date(Date.now() - 3600000 * 8),
    botScore: 89,
    platform: "telegram"
  }
]

const timelineData: TimelinePoint[] = [
  { time: "6h ago", organic: 2400, artificial: 400, price: 0.0012 },
  { time: "5h ago", organic: 2800, artificial: 800, price: 0.0014 },
  { time: "4h ago", organic: 3200, artificial: 2400, price: 0.0018 },
  { time: "3h ago", organic: 4100, artificial: 5200, price: 0.0028 },
  { time: "2h ago", organic: 4800, artificial: 7800, price: 0.0042 },
  { time: "1h ago", organic: 5200, artificial: 9400, price: 0.0051 },
  { time: "Now", organic: 5800, artificial: 11200, price: 0.0048 }
]

const getBotScoreColor = (score: number) => {
  if (score >= 70) return "#ef4444"
  if (score >= 50) return "#f59e0b"
  if (score >= 30) return "#eab308"
  return "#22c55e"
}

export default function SocialHypeDetectorPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [animatedBars, setAnimatedBars] = useState(false)

  useEffect(() => {
    if (showResults) {
      setTimeout(() => setAnimatedBars(true), 300)
    }
  }, [showResults])

  const handleScan = () => {
    setIsScanning(true)
    setAnimatedBars(false)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2500)
  }

  const totalMentions = socialMetrics.reduce((acc, m) => acc + m.mentions, 0)
  const avgBotLikelihood = Math.round(socialMetrics.reduce((acc, m) => acc + m.botLikelihood, 0) / socialMetrics.length)
  const organicPercentage = 100 - avgBotLikelihood

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Social Hype Detector</h1>
              <p className="text-gray-400 text-sm">Detect artificial social manipulation before on-chain damage</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter token name, contract, or social handles..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-pink-500 hover:bg-pink-400 text-white font-semibold"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Detect Hype
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-yellow-400">
                      {totalMentions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Total Mentions (24h)</div>
                    <div className="text-xs text-green-400 mt-2">+{Math.round((socialMetrics[0].mentionsChange + socialMetrics[1].mentionsChange) / 2)}% vs avg</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-500/30 bg-pink-500/5 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-pink-400">
                      {avgBotLikelihood}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Bot Activity</div>
                    <div className="text-xs text-red-400 mt-2">High artificial engagement</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-green-400">
                      {organicPercentage}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Organic</div>
                    <div className="text-xs text-gray-500 mt-2">Real engagement</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-cyan-400">
                      {socialMetrics.reduce((acc, m) => acc + m.uniqueAuthors, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Unique Authors</div>
                    <div className="text-xs text-yellow-400 mt-2">4.2 mentions/author</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Organic vs Artificial Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Time</span>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Organic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Artificial</span>
                          </div>
                        </div>
                      </div>
                      
                      {timelineData.map((point, i) => {
                        const total = point.organic + point.artificial
                        const organicWidth = (point.organic / total) * 100
                        const artificialWidth = (point.artificial / total) * 100
                        
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 w-16">{point.time}</span>
                              <span className="text-gray-400">{total.toLocaleString()} mentions</span>
                            </div>
                            <div className="flex h-6 rounded-full overflow-hidden bg-black/40">
                              <div 
                                className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-1000"
                                style={{ width: animatedBars ? `${organicWidth}%` : "0%" }}
                              />
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000"
                                style={{ width: animatedBars ? `${artificialWidth}%` : "0%" }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Influencer Activity Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {influencerPosts.map(post => (
                        <div 
                          key={post.id}
                          className={`p-4 rounded-lg border ${
                            post.botScore >= 70 
                              ? "bg-red-500/10 border-red-500/30" 
                              : post.botScore >= 50 
                              ? "bg-yellow-500/10 border-yellow-500/30"
                              : "bg-black/40 border-gray-800"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {post.platform === "twitter" ? (
                                <Twitter className="w-4 h-4 text-blue-400" />
                              ) : post.platform === "telegram" ? (
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Hash className="w-4 h-4 text-purple-400" />
                              )}
                              <span className="font-semibold text-white">{post.author}</span>
                              <Badge variant="outline" className="text-xs border-gray-700">
                                {post.followers} followers
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline"
                                className="text-xs"
                                style={{ 
                                  borderColor: getBotScoreColor(post.botScore),
                                  color: getBotScoreColor(post.botScore)
                                }}
                              >
                                <Bot className="w-3 h-3 mr-1" />
                                {post.botScore}% bot
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span><Activity className="w-3 h-3 inline mr-1" />{post.engagement.toLocaleString()} engagements</span>
                            <span><Clock className="w-3 h-3 inline mr-1" />{Math.round((Date.now() - post.timestamp.getTime()) / 3600000)}h ago</span>
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
                    <CardTitle className="text-lg text-yellow-300">Platform Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {socialMetrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-black/40 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {metric.icon}
                              <span className="font-medium text-white">{metric.platform}</span>
                            </div>
                            <span className="text-sm font-mono text-yellow-400">
                              {metric.mentions.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Bot Activity</span>
                              <span style={{ color: getBotScoreColor(metric.botLikelihood) }}>
                                {metric.botLikelihood}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Sentiment</span>
                              <span className={metric.sentiment > 70 ? "text-green-400" : "text-yellow-400"}>
                                {metric.sentiment}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Authors</span>
                              <span className="text-white">{metric.uniqueAuthors.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Change</span>
                              <span className="text-green-400">+{metric.mentionsChange}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Manipulation Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { signal: "Bot Posting Rhythm", status: "Detected", severity: "high" },
                        { signal: "Follower Spike", status: "+847% in 6h", severity: "critical" },
                        { signal: "Recycled Content", status: "34 matches", severity: "medium" },
                        { signal: "Identical Phrases", status: "12 clusters", severity: "high" },
                        { signal: "Coordinated Timing", status: "Confirmed", severity: "critical" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded">
                          <span className="text-sm text-gray-400">{item.signal}</span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              item.severity === "critical" ? "border-red-500 text-red-400" :
                              item.severity === "high" ? "border-orange-500 text-orange-400" :
                              "border-yellow-500 text-yellow-400"
                            }`}
                          >
                            {item.status}
                          </Badge>
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
                      This token shows <span className="text-red-400 font-bold">strong signs of coordinated social manipulation</span>. 
                      The rapid follower growth, identical messaging patterns, and bot posting rhythms suggest a 
                      <span className="text-red-400 font-bold"> paid promotion campaign</span>.
                    </p>
                    <div className="bg-black/40 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">Warning</div>
                      <p className="text-sm text-white">
                        Social hype without corresponding organic growth often precedes dump events. 
                        Exercise extreme caution.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
