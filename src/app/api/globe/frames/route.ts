import { NextRequest, NextResponse } from "next/server"

const COUNTRIES = [
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

function randomStatus(): "safe" | "risky" | "fraud" {
  const r = Math.random()
  if (r < 0.7) return "safe"
  if (r < 0.9) return "risky"
  return "fraud"
}

function getRiskScore(status: "safe" | "risky" | "fraud"): number {
  if (status === "safe") return Math.random() * 0.3
  if (status === "risky") return 0.3 + Math.random() * 0.4
  return 0.7 + Math.random() * 0.3
}

interface AggregatedArc {
  from_country: string
  to_country: string
  from_lat: number
  from_lng: number
  to_lat: number
  to_lng: number
  total_volume: number
  tx_count: number
  max_risk: number
  avg_risk: number
  classification: "safe" | "risky" | "fraud"
  chains: string[]
}

interface Frame {
  timestamp: string
  window_seconds: number
  arcs: AggregatedArc[]
  hotspots: {
    country: string
    lat: number
    lng: number
    activity_score: number
    fraud_count: number
    risk_level: "low" | "medium" | "high"
  }[]
  summary: {
    total_tx: number
    total_volume: number
    safe_count: number
    risky_count: number
    fraud_count: number
    top_routes: { from: string; to: string; count: number }[]
  }
}

function generateFrame(windowSeconds: number = 5): Frame {
  const txCount = Math.floor(20 + Math.random() * 30)
  const txs: {
    from: typeof COUNTRIES[0]
    to: typeof COUNTRIES[0]
    status: "safe" | "risky" | "fraud"
    riskScore: number
    amount: number
    chain: string
  }[] = []

  for (let i = 0; i < txCount; i++) {
    const from = pick(COUNTRIES)
    let to = pick(COUNTRIES)
    while (to.code === from.code) to = pick(COUNTRIES)
    
    const status = randomStatus()
    txs.push({
      from,
      to,
      status,
      riskScore: getRiskScore(status),
      amount: Math.floor(100 + Math.random() * 50000),
      chain: pick(CHAINS),
    })
  }

  const arcMap = new Map<string, AggregatedArc>()
  txs.forEach(tx => {
    const key = `${tx.from.code}-${tx.to.code}`
    const existing = arcMap.get(key)
    if (existing) {
      existing.total_volume += tx.amount
      existing.tx_count++
      existing.max_risk = Math.max(existing.max_risk, tx.riskScore)
      existing.avg_risk = (existing.avg_risk * (existing.tx_count - 1) + tx.riskScore) / existing.tx_count
      if (!existing.chains.includes(tx.chain)) existing.chains.push(tx.chain)
      if (tx.status === "fraud") existing.classification = "fraud"
      else if (tx.status === "risky" && existing.classification !== "fraud") existing.classification = "risky"
    } else {
      arcMap.set(key, {
        from_country: tx.from.name,
        to_country: tx.to.name,
        from_lat: tx.from.lat,
        from_lng: tx.from.lng,
        to_lat: tx.to.lat,
        to_lng: tx.to.lng,
        total_volume: tx.amount,
        tx_count: 1,
        max_risk: tx.riskScore,
        avg_risk: tx.riskScore,
        classification: tx.status,
        chains: [tx.chain],
      })
    }
  })

  const countryActivity = new Map<string, { fraud: number; total: number; volume: number }>()
  txs.forEach(tx => {
    [tx.from, tx.to].forEach(c => {
      const existing = countryActivity.get(c.code) || { fraud: 0, total: 0, volume: 0 }
      existing.total++
      existing.volume += tx.amount
      if (tx.status === "fraud") existing.fraud++
      countryActivity.set(c.code, existing)
    })
  })

  const hotspots = Array.from(countryActivity.entries())
    .filter(([_, data]) => data.total >= 3)
    .map(([code, data]) => {
      const country = COUNTRIES.find(c => c.code === code)!
      return {
        country: country.name,
        lat: country.lat,
        lng: country.lng,
        activity_score: data.total + data.volume / 10000,
        fraud_count: data.fraud,
        risk_level: (data.fraud > 3 ? "high" : data.fraud > 0 ? "medium" : "low") as "low" | "medium" | "high",
      }
    })
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 15)

  const routeCounts = new Map<string, number>()
  txs.forEach(tx => {
    const key = `${tx.from.name}-${tx.to.name}`
    routeCounts.set(key, (routeCounts.get(key) || 0) + 1)
  })
  const topRoutes = Array.from(routeCounts.entries())
    .map(([key, count]) => {
      const [from, to] = key.split("-")
      return { from, to, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    timestamp: new Date().toISOString(),
    window_seconds: windowSeconds,
    arcs: Array.from(arcMap.values()),
    hotspots,
    summary: {
      total_tx: txs.length,
      total_volume: txs.reduce((sum, t) => sum + t.amount, 0),
      safe_count: txs.filter(t => t.status === "safe").length,
      risky_count: txs.filter(t => t.status === "risky").length,
      fraud_count: txs.filter(t => t.status === "fraud").length,
      top_routes: topRoutes,
    },
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  const windowSeconds = parseInt(searchParams.get("window") || "5")
  const count = parseInt(searchParams.get("count") || "10")

  const frames: Frame[] = []
  for (let i = 0; i < Math.min(count, 60); i++) {
    frames.push(generateFrame(windowSeconds))
  }

  return NextResponse.json({
    frames,
    meta: {
      start: start || new Date(Date.now() - 60000).toISOString(),
      end: end || new Date().toISOString(),
      window_seconds: windowSeconds,
      total_frames: frames.length,
    },
  })
}
