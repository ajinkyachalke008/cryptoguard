"use client"

import { Shield, Lock, Eye, AlertTriangle, FileCheck, Fingerprint, Network, Zap } from "lucide-react"

const securityFeatures = [
  {
    icon: Shield,
    title: "Multi-Layer Protection",
    description: "Advanced defense systems with real-time monitoring and automated threat response.",
    color: "from-yellow-400 to-yellow-600"
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Military-grade encryption for all transaction data and sensitive information.",
    color: "from-yellow-500 to-amber-600"
  },
  {
    icon: Eye,
    title: "24/7 Surveillance",
    description: "Continuous monitoring of blockchain networks with instant anomaly detection.",
    color: "from-amber-400 to-yellow-500"
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment",
    description: "AI-powered risk scoring with predictive analytics and threat intelligence.",
    color: "from-yellow-600 to-amber-500"
  },
  {
    icon: FileCheck,
    title: "Compliance Ready",
    description: "Built-in compliance frameworks for AML, KYC, and regulatory reporting.",
    color: "from-yellow-400 to-yellow-500"
  },
  {
    icon: Fingerprint,
    title: "Identity Verification",
    description: "Advanced biometric authentication and multi-factor verification systems.",
    color: "from-amber-500 to-yellow-600"
  },
  {
    icon: Network,
    title: "Graph Analysis",
    description: "Deep transaction network analysis to uncover hidden fraud patterns.",
    color: "from-yellow-500 to-yellow-400"
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Automated blocking and flagging of suspicious transactions in milliseconds.",
    color: "from-yellow-600 to-amber-400"
  }
]

export default function SecurityFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
          <Shield className="size-3 text-yellow-400" />
          ENTERPRISE SECURITY
        </div>
        <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
          Security Features
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          Protect your crypto ecosystem with military-grade security and AI-powered fraud detection
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityFeatures.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className="group relative rounded-xl border border-yellow-500/40 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-yellow-500/70 hover:shadow-[0_0_40px_#ffd70033] hover:scale-[1.02]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 opacity-0 transition-opacity duration-300 group-hover:from-yellow-500/10 group-hover:to-transparent group-hover:opacity-100" />
              
              <div className="relative">
                {/* Icon with gradient background */}
                <div className={`mb-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} p-3 shadow-[0_0_20px_#ffd70066]`}>
                  <Icon className="size-6 text-black" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-yellow-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-xl border border-yellow-500/0 transition-all duration-300 group-hover:border-yellow-400/50 group-hover:animate-pulse" />
            </div>
          )
        })}
      </div>

      {/* Additional security stats */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="text-center rounded-lg border border-yellow-500/30 bg-black/50 p-4 backdrop-blur-sm">
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            99.9%
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Threat Detection Rate</div>
        </div>
        <div className="text-center rounded-lg border border-yellow-500/30 bg-black/50 p-4 backdrop-blur-sm">
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            &lt;10ms
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Response Time</div>
        </div>
        <div className="text-center rounded-lg border border-yellow-500/30 bg-black/50 p-4 backdrop-blur-sm">
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            256-bit
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Encryption Standard</div>
        </div>
        <div className="text-center rounded-lg border border-yellow-500/30 bg-black/50 p-4 backdrop-blur-sm">
          <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            24/7
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Active Monitoring</div>
        </div>
      </div>
    </section>
  )
}