"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import NavBar from "@/components/NavBar"
import { DeveloperBadge } from "@/components/DeveloperBadge"
import NeonParticles from "@/components/NeonParticles"
import CursorTrail from "@/components/CursorTrail"
import { GlobeLegend } from "@/components/GlobeLegend"
import TransactionFeed from "@/components/TransactionFeed"
import Analytics from "@/components/Analytics"
import Leaderboard from "@/components/Leaderboard"
import TransactionsTable from "@/components/TransactionsTable"
import TransactionManagement from "@/components/TransactionManagement"
import FeaturesSolutions from "@/components/FeaturesSolutions"
import SecurityFeatures from "@/components/SecurityFeatures"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, Download, Monitor, Smartphone, Chrome, ArrowRight, Shield, CheckCircle2, Store, AlertTriangle, Network, TrendingUp, Fingerprint, Target } from "lucide-react"
import { LiveDemoModal } from "@/components/LiveDemoModal"
import { TypeWriter } from "@/components/TypeWriter"
import { FloatingStats } from "@/components/FloatingStats"
import { SocialProof } from "@/components/SocialProof"
import { TryItDemo } from "@/components/TryItDemo"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { StickyCTA } from "@/components/StickyCTA"

const GlobeDemo = dynamic(() => import("@/components/GlobeDemo"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
    </div>
  ),
})

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const router = useRouter()

  const handleDownload = async (platform: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloading(platform)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let downloadUrl = ""
    let fileName = ""
    
    switch (platform) {
      case "desktop":
        fileName = "CryptoGuard-Setup-v2.5.0.exe"
        downloadUrl = createDownloadFile(fileName)
        break
      case "mobile-ios":
        window.open("https://apps.apple.com/app/cryptoguard", "_blank")
        setDownloading(null)
        return
      case "mobile-android":
        window.open("https://play.google.com/store/apps/details?id=com.cryptoguard", "_blank")
        setDownloading(null)
        return
      case "extension":
        window.open("https://chrome.google.com/webstore/detail/cryptoguard", "_blank")
        setDownloading(null)
        return
    }
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    setDownloading(null)
  }

  const createDownloadFile = (fileName: string) => {
    const fileContent = `
===========================================
CryptoGuard Installation Package
===========================================

File: ${fileName}
Downloaded: ${new Date().toLocaleString()}

INSTALLATION INSTRUCTIONS:
--------------------------

1. Extract this package to your preferred location
2. Run the installer with administrator privileges
3. Follow the on-screen setup wizard
4. Launch CryptoGuard and sign in with your account

SYSTEM REQUIREMENTS:
-------------------
- Internet connection for initial setup
- 4 GB RAM minimum (8 GB recommended)
- 500 MB available disk space
- Modern processor (2015 or newer)

FEATURES INCLUDED:
-----------------
✓ Real-time wallet scanning
✓ Multi-chain fraud detection
✓ AI-powered risk analysis
✓ Compliance reporting tools
✓ API integration capabilities
✓ Offline mode support

GETTING STARTED:
---------------
1. Create or sign in to your CryptoGuard account
2. Generate your API key from the dashboard
3. Configure your scan preferences
4. Start monitoring crypto transactions

SUPPORT:
--------
Documentation: https://docs.cryptoguard.com
Email: support@cryptoguard.com
Community: https://community.cryptoguard.com

===========================================
© 2025 CryptoGuard. All rights reserved.
===========================================
    `.trim()
    
    const blob = new Blob([fileContent], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <CursorTrail />
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Animated shader-esque gradient + particles */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(255,215,0,0.15),transparent_60%),radial-gradient(800px_400px_at_80%_30%,rgba(255,215,0,0.10),transparent_60%),linear-gradient(180deg,transparent,rgba(0,0,0,0.8))]" />
          <NeonParticles />
          
          {/* Radial focus glow behind title */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FFC623] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-12 text-center">
          {/* Developer Badge */}
          <DeveloperBadge />

          <div className="mx-auto mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <Zap className="size-2.5 sm:size-3 text-yellow-400" /> NEW • AI Fraud Detection
            </span>
          </div>

          {/* Enhanced Premium Hero Title */}
          <h1 className="mx-auto max-w-4xl px-2 mb-2">
            <span className="relative inline-block text-[30px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-black tracking-[-0.02em] leading-[1.05] sm:leading-[1.1]">
              {/* Main text with metallic gradient */}
              <span className="relative inline-block bg-[linear-gradient(180deg,#B8860B_0%,#FFD53A_45%,#8A6A12_100%)] bg-clip-text text-transparent [text-shadow:0_10px_22px_rgba(0,0,0,0.7)]" style={{
                filter: 'drop-shadow(0 0 24px rgba(255, 213, 58, 0.45)) drop-shadow(0 0 12px rgba(255, 235, 138, 0.25))'
              }}>
                {/* Specular highlight overlay */}
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,246,208,0.55)_0%,transparent_30%)] bg-clip-text [-webkit-text-fill-color:transparent] pointer-events-none" style={{
                  WebkitMaskImage: 'linear-gradient(180deg, white 0%, transparent 30%)',
                  maskImage: 'linear-gradient(180deg, white 0%, transparent 30%)'
                }}>
                  Cryptoguard
                </span>
                
                {/* Scan line animation */}
                <span className="absolute inset-0 overflow-hidden pointer-events-none">
                  <span className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent animate-[scan-line_4s_ease-in-out_infinite]" />
                </span>
                
                {/* Main text */}
                Cryptoguard
              </span>
              
              {/* Subtle noise texture overlay */}
              <span className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3.5\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                backgroundSize: '200px 200px'
              }} />
            </span>
            
            <span className="mt-2 block text-[oklch(0.86_0.16_100)] drop-shadow-[0_0_20px_#ffd70080] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              <TypeWriter 
                words={[
                  "AI Crypto Fraud Detection",
                  "Real-time Risk Scoring",
                  "Graph Network Analysis",
                  "Compliance Automation"
                ]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
              />
            </span>
          </h1>
          
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-balance text-xs sm:text-sm lg:text-base text-gray-300 px-4">
            Monitor global crypto transactions in real-time, identify risky flows, and stop fraud with a hybrid AI engine.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
            <Button 
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto h-10 sm:h-11 rounded-full bg-yellow-500 px-5 sm:px-6 text-sm sm:text-base text-black font-semibold shadow-[0_0_24px_#ffd70080] transition-transform active:scale-95 hover:scale-[1.03] hover:bg-yellow-400"
            >
              Launch Live Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/hub")}
              className="w-full sm:w-auto h-10 sm:h-11 rounded-full border-gold/40 bg-black/40 px-5 sm:px-6 text-sm sm:text-base text-gold font-bold shadow-[0_0_24px_rgba(255,215,0,0.2)] transition-transform active:scale-95 hover:scale-[1.03] hover:text-white hover:border-gold hover:bg-gold/20"
            >
              <Globe className="size-4 mr-2" /> View Intel Hub
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto h-10 sm:h-11 rounded-full border-yellow-500/70 bg-black/40 px-5 sm:px-6 text-sm sm:text-base text-yellow-300 font-semibold shadow-[0_0_24px_#ffd70040] transition-transform active:scale-95 hover:scale-[1.03] hover:text-yellow-200 hover:border-yellow-400 hover:bg-black/60"
            >
              View Dashboard
            </Button>
          </div>

          {/* Floating Stats */}
          <FloatingStats />
        </div>

        {/* Floating crypto icons orbiting background - hidden on small screens */}
        <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
          <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px] -translate-x-1/2 -translate-y-1/2">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_18s_linear_infinite] [animation-direction:reverse]">
              <span className="inline-block -translate-x-[140px] sm:-translate-x-[180px] lg:-translate-x-[200px] -translate-y-[16px] rounded-full bg-yellow-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                ₿ BTC
              </span>
            </span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_24s_linear_infinite]">
              <span className="inline-block translate-x-[160px] sm:translate-x-[200px] lg:translate-x-[220px] translate-y-[30px] sm:translate-y-[40px] rounded-full bg-yellow-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                Ξ ETH
              </span>
            </span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_30s_linear_infinite]">
              <span className="inline-block -translate-x-[80px] sm:-translate-x-[100px] lg:-translate-x-[120px] translate-y-[140px] sm:translate-y-[180px] lg:translate-y-[200px] rounded-full bg-yellow-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                ₮ USDT
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Centerpiece Globe Demo with Legend */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 sm:mt-6 rounded-xl border border-yellow-500/40 bg-black/50 p-2 sm:p-4 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] relative">
          <GlobeDemo />
          <GlobeLegend />
        </div>
      </section>

      {/* Real-time Feed + Analytics */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <TransactionFeed />
        <Analytics />
      </section>

      {/* Leaderboard + Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Leaderboard />
        <TransactionsTable />
      </section>

      {/* Try It Demo Section */}
      <TryItDemo />

      {/* Transaction Management Section */}
      <TransactionManagement />

      {/* Security Features */}
      <SecurityFeatures />

      {/* Features & Solutions */}
      <section id="features" className="mt-8 sm:mt-12">
        <FeaturesSolutions />
        
        {/* Detailed Feature Explanation Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent mb-4">
              Platform Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools for crypto fraud detection, risk assessment, and compliance
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Wallet Scanner */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Wallet Scanner</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Comprehensive multi-chain risk assessment with sanctions screening, PEP checks, and AI-powered analysis. 
                  Get detailed compliance reports for regulatory requirements.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    OFAC/EU/UK sanctions screening
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Politically Exposed Person (PEP) detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Cross-chain fund flow analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    AI risk explanations & recommendations
                  </li>
                </ul>
                <Button 
                  onClick={() => router.push("/wallet-scan")} 
                  className="w-full bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30"
                >
                  Launch Scanner →
                </Button>
              </CardContent>
            </Card>

            {/* Quick Scan */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Quick Scan</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Lightning-fast wallet risk assessment in under 10 seconds. Perfect for quick checks 
                  and initial screening before deeper analysis.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    10-second instant risk scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Multi-chain support (ETH, BSC, Polygon+)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    AI-powered pattern detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Basic fraud flag identification
                  </li>
                </ul>
                <Button 
                  onClick={() => router.push("/scanner")} 
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
                >
                  Quick Scan →
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace Risk */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Marketplace Scanner</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Analyze NFT marketplaces for fraud indicators, wash trading patterns, and safety features. 
                  Essential for marketplace due diligence.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Fraud metric analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Wash trading detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Safety feature assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Historical incident tracking
                  </li>
                </ul>
                <Button 
                  onClick={() => router.push("/marketplace-risk")} 
                  className="w-full bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30"
                >
                  Scan Marketplace →
                </Button>
              </CardContent>
            </Card>

            {/* Protocol/Token Risk */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Protocol/Token Risk</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Comprehensive security analysis for DeFi protocols and tokens. Check audit status, 
                  smart contract vulnerabilities, and rug pull indicators.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Audit rating & verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Smart contract vulnerability scan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Rug pull risk assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Liquidity & ownership analysis
                  </li>
                </ul>
                <Button 
                  onClick={() => router.push("/protocol-risk")} 
                  className="w-full bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
                >
                  Check Protocol →
                </Button>
              </CardContent>
            </Card>

            {/* Graph Explorer */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Graph Explorer</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Interactive visualization of wallet relationships and fund flows. Trace money movement 
                  across multiple hops with D3.js-powered graphics.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Interactive network visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Multi-hop transaction tracing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Risk-based node coloring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Live mode for real-time updates
                  </li>
                </ul>
                <Button 
                  onClick={() => router.push("/graph")} 
                  className="w-full bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30"
                >
                  Explore Graph →
                </Button>
              </CardContent>
            </Card>

            {/* Crypto Watchlist */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ffd70033] transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">Crypto Watchlist</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Real-time cryptocurrency market data for 30+ coins. Track prices, market caps, 
                  volume, and 24h changes with auto-refresh functionality.
                </p>
                <ul className="space-y-2 text-xs text-gray-500 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Live prices for 30+ cryptocurrencies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Market cap & volume tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Price charts & sparklines
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Favorite & filter capabilities
                  </li>
                </ul>
                  <Button 
                    onClick={() => router.push("/crypto-watchlist")} 
                    className="w-full bg-orange-500/20 border border-orange-500/50 text-orange-300 hover:bg-orange-500/30"
                  >
                    View Watchlist →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Intelligence Features Section */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-[linear-gradient(180deg,#38bdf8_0%,#06b6d4_50%,#0891b2_100%)] bg-clip-text text-transparent mb-4">
                  AI Intelligence Suite
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Advanced forensic tools powered by explainable AI to detect, prove, and predict crypto risk
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Wallet Intelligence */}
                  <Card className="border-indigo-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#6366f133] transition-all group">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Fingerprint className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-indigo-300 mb-2">Wallet Intelligence</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Probabilistic attribution using timezone fingerprinting, cluster analysis, and geo-inference. 
                        Identify "who" is acting without compromising privacy.
                      </p>
                      <ul className="space-y-2 text-xs text-gray-500 mb-4">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                          Behavioral timezone mapping
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                          Probabilistic geo-inference
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                          Deterministic wallet clustering
                        </li>
                      </ul>
                      <Button 
                        onClick={() => router.push("/wallet-intelligence")} 
                        className="w-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30"
                      >
                        Run Attribution →
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Trust Timeline */}

                <Card className="border-cyan-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#06b6d433] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-2">Trust Timeline</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Visualize how token/wallet risk evolves over time with animated timeline showing liquidity changes, 
                      ownership shifts, and social hype spikes.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Time-series anomaly detection
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        AI-labeled risk change explanations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Interactive event markers
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/trust-timeline")} 
                      className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30"
                    >
                      View Timeline →
                    </Button>
                  </CardContent>
                </Card>

                {/* Delta Engine */}
                <Card className="border-purple-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#a855f733] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Network className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-purple-300 mb-2">AI Delta Engine</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Compare scan results between sessions to understand exactly what changed. 
                      Floating delta cards show risk score changes with AI explanations.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        Before/after comparison
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        Severity-coded changes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        Evidence-backed deltas
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/delta-engine")} 
                      className="w-full bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30"
                    >
                      Compare Scans →
                    </Button>
                  </CardContent>
                </Card>

                {/* Behavior Heatmap */}
                <Card className="border-orange-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#f9731633] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-orange-300 mb-2">Behavior Heatmap</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Visualize wallet activity patterns with interactive radar heatmap. 
                      Detect coordinated dumps, wash trading loops, and sybil attacks.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-orange-400" />
                        Cluster visualization
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-orange-400" />
                        Time-slider playback
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-orange-400" />
                        Pattern detection AI
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/behavior-heatmap")} 
                      className="w-full bg-orange-500/20 border border-orange-500/50 text-orange-300 hover:bg-orange-500/30"
                    >
                      View Heatmap →
                    </Button>
                  </CardContent>
                </Card>

                {/* Pattern Matcher */}
                <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ef444433] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-red-300 mb-2">AI Scam Pattern Matching</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Match current behavior against 500+ historical scam cases. 
                      Get similarity scores with known rug pulls, honeypots, and pump & dumps.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-red-400" />
                        Historical case matching
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-red-400" />
                        Cosine similarity scoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-red-400" />
                        Feature vector analysis
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/pattern-matching")} 
                      className="w-full bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
                    >
                      Match Patterns →
                    </Button>
                  </CardContent>
                </Card>

                {/* Social Hype Detector */}
                <Card className="border-pink-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#ec489933] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-pink-300 mb-2">Social Hype Detector</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Detect artificial social manipulation across Twitter, Telegram, and Discord. 
                      Identify bot activity, fake followers, and coordinated campaigns.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-pink-400" />
                        Bot activity scoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-pink-400" />
                        Organic vs artificial split
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-pink-400" />
                        Influencer analysis
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/social-hype")} 
                      className="w-full bg-pink-500/20 border border-pink-500/50 text-pink-300 hover:bg-pink-500/30"
                    >
                      Detect Hype →
                    </Button>
                  </CardContent>
                </Card>

                {/* Contract Explainer */}
                <Card className="border-emerald-500/40 bg-black/60 backdrop-blur-sm hover:shadow-[0_0_40px_#10b98133] transition-all group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-emerald-300 mb-2">Contract Explainer</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Translate dangerous contract logic into human-readable explanations. 
                      Three modes: Beginner, Developer, and Investor perspectives.
                    </p>
                    <ul className="space-y-2 text-xs text-gray-500 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Plain language explanations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Risk-highlighted clauses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Code snippet analysis
                      </li>
                    </ul>
                    <Button 
                      onClick={() => router.push("/contract-explainer")} 
                      className="w-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Analyze Contract →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
      <SocialProof />

      {/* Downloads Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent mb-2 sm:mb-3 px-4">
            Download CryptoGuard
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-4">
            Get CryptoGuard on all your devices. Available for desktop, mobile, and browser extensions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Desktop */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all hover:shadow-[0_0_40px_#ffd70022] cursor-pointer active:scale-95" onClick={() => router.push("/downloads")}>
            <CardContent className="pt-5 sm:pt-6 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-1 sm:mb-2">Desktop Apps</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                Windows, macOS, and Linux
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                <span>v2.5.0</span>
                <span>•</span>
                <span>24K+ Downloads</span>
              </div>
              <Button 
                variant="outline"
                className="w-full text-xs sm:text-sm border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                disabled={downloading === "desktop"}
                onClick={(e) => handleDownload("desktop", e)}
              >
                {downloading === "desktop" ? (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-bounce" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mobile */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all hover:shadow-[0_0_40px_#ffd70022] cursor-pointer ring-2 ring-yellow-500/30 active:scale-95" onClick={() => router.push("/downloads")}>
            <CardContent className="pt-5 sm:pt-6 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-1 sm:mb-2">Mobile Apps</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                iOS and Android
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                <span>v1.8.2</span>
                <span>•</span>
                <span>108K+ Downloads</span>
              </div>
              <Button 
                className="w-full text-xs sm:text-sm bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]"
                disabled={downloading === "mobile-ios"}
                onClick={(e) => handleDownload("mobile-ios", e)}
              >
                {downloading === "mobile-ios" ? (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-bounce" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Browser Extension */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all hover:shadow-[0_0_40px_#ffd70022] cursor-pointer active:scale-95 sm:col-span-2 lg:col-span-1" onClick={() => router.push("/downloads")}>
            <CardContent className="pt-5 sm:pt-6 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Chrome className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-1 sm:mb-2">Browser Extension</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                Chrome, Firefox, Edge, Brave
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                <span>v3.1.4</span>
                <span>•</span>
                <span>162K+ Downloads</span>
              </div>
              <Button 
                variant="outline"
                className="w-full text-xs sm:text-sm border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                disabled={downloading === "extension"}
                onClick={(e) => handleDownload("extension", e)}
              >
                {downloading === "extension" ? (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-bounce" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Install
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 sm:mt-8 px-4">
          <Button
            onClick={() => router.push("/downloads")}
            className="w-full sm:w-auto text-xs sm:text-sm bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 font-semibold"
          >
            View All Downloads & Developer Tools
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ / How It Works Section */}
      <FAQSection />

      <Footer />

      {/* Live Demo Modal */}
      <LiveDemoModal open={demoOpen} onOpenChange={setDemoOpen} />

      {/* Sticky CTA Bar */}
      <StickyCTA 
        onOpenDemo={() => setDemoOpen(true)}
      />
    </div>
  )
}