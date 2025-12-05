"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Wallet, Activity, TrendingUp } from "lucide-react"

interface StatProps {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
  duration?: number
}

function AnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function StatCard({ icon, value, suffix, label, duration }: StatProps) {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-black/60 px-4 py-3 backdrop-blur-sm shadow-[0_0_20px_#ffd70022] transition-all duration-300 hover:border-yellow-500/70 hover:shadow-[0_0_30px_#ffd70044] hover:scale-[1.02]">
      <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 shadow-[0_0_15px_#ffd70066]">
        {icon}
      </div>
      <div>
        <div className="text-xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          <AnimatedCounter value={value} suffix={suffix} duration={duration} />
        </div>
        <div className="text-xs text-gray-400 font-medium">{label}</div>
      </div>
    </div>
  )
}

export function FloatingStats() {
  const stats = [
    { icon: <Shield className="size-5 text-black" />, value: 2500000000, suffix: "", label: "Protected Volume", displayValue: "$2.5B+" },
    { icon: <Wallet className="size-5 text-black" />, value: 50000, suffix: "+", label: "Wallets Scanned" },
    { icon: <Activity className="size-5 text-black" />, value: 1200000, suffix: "+", label: "Transactions Analyzed" },
    { icon: <TrendingUp className="size-5 text-black" />, value: 99, suffix: ".9%", label: "Detection Accuracy" },
  ]

  return (
    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          icon={stat.icon}
          value={stat.value}
          suffix={stat.suffix}
          label={stat.label}
          duration={2000 + idx * 200}
        />
      ))}
    </div>
  )
}
