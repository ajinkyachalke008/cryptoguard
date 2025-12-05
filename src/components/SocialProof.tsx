"use client"

import { useState, useEffect } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Compliance",
    company: "CryptoVault Exchange",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    quote: "Cryptoguard reduced our fraud losses by 94% in the first quarter. The AI detection is incredibly accurate.",
    rating: 5,
  },
  {
    name: "Michael Torres",
    role: "CTO",
    company: "BlockSecure Inc",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    quote: "The real-time monitoring and graph analysis helped us uncover a $2M fraud ring within hours.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Risk Manager",
    company: "DeFi Protocol",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    quote: "Game-changing technology. Our investigation time dropped from days to minutes with their AI tools.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Security Director",
    company: "TokenTrust",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    quote: "The hybrid detection combining graph analysis with LLM reasoning catches sophisticated fraud we missed before.",
    rating: 5,
  },
]

const partners = [
  { name: "Binance", logo: "₿" },
  { name: "Coinbase", logo: "C" },
  { name: "Kraken", logo: "K" },
  { name: "Chainalysis", logo: "◈" },
  { name: "Elliptic", logo: "E" },
  { name: "CipherTrace", logo: "CT" },
]

const trustBadges = [
  { label: "SOC 2 Type II", icon: Shield },
  { label: "GDPR Compliant", icon: CheckCircle },
  { label: "ISO 27001", icon: Shield },
  { label: "PCI DSS", icon: CheckCircle },
]

export function SocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
          <Star className="size-3 text-yellow-400 fill-yellow-400" />
          TRUSTED BY INDUSTRY LEADERS
        </div>
        <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
          What Our Clients Say
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          Join thousands of companies protecting their crypto ecosystem with Cryptoguard
        </p>
      </div>

      {/* Testimonials Carousel */}
      <div className="relative max-w-3xl mx-auto mb-16">
        <div className="overflow-hidden rounded-2xl border border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="min-w-full p-8">
                <Quote className="size-10 text-yellow-500/30 mb-4" />
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-yellow-500/50 shadow-[0_0_15px_#ffd70044]">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-yellow-300">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-yellow-500/70">{testimonial.company}</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full border border-yellow-500/50 bg-black/80 p-2 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 transition-all shadow-[0_0_15px_#ffd70033]"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full border border-yellow-500/50 bg-black/80 p-2 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 transition-all shadow-[0_0_15px_#ffd70033]"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(idx)
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? "w-6 bg-yellow-400 shadow-[0_0_10px_#ffd700]" 
                  : "w-2 bg-yellow-500/30 hover:bg-yellow-500/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Partner Logos */}
      <div className="mb-12">
        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-6">
          Integrated With Leading Platforms
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partners.map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center h-16 w-24 rounded-lg border border-yellow-500/20 bg-black/40 text-2xl font-black text-yellow-500/60 hover:text-yellow-400 hover:border-yellow-500/50 hover:shadow-[0_0_20px_#ffd70022] transition-all cursor-default"
              title={partner.name}
            >
              {partner.logo}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4">
        {trustBadges.map((badge, idx) => {
          const Icon = badge.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-black/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm"
            >
              <Icon className="size-4 text-yellow-400" />
              {badge.label}
            </div>
          )
        })}
      </div>
    </section>
  )
}
