"use client"

import { useEffect, useMemo, useState } from "react"

export type TxStatus = "safe" | "risky" | "fraud"
export type Tx = {
  id: string
  amount: number
  from: string
  to: string
  latLngFrom: [number, number]
  latLngTo: [number, number]
  status: TxStatus
}

const COUNTRIES = [
  { code: "US", name: "United States", lat: 38, lng: -97 },
  { code: "IN", name: "India", lat: 20, lng: 77 },
  { code: "CN", name: "China", lat: 35, lng: 103 },
  { code: "GB", name: "United Kingdom", lat: 54, lng: -2 },
  { code: "JP", name: "Japan", lat: 36, lng: 138 },
  { code: "BR", name: "Brazil", lat: -10, lng: -55 },
  { code: "NG", name: "Nigeria", lat: 9, lng: 8 },
  { code: "RU", name: "Russia", lat: 60, lng: 90 },
  { code: "DE", name: "Germany", lat: 51, lng: 9 },
  { code: "AE", name: "UAE", lat: 24, lng: 54 },
]

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomStatus(): TxStatus {
  const r = Math.random()
  if (r < 0.7) return "safe"
  if (r < 0.9) return "risky"
  return "fraud"
}

export function useTransactions() {
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    const id = setInterval(() => {
      const a = pick(COUNTRIES)
      let b = pick(COUNTRIES)
      if (b.code === a.code) b = pick(COUNTRIES)
      const status = randomStatus()
      const amount = Math.floor(Math.random() * 10000) + 100
      setTxs((prev) =>
        [
          {
            id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            amount,
            from: a.name,
            to: b.name,
            latLngFrom: [a.lat, a.lng],
            latLngTo: [b.lat, b.lng],
            status,
          },
          ...prev,
        ].slice(0, 50)
      )
    }, 500)
    return () => clearInterval(id)
  }, [])

  const leaderboard = useMemo(() => {
    const counts: Record<string, number> = {}
    txs.forEach((t) => {
      if (t.status === "fraud") {
        counts[t.to] = (counts[t.to] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [txs])

  const perMinute = useMemo(() => {
    const now = Date.now()
    const safeBuckets: Record<number, number> = {}
    const riskyBuckets: Record<number, number> = {}
    const fraudBuckets: Record<number, number> = {}
    txs.forEach((t) => {
      const minute = Math.floor((now - parseInt(t.id.split("-")[0])) / 60000)
      if (t.status === "safe") {
        safeBuckets[minute] = (safeBuckets[minute] || 0) + 1
      } else if (t.status === "risky") {
        riskyBuckets[minute] = (riskyBuckets[minute] || 0) + 1
      } else {
        fraudBuckets[minute] = (fraudBuckets[minute] || 0) + 1
      }
    })
    const data = Array.from({ length: 10 }, (_, i) => {
      const key = 9 - i
      return { 
        name: `${key}m`, 
        safe: safeBuckets[key] || 0,
        risky: riskyBuckets[key] || 0,
        fraud: fraudBuckets[key] || 0
      }
    })
    return data
  }, [txs])

  return { txs, leaderboard, perMinute }
}