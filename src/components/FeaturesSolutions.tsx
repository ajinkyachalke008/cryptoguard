"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Shield, FileText, Play, X } from "lucide-react"

const features = [
  {
    title: "Real-time Risk Scoring",
    desc: "Millisecond risk predictions with glowing clarity.",
    img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1600&auto=format&fit=crop",
    icon: TrendingUp,
    metric: "99.9%",
    metricLabel: "Accuracy Rate",
  },
  {
    title: "Graph + Rules + LLM Hybrid Detection",
    desc: "Best-in-class hybrid AI pipeline.",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop",
    icon: Shield,
    metric: "<10ms",
    metricLabel: "Response Time",
  },
  {
    title: "Exports & Case Bundles",
    desc: "One-click sharable investigation kits.",
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1600&auto=format&fit=crop",
    icon: FileText,
    metric: "50+",
    metricLabel: "Export Formats",
  },
]

const solutions = [
  {
    title: "Fraud Dashboard",
    img: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/0ad00823-3ee5-4e7f-969c-c69c567a8b0d/generated_images/futuristic-ai-crypto-fraud-detection-das-c0f89733-20250928055008.jpg?",
    description: "Real-time monitoring dashboard with AI-powered alerts and risk visualization",
    demoType: "dashboard",
  },
  {
    title: "Compliance Reports",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop",
    description: "Automated regulatory compliance reports ready for audit submission",
    demoType: "compliance",
  },
  {
    title: "Graph Network",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop",
    description: "Interactive graph explorer to trace transaction flows and connections",
    demoType: "graph",
  },
]

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isInView }
}

function MiniDemo({ type }: { type: string }) {
  const [isPlaying, setIsPlaying] = useState(true)

  if (type === "dashboard") {
    return (
      <div className="relative h-full w-full bg-black/90 rounded-lg overflow-hidden p-4">
        <div className="grid grid-cols-3 gap-3 h-full">
          {/* Stat Cards */}
          <div className="space-y-3">
            <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 p-3">
              <div className="text-xs text-green-400">Safe Transactions</div>
              <div className="text-2xl font-bold text-green-300 animate-pulse">847</div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 p-3">
              <div className="text-xs text-red-400">Fraud Detected</div>
              <div className="text-2xl font-bold text-red-300 animate-pulse">12</div>
            </div>
          </div>
          {/* Chart Area */}
          <div className="col-span-2 rounded-lg border border-yellow-500/30 bg-black/50 p-3">
            <div className="text-xs text-yellow-400 mb-2">Live Activity</div>
            <div className="flex items-end gap-1 h-24">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t animate-pulse"
                  style={{ 
                    height: `${h}%`, 
                    animationDelay: `${i * 100}ms`,
                    opacity: 0.6 + (i * 0.03)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === "compliance") {
    return (
      <div className="relative h-full w-full bg-black/90 rounded-lg overflow-hidden p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-yellow-500/20 flex items-center justify-center">
              <FileText className="size-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AML Report Q4 2024</div>
              <div className="text-xs text-gray-500">Generated automatically</div>
            </div>
          </div>
          <div className="space-y-2">
            {["Executive Summary", "Risk Assessment", "Transaction Analysis", "Recommendations"].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 p-2 rounded bg-gray-800/50 border border-gray-700/50 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-300">{item}</span>
                <span className="ml-auto text-[10px] text-green-400">✓ Complete</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">Compliance Score</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-bold text-green-400">94%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === "graph") {
    return (
      <div className="relative h-full w-full bg-black/90 rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          {/* Connections */}
          <line x1="200" y1="150" x2="100" y2="80" stroke="#ffd700" strokeWidth="2" opacity="0.5" className="animate-pulse" />
          <line x1="200" y1="150" x2="300" y2="80" stroke="#00ff88" strokeWidth="2" opacity="0.5" className="animate-pulse" />
          <line x1="200" y1="150" x2="100" y2="220" stroke="#ff4444" strokeWidth="2" opacity="0.5" className="animate-pulse" />
          <line x1="200" y1="150" x2="300" y2="220" stroke="#00ff88" strokeWidth="2" opacity="0.5" className="animate-pulse" />
          <line x1="100" y1="80" x2="50" y2="40" stroke="#ffb020" strokeWidth="1.5" opacity="0.3" />
          <line x1="300" y1="80" x2="350" y2="40" stroke="#00ff88" strokeWidth="1.5" opacity="0.3" />
          
          {/* Nodes */}
          <circle cx="200" cy="150" r="20" fill="#ffd700" className="animate-pulse">
            <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="80" r="12" fill="#ffb020" />
          <circle cx="300" cy="80" r="12" fill="#00ff88" />
          <circle cx="100" cy="220" r="12" fill="#ff4444" />
          <circle cx="300" cy="220" r="12" fill="#00ff88" />
          <circle cx="50" cy="40" r="8" fill="#ffb020" opacity="0.6" />
          <circle cx="350" cy="40" r="8" fill="#00ff88" opacity="0.6" />
          
          {/* Labels */}
          <text x="200" y="155" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">Main</text>
          <text x="100" y="84" textAnchor="middle" fill="white" fontSize="8">Risky</text>
          <text x="300" cy="84" textAnchor="middle" fill="white" fontSize="8">Safe</text>
        </svg>
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-4 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Safe</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Risky</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Fraud</span>
        </div>
      </div>
    )
  }

  return null
}

export default function FeaturesSolutions() {
  const [modal, setModal] = useState<null | { title: string; img: string; description: string; demoType: string }>(null)
  const featuresView = useInView()
  const solutionsView = useInView()

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Features with scroll animation */}
      <div 
        ref={featuresView.ref}
        className="grid md:grid-cols-3 gap-6 mt-10"
      >
        {features.map((f, idx) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-xl border border-yellow-500/40 bg-black/60 p-5 shadow-[0_0_30px_#ffd70022] transition-all duration-500 will-change-transform hover:-translate-y-2 hover:shadow-[0_0_40px_#ffd70055] backdrop-blur ${
                featuresView.isInView 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute inset-0 opacity-20">
                <Image src={f.img} alt="feature" fill className="object-cover" />
              </div>
              <div className="relative">
                {/* Icon */}
                <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 shadow-[0_0_15px_#ffd70066]">
                  <Icon className="size-5 text-black" />
                </div>
                
                <div className="text-yellow-400 font-bold mb-1 text-lg">{f.title}</div>
                <div className="text-gray-300 text-sm mb-4">{f.desc}</div>
                
                {/* Metric badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-black/60 px-3 py-1.5">
                  <span className="text-lg font-black text-yellow-400">{f.metric}</span>
                  <span className="text-xs text-gray-400">{f.metricLabel}</span>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/50 shadow-[inset_0_0_30px_#ffd70033]" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Solutions Section */}
      <div ref={solutionsView.ref}>
        <h3 className={`text-center text-3xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mt-16 mb-2 transition-all duration-500 ${
          solutionsView.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          Our Solutions
        </h3>
        <p className={`text-center text-gray-400 text-sm mb-8 transition-all duration-500 delay-100 ${
          solutionsView.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          Click to explore interactive demos
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => setModal(s)}
              className={`group relative h-56 overflow-hidden rounded-xl border border-yellow-500/40 bg-black/60 p-5 text-left shadow-[0_0_30px_#ffd70022] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_#ffd70055] backdrop-blur ${
                solutionsView.isInView 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${200 + idx * 150}ms` }}
            >
              <Image 
                src={s.img} 
                alt={s.title} 
                fill 
                className="object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" 
              />
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="text-yellow-300 font-bold text-xl mb-2">{s.title}</div>
                  <p className="text-sm text-gray-400">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                  <Play className="size-4" />
                  <span>View Demo</span>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/50 shadow-[inset_0_0_30px_#ffd70033]" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal with Interactive Demo */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-4xl rounded-2xl border border-yellow-500/50 bg-background/95 shadow-[0_0_60px_#ffd70044] backdrop-blur overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
              <div>
                <div className="text-yellow-400 font-bold text-xl">{modal.title}</div>
                <p className="text-sm text-gray-400">{modal.description}</p>
              </div>
              <button 
                onClick={() => setModal(null)}
                className="p-2 rounded-full hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            {/* Demo Area */}
            <div className="h-80 p-4">
              <MiniDemo type={modal.demoType} />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-yellow-500/20 flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setModal(null)} 
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              >
                Close
              </Button>
              <Button 
                onClick={() => setModal(null)} 
                className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold shadow-[0_0_20px_#ffd70066]"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}