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
import { Sparkles, Zap } from "lucide-react"
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
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <CursorTrail />
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Animated shader-esque gradient + particles */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(255,215,0,0.15),transparent_60%),radial-gradient(800px_400px_at_80%_30%,rgba(255,215,0,0.10),transparent_60%),linear-gradient(180deg,transparent,rgba(0,0,0,0.8))]" />
          <NeonParticles />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-3 py-1 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3 text-yellow-400" /> NEW • AI Fraud Detection
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl font-extrabold leading-tight">
            <span className="block bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent font-black tracking-tight [text-shadow:0_1px_0_rgba(0,0,0,0.45),0_-1px_0_rgba(255,255,255,0.2),0_0_4px_rgba(255,215,0,0.6),0_0_8px_rgba(255,215,0,0.4),0_0_12px_rgba(255,215,0,0.5),0_0_16px_rgba(255,215,0,0.3)]">
              Cryptoguard
            </span>
            <span className="mt-2 block text-[oklch(0.86_0.16_100)] drop-shadow-[0_0_20px_#ffd70080]">
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
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm sm:text-base text-gray-300">
            Monitor global crypto transactions in real-time, identify risky flows, and stop fraud with a hybrid AI engine.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button 
              onClick={() => setDemoOpen(true)}
              className="h-11 rounded-full bg-yellow-500 px-6 text-black font-semibold shadow-[0_0_24px_#ffd70080] transition-transform hover:scale-[1.03] hover:bg-yellow-400"
            >
              Launch Live Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-11 rounded-full border-yellow-500/70 bg-black/40 px-6 text-yellow-300 font-semibold shadow-[0_0_24px_#ffd70040] transition-transform hover:scale-[1.03] hover:text-yellow-200 hover:border-yellow-400 hover:bg-black/60"
            >
              View Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRegOpen(true)}
              className="h-11 rounded-full text-yellow-300 font-semibold hover:text-yellow-200 hover:bg-yellow-500/20"
            >
              Register
            </Button>
          </div>

          {/* Floating Stats */}
          <FloatingStats />
        </div>

        {/* Floating crypto icons orbiting background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_18s_linear_infinite] [animation-direction:reverse]">
              <span className="inline-block -translate-x-[200px] -translate-y-[16px] rounded-full bg-yellow-500/30 px-3 py-1 text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                ₿ BTC
              </span>
            </span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_24s_linear_infinite]">
              <span className="inline-block translate-x-[220px] translate-y-[40px] rounded-full bg-yellow-500/30 px-3 py-1 text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                Ξ ETH
              </span>
            </span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[spin_30s_linear_infinite]">
              <span className="inline-block -translate-x-[120px] translate-y-[200px] rounded-full bg-yellow-500/30 px-3 py-1 text-yellow-300 font-semibold shadow-[0_0_16px_#ffd70066]">
                ₮ USDT
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Centerpiece Globe Demo with Legend */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mt-6 rounded-xl border border-yellow-500/40 bg-black/50 p-4 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] relative">
          <GlobeDemo />
          <GlobeLegend />
        </div>
      </section>

      {/* Real-time Feed + Analytics */}
      <section className="mx-auto max-w-7xl px-4 mt-8 grid gap-6 md:grid-cols-2">
        <TransactionFeed />
        <Analytics />
      </section>

      {/* Leaderboard + Table */}
      <section className="mx-auto max-w-7xl px-4 mt-8 grid gap-6 md:grid-cols-2">
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
      <section id="features" className="mt-12">
        <FeaturesSolutions />
      </section>

      {/* Social Proof Section */}
      <SocialProof />

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