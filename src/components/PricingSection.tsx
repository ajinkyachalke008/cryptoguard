"use client"

import { useState } from "react"
import { Check, Sparkles, Zap, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RegistrationModal } from "@/components/RegistrationModal"

const plans = [
  {
    name: "Starter",
    description: "For individuals and small teams",
    price: { monthly: 49, yearly: 39 },
    icon: Zap,
    popular: false,
    features: [
      "1,000 wallet scans/month",
      "Basic risk scoring",
      "Transaction monitoring",
      "Email alerts",
      "7-day data retention",
      "Community support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: { monthly: 199, yearly: 159 },
    icon: Sparkles,
    popular: true,
    features: [
      "25,000 wallet scans/month",
      "Advanced AI detection",
      "Graph network analysis",
      "Real-time alerts",
      "90-day data retention",
      "Priority support",
      "API access",
      "Custom reports",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: { monthly: null, yearly: null },
    icon: Building2,
    popular: false,
    features: [
      "Unlimited wallet scans",
      "Custom AI models",
      "Full graph exploration",
      "White-label options",
      "Unlimited retention",
      "24/7 dedicated support",
      "SLA guarantee",
      "On-premise deployment",
      "Custom integrations",
    ],
    cta: "Contact Sales",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [regOpen, setRegOpen] = useState(false)

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
          <Sparkles className="size-3 text-yellow-400" />
          TRANSPARENT PRICING
        </div>
        <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base mb-8">
          Start protecting your crypto ecosystem today with flexible plans for every need
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 rounded-full border border-yellow-500/30 bg-black/50 p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !isYearly 
                ? "bg-yellow-500 text-black shadow-[0_0_15px_#ffd70066]" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isYearly 
                ? "bg-yellow-500 text-black shadow-[0_0_15px_#ffd70066]" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Yearly
            <span className="ml-1 text-[10px] text-green-400">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const Icon = plan.icon
          return (
            <div
              key={idx}
              className={`relative rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? "border-yellow-500/70 bg-black/70 shadow-[0_0_50px_#ffd70033]" 
                  : "border-yellow-500/30 bg-black/50 hover:border-yellow-500/50 hover:shadow-[0_0_30px_#ffd70022]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black shadow-[0_0_20px_#ffd70066]">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-4 ${
                  plan.popular 
                    ? "bg-yellow-500 shadow-[0_0_20px_#ffd70066]" 
                    : "bg-yellow-500/20"
                }`}>
                  <Icon className={`size-6 ${plan.popular ? "text-black" : "text-yellow-400"}`} />
                </div>

                <h3 className="text-xl font-bold text-yellow-300 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-6">
                  {plan.price.monthly ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        ${isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-white">Custom Pricing</div>
                  )}
                  {isYearly && plan.price.monthly && (
                    <p className="text-xs text-gray-500 mt-1">
                      Billed annually (${(plan.price.yearly || 0) * 12}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="size-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setRegOpen(true)}
                  className={`w-full rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
                      : "bg-transparent border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">
          Need a custom solution?{" "}
          <button 
            onClick={() => setRegOpen(true)}
            className="text-yellow-400 hover:text-yellow-300 font-medium underline underline-offset-4"
          >
            Contact our sales team
          </button>
        </p>
      </div>

      <RegistrationModal open={regOpen} onOpenChange={setRegOpen} />
    </section>
  )
}
