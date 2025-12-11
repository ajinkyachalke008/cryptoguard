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
  riskScore: number
  chain: string
  timestamp: number
}

export const COUNTRIES = [
  { code: "US", name: "United States", lat: 38.0, lng: -97.0 },
  { code: "CA", name: "Canada", lat: 56.0, lng: -106.0 },
  { code: "MX", name: "Mexico", lat: 23.0, lng: -102.0 },
  { code: "BR", name: "Brazil", lat: -10.0, lng: -55.0 },
  { code: "AR", name: "Argentina", lat: -34.0, lng: -64.0 },
  { code: "GB", name: "United Kingdom", lat: 55.0, lng: -3.0 },
  { code: "FR", name: "France", lat: 46.0, lng: 2.0 },
  { code: "DE", name: "Germany", lat: 51.0, lng: 10.0 },
  { code: "ES", name: "Spain", lat: 40.0, lng: -4.0 },
  { code: "IT", name: "Italy", lat: 42.0, lng: 12.0 },
  { code: "NL", name: "Netherlands", lat: 52.0, lng: 5.0 },
  { code: "RU", name: "Russia", lat: 55.75, lng: 37.62 },
  { code: "CN", name: "China", lat: 35.0, lng: 103.0 },
  { code: "IN", name: "India", lat: 21.0, lng: 78.0 },
  { code: "PK", name: "Pakistan", lat: 30.0, lng: 70.0 },
  { code: "BD", name: "Bangladesh", lat: 23.7, lng: 90.4 },
  { code: "JP", name: "Japan", lat: 36.0, lng: 138.0 },
  { code: "KR", name: "South Korea", lat: 37.0, lng: 127.0 },
  { code: "AU", name: "Australia", lat: -25.0, lng: 133.0 },
  { code: "NZ", name: "New Zealand", lat: -41.0, lng: 174.0 },
  { code: "ZA", name: "South Africa", lat: -30.0, lng: 25.0 },
  { code: "NG", name: "Nigeria", lat: 9.0, lng: 8.0 },
  { code: "EG", name: "Egypt", lat: 26.0, lng: 30.0 },
  { code: "AE", name: "UAE", lat: 24.0, lng: 54.0 },
  { code: "TR", name: "Turkey", lat: 39.0, lng: 35.0 },
  { code: "SA", name: "Saudi Arabia", lat: 24.0, lng: 45.0 },
  { code: "ID", name: "Indonesia", lat: -5.0, lng: 120.0 },
  { code: "VN", name: "Vietnam", lat: 14.0, lng: 108.0 },
  { code: "TH", name: "Thailand", lat: 15.0, lng: 100.0 },
  { code: "PH", name: "Philippines", lat: 13.0, lng: 122.0 },
  { code: "PL", name: "Poland", lat: 52.0, lng: 21.0 },
  { code: "SE", name: "Sweden", lat: 60.0, lng: 18.0 },
  { code: "NO", name: "Norway", lat: 60.0, lng: 10.0 },
  { code: "CL", name: "Chile", lat: -33.0, lng: -70.0 },
  { code: "CO", name: "Colombia", lat: 4.0, lng: -72.0 },
  { code: "KE", name: "Kenya", lat: -1.0, lng: 37.0 },
  { code: "SG", name: "Singapore", lat: 1.35, lng: 103.82 },
  { code: "HK", name: "Hong Kong", lat: 22.3, lng: 114.2 },
  { code: "CH", name: "Switzerland", lat: 46.8, lng: 8.2 },
  { code: "PT", name: "Portugal", lat: 39.4, lng: -8.2 },
]

const CHAINS = ["BTC", "ETH", "SOL", "USDT", "BNB", "XRP", "ADA", "MATIC"]

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomStatus(): TxStatus {
  const r = Math.random()
  if (r < 0.7) return "safe"
  if (r < 0.9) return "risky"
  return "fraud"
}

function getRiskScore(status: TxStatus): number {
  if (status === "safe") return Math.random() * 0.3
  if (status === "risky") return 0.3 + Math.random() * 0.4
  return 0.7 + Math.random() * 0.3
}

export function useTransactions() {
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    const now = Date.now()
    const initialTxs: Tx[] = []
    for (let m = 0; m <= 9; m++) {
      const numTxsInMinute = 8 + (9 - m) * 3
      const tsBase = now - m * 60000
      for (let j = 0; j < numTxsInMinute; j++) {
        const ts = tsBase - Math.random() * 60000
        const a = pick(COUNTRIES)
        let b = pick(COUNTRIES)
        while (b.code === a.code) b = pick(COUNTRIES)
        const status = randomStatus()
        const amount = Math.floor(Math.random() * 50000) + 100
        initialTxs.push({
          id: `${Math.floor(ts)}-${Math.floor(Math.random() * 9999)}`,
          amount,
          from: a.name,
          to: b.name,
          latLngFrom: [a.lat, a.lng],
          latLngTo: [b.lat, b.lng],
          status,
          riskScore: getRiskScore(status),
          chain: pick(CHAINS),
          timestamp: ts,
        })
      }
    }
    setTxs(initialTxs)

    const id = setInterval(() => {
      const a = pick(COUNTRIES)
      let b = pick(COUNTRIES)
      if (b.code === a.code) b = pick(COUNTRIES)
      const status = randomStatus()
      const amount = Math.floor(Math.random() * 50000) + 100
      const now = Date.now()
      setTxs((prev) => [
        {
          id: `${now}-${Math.floor(Math.random() * 9999)}`,
          amount,
          from: a.name,
          to: b.name,
          latLngFrom: [a.lat, a.lng],
          latLngTo: [b.lat, b.lng],
          status,
          riskScore: getRiskScore(status),
          chain: pick(CHAINS),
          timestamp: now,
        },
        ...prev,
      ].slice(0, 1500))
    }, 400)

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