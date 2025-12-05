"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, ArrowRight, Scan, Shield, Network, FileText } from "lucide-react"

const steps = [
  {
    icon: Scan,
    title: "Connect & Scan",
    description: "Input wallet addresses or connect your exchange API to begin real-time monitoring",
  },
  {
    icon: Shield,
    title: "AI Analysis",
    description: "Our hybrid AI engine analyzes transactions using graph analysis, rules, and LLM reasoning",
  },
  {
    icon: Network,
    title: "Risk Detection",
    description: "Identify suspicious patterns, high-risk wallets, and potential fraud in milliseconds",
  },
  {
    icon: FileText,
    title: "Action & Report",
    description: "Receive alerts, generate compliance reports, and take action on flagged transactions",
  },
]

const faqs = [
  {
    question: "How accurate is Cryptoguard's fraud detection?",
    answer: "Our AI engine achieves 99.9% accuracy in detecting known fraud patterns and continuously learns from new threats. We combine graph analysis, rule-based systems, and LLM reasoning for comprehensive coverage.",
  },
  {
    question: "What blockchains does Cryptoguard support?",
    answer: "We support all major blockchains including Ethereum, Bitcoin, Polygon, Solana, BNB Chain, Arbitrum, and Avalanche. Enterprise plans can include custom chain integrations.",
  },
  {
    question: "How fast is the real-time monitoring?",
    answer: "Our system processes transactions in under 10 milliseconds. You receive instant alerts for flagged activities, ensuring you can act before funds move further.",
  },
  {
    question: "Is Cryptoguard compliant with regulations?",
    answer: "Yes, Cryptoguard is built with compliance in mind. We support AML/KYC requirements, FATF Travel Rule, and provide audit-ready reports for regulatory submissions.",
  },
  {
    question: "Can I integrate Cryptoguard with my existing systems?",
    answer: "Absolutely. We offer REST APIs, webhooks, and pre-built integrations with popular exchanges and compliance tools. Enterprise customers get dedicated integration support.",
  },
  {
    question: "What happens when fraud is detected?",
    answer: "You receive instant alerts via email, SMS, or webhook. You can configure automated actions like flagging, blocking, or escalating to your compliance team for review.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required. Enterprise customers can request a custom POC with their own data.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      {/* How It Works */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
            <ArrowRight className="size-3 text-yellow-400" />
            HOW IT WORKS
          </div>
          <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Four simple steps to protect your crypto ecosystem from fraud
          </p>
        </div>

        {/* Steps Flow */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent hidden md:block -translate-y-1/2" />
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="relative group">
                  <div className="rounded-2xl border border-yellow-500/30 bg-black/60 p-6 text-center backdrop-blur-sm hover:border-yellow-500/60 hover:shadow-[0_0_30px_#ffd70022] transition-all">
                    {/* Step Number */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_#ffd70066]">
                      {idx + 1}
                    </div>

                    <div className="mt-4 mb-4 inline-flex items-center justify-center rounded-xl bg-yellow-500/20 p-3">
                      <Icon className="size-8 text-yellow-400" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-yellow-300 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>

                  {/* Arrow connector (desktop) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <div className="h-6 w-6 rounded-full bg-black border border-yellow-500/50 flex items-center justify-center">
                        <ArrowRight className="size-3 text-yellow-400" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
            <HelpCircle className="size-3 text-yellow-400" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Everything you need to know about Cryptoguard
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-yellow-500/30 bg-black/50 backdrop-blur-sm overflow-hidden transition-all hover:border-yellow-500/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-200 pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`size-5 text-yellow-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`} 
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? "max-h-96 pb-4" : "max-h-0"
                }`}
              >
                <p className="px-4 text-sm text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
