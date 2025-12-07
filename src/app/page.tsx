"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import NeonParticles from "@/components/NeonParticles"
import CursorTrail from "@/components/CursorTrail"
import GlobeDemo from "@/components/GlobeDemo"
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
import { Sparkles, Zap, Download, Monitor, Smartphone, Chrome, ArrowRight } from "lucide-react"
import { RegistrationModal } from "@/components/RegistrationModal"
import { LiveDemoModal } from "@/components/LiveDemoModal"
import { TypeWriter } from "@/components/TypeWriter"
import { FloatingStats } from "@/components/FloatingStats"
import { SocialProof } from "@/components/SocialProof"
import { TryItDemo } from "@/components/TryItDemo"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { StickyCTA } from "@/components/StickyCTA"

export default function Home() {
  const [regOpen, setRegOpen] = useState(false)
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
© 2024 CryptoGuard. All rights reserved.
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
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-12 text-center">
          <div className="mx-auto mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <Zap className="size-2.5 sm:size-3 text-yellow-400" /> NEW • AI Fraud Detection
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight px-2">
            <span className="block bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent font-black tracking-tight [text-shadow:0_1px_0_rgba(0,0,0,0.45),0_-1px_0_rgba(255,255,255,0.2),0_0_4px_rgba(255,215,0,0.6),0_0_8px_rgba(255,215,0,0.4),0_0_12px_rgba(255,215,0,0.5),0_0_16px_rgba(255,215,0,0.3)]">
              Cryptoguard
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
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto h-10 sm:h-11 rounded-full border-yellow-500/70 bg-black/40 px-5 sm:px-6 text-sm sm:text-base text-yellow-300 font-semibold shadow-[0_0_24px_#ffd70040] transition-transform active:scale-95 hover:scale-[1.03] hover:text-yellow-200 hover:border-yellow-400 hover:bg-black/60"
            >
              View Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRegOpen(true)}
              className="w-full sm:w-auto h-10 sm:h-11 rounded-full text-sm sm:text-base text-yellow-300 font-semibold hover:text-yellow-200 hover:bg-yellow-500/20 active:scale-95"
            >
              Register
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

      {/* Registration Modal (hero trigger) */}
      <RegistrationModal open={regOpen} onOpenChange={setRegOpen} />
      
      {/* Live Demo Modal */}
      <LiveDemoModal open={demoOpen} onOpenChange={setDemoOpen} />

      {/* Sticky CTA Bar */}
      <StickyCTA 
        onOpenDemo={() => setDemoOpen(true)}
        onOpenRegister={() => setRegOpen(true)}
      />
    </div>
  )
}