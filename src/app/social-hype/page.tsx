"use client"

import { useState, useEffect, useRef } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search,
  Zap,
  AlertTriangle,
  Bot,
  Users,
  Clock,
  Twitter,
  Hash,
  Activity,
  ShieldAlert,
  Terminal,
  Cpu,
  Globe,
  Share2
} from "lucide-react"

interface SocialData {
  platforms: any[]
  signals: any[]
  influencers: any[]
  summary: {
    totalMentions: number
    avgBotScore: number
    riskLevel: string
  }
}

const getBotScoreColor = (score: number) => {
  if (score >= 70) return "#ef4444"
  if (score >= 50) return "#f59e0b"
  if (score >= 30) return "#eab308"
  return "#22c55e"
}

export default function SocialHypeDetectorPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [data, setData] = useState<SocialData | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    setData(null)
    setLogs([])
    setScanProgress(0)

    const steps = [
      { msg: "Initializing Social Forensic Engine...", progress: 10 },
      { msg: "Connecting to X/Twitter API stream...", progress: 25 },
      { msg: "Scouring Telegram alpha channels...", progress: 40 },
      { msg: "Indexing Discord community metadata...", progress: 55 },
      { msg: "Analyzing message synchronization patterns...", progress: 70 },
      { msg: "Running NLP sentiment classification...", progress: 85 },
      { msg: "Finalizing risk assessment...", progress: 100 },
    ]

    for (const step of steps) {
      addLog(step.msg)
      setScanProgress(step.progress)
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400))
    }

    try {
      const response = await fetch('/api/social-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      const result = await response.json()
      setData(result)
      addLog("Intelligence analysis complete. Displaying results.")
    } catch (error) {
      addLog("Error: Failed to reach forensic node.")
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white selection:bg-pink-500/30">
      <NavBar />
      
      {/* HUD Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                <MessageSquare className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Social Intelligence Lab
                </h1>
                <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">Bot & Manipulation Forensic Engine</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-[500px]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative flex gap-2 bg-black/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Scan token, handle, or contract..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    className="pl-10 h-11 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-600"
                  />
                </div>
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !address}
                  className="h-11 px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(219,39,119,0.3)]"
                >
                  {isScanning ? (
                    <Cpu className="w-4 h-4 animate-spin" />
                  ) : (
                    "INITIALIZE SCAN"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Forensic Stream (Visible during and after scan) */}
        {(isScanning || logs.length > 0) && (
          <Card className="border-white/10 bg-black/60 backdrop-blur-md mb-8 overflow-hidden">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Live Forensic Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[10px] font-mono text-pink-400">PROCESSING</span>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="h-40 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed scrollbar-hide">
                {logs.map((log, i) => (
                  <div key={i} className="text-gray-400 mb-1 border-l-2 border-pink-500/30 pl-3">
                    <span className="text-pink-500/50 mr-2">{">"}</span>
                    {log}
                  </div>
                ))}
                {isScanning && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-gray-500 uppercase">Indexing in progress...</span>
                      <span className="text-pink-400">{scanProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
            {/* Risk Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Globe className="w-12 h-12 text-cyan-400" />
                </div>
                <CardContent className="pt-6">
                  <div className="text-sm font-mono text-gray-500 uppercase mb-1">Global Mentions</div>
                  <div className="text-3xl font-bold font-mono tracking-tighter">{data.summary.totalMentions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-mono">
                    <Activity className="w-3 h-3" />
                    +24% SIGNAL STRENGTH
                  </div>
                </CardContent>
              </Card>

              <Card className={`relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-md`}>
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Bot className="w-12 h-12 text-pink-400" />
                </div>
                <CardContent className="pt-6">
                  <div className="text-sm font-mono text-gray-500 uppercase mb-1">Bot Activity</div>
                  <div className="text-3xl font-bold font-mono tracking-tighter text-pink-400">{data.summary.avgBotScore}%</div>
                  <div className="text-[10px] text-pink-500/50 mt-2 font-mono uppercase">Artificial Clusters Detected</div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <ShieldAlert className="w-12 h-12 text-yellow-400" />
                </div>
                <CardContent className="pt-6">
                  <div className="text-sm font-mono text-gray-500 uppercase mb-1">Risk Status</div>
                  <div className={`text-3xl font-bold font-mono tracking-tighter ${
                    data.summary.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {data.summary.riskLevel}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase">Coordinated Pattern Match</div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Users className="w-12 h-12 text-green-400" />
                </div>
                <CardContent className="pt-6">
                  <div className="text-sm font-mono text-gray-500 uppercase mb-1">Organic Ratio</div>
                  <div className="text-3xl font-bold font-mono tracking-tighter text-green-400">{100 - data.summary.avgBotScore}%</div>
                  <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase">Verified Human Flow</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Platform Intelligence & Social Graph */}
              <div className="lg:col-span-2 space-y-8">
                {/* Platform Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.platforms.map((platform, i) => (
                    <Card key={i} className="border-white/10 bg-black/40 hover:bg-white/5 transition-colors group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {platform.name === 'Twitter/X' && <Twitter className="w-5 h-5 text-cyan-400" />}
                            {platform.name === 'Telegram' && <MessageSquare className="w-5 h-5 text-blue-400" />}
                            {platform.name === 'Discord' && <Hash className="w-5 h-5 text-indigo-400" />}
                            <span className="font-bold">{platform.name}</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-[10px] border-white/10 group-hover:border-pink-500/30 transition-colors">
                            {platform.mentions.toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-gray-500">
                              <span>BOT PROBABILITY</span>
                              <span style={{ color: getBotScoreColor(platform.botScore) }}>{platform.botScore}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ 
                                  width: `${platform.botScore}%`,
                                  backgroundColor: getBotScoreColor(platform.botScore)
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">SENTIMENT</span>
                            <span className="text-green-400 font-mono">{platform.sentiment}% POSITIVE</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Simulated Social Network Graph */}
                <Card className="border-white/10 bg-black/60 backdrop-blur-md overflow-hidden h-[400px] relative group">
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />
                    {/* SVG Visualization for Cluster nodes */}
                    <svg className="w-full h-full">
                      <defs>
                        <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      {[...Array(20)].map((_, i) => (
                        <g key={i}>
                          <circle 
                            cx={`${15 + Math.random() * 70}%`} 
                            cy={`${15 + Math.random() * 70}%`} 
                            r={2 + Math.random() * 4}
                            fill="currentColor"
                            className="text-pink-500/40 animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                          <line 
                            x1={`${15 + Math.random() * 70}%`}
                            y1={`${15 + Math.random() * 70}%`}
                            x2={`${15 + Math.random() * 70}%`}
                            y2={`${15 + Math.random() * 70}%`}
                            stroke="rgba(236,72,153,0.1)"
                            strokeWidth="1"
                          />
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-white/10">
                      <Share2 className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Bot Cluster Visualization</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 ml-1">IDENTIFIED 12 SUSPICIOUS NODES</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 rounded bg-black/80 border border-pink-500/20 backdrop-blur-md">
                      <div className="text-[9px] text-gray-500 uppercase font-mono">Synchronization</div>
                      <div className="text-xs font-bold text-pink-400 font-mono">0.84 HIGH</div>
                    </div>
                    <div className="p-2 rounded bg-black/80 border border-white/10 backdrop-blur-md">
                      <div className="text-[9px] text-gray-500 uppercase font-mono">Closeness</div>
                      <div className="text-xs font-bold text-white font-mono">MEDIUM</div>
                    </div>
                    <div className="p-2 rounded bg-black/80 border border-white/10 backdrop-blur-md">
                      <div className="text-[9px] text-gray-500 uppercase font-mono">Density</div>
                      <div className="text-xs font-bold text-white font-mono">0.42 LOW</div>
                    </div>
                    <div className="p-2 rounded bg-black/80 border border-cyan-500/20 backdrop-blur-md">
                      <div className="text-[9px] text-gray-500 uppercase font-mono">Propagation</div>
                      <div className="text-xs font-bold text-cyan-400 font-mono">0.91 CRITICAL</div>
                    </div>
                  </div>
                </Card>

                {/* Influencer Analysis */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" /> High Impact Influencers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.influencers.map((inf, i) => (
                      <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold font-mono">
                              {inf.author[1]}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                {inf.author}
                                {inf.botScore < 40 && <ShieldAlert className="w-3 h-3 text-cyan-400" />}
                              </div>
                              <div className="text-[10px] font-mono text-gray-500">{inf.followers} FOLLOWERS</div>
                            </div>
                          </div>
                          <Badge className={inf.botScore > 60 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}>
                            {inf.botScore}% BOT
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 italic">"{inf.content}"</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {inf.engagement.toLocaleString()} IMPACT</span>
                          <span className="uppercase">{inf.platform} SOURCE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Manipulation Signals & AI Assessment */}
              <div className="space-y-8">
                <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-sm font-mono uppercase tracking-wider text-pink-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Forensic Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {data.signals.map((signal, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200">{signal.name}</span>
                            <span className="text-[10px] font-mono text-gray-500">{signal.confidence.toFixed(1)}% CONFIDENCE</span>
                          </div>
                          <Badge 
                            className={signal.detected ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-gray-800 text-gray-500 border-white/10"}
                          >
                            {signal.detected ? "DETECTED" : "CLEAR"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-pink-500/30 bg-pink-500/5 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-pink-500/20 transition-all duration-1000" />
                  <CardHeader>
                    <CardTitle className="text-sm font-mono uppercase tracking-wider text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-400" /> AI Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-black/60 border border-white/10 relative">
                        <p className="text-sm leading-relaxed text-gray-300">
                          {data.summary.riskLevel === 'CRITICAL' ? (
                            <>
                              This asset is under <span className="text-red-400 font-bold">extreme artificial inflation</span>. 
                              The social data reveals a <span className="text-red-400 font-bold">coordinated manipulation attack</span> involving synchronized bot clusters across three major platforms. 
                              Engagement velocity is 12x higher than typical organic growth for similar market caps.
                            </>
                          ) : (
                            <>
                              The social signature appears <span className="text-green-400 font-bold">mostly organic</span> with minor marketing activity. 
                              No significant bot synchronization detected. Sentiment remains steady and aligns with volume growth.
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Forensic Verdict</div>
                        <div className={`text-xs font-bold p-2 rounded text-center border ${
                          data.summary.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
                        }`}>
                          {data.summary.riskLevel === 'CRITICAL' ? 'AVOID - HIGH MANIPULATION RISK' : 'STABLE - ORGANIC SIGNATURE'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono uppercase text-gray-400">Next update in</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums tracking-wider">04:59:12</div>
                  <div className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest">Continuous social monitoring active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!data && !isScanning && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-500 mb-2">Ready for Forensic Analysis</h2>
            <p className="text-sm text-gray-600 max-w-sm text-center">
              Enter a token contract or social handle above to begin scanning for coordinated manipulation patterns.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
