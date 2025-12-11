import { NextRequest, NextResponse } from "next/server"

const COUNTRIES = [
  { code: "US", name: "United States", lat: 38.0, lng: -97.0 },
  { code: "CN", name: "China", lat: 35.0, lng: 103.0 },
  { code: "RU", name: "Russia", lat: 55.75, lng: 37.62 },
  { code: "NG", name: "Nigeria", lat: 9.0, lng: 8.0 },
  { code: "AE", name: "UAE", lat: 24.0, lng: 54.0 },
  { code: "DE", name: "Germany", lat: 51.0, lng: 10.0 },
  { code: "JP", name: "Japan", lat: 36.0, lng: 138.0 },
  { code: "BR", name: "Brazil", lat: -10.0, lng: -55.0 },
  { code: "IN", name: "India", lat: 21.0, lng: 78.0 },
  { code: "GB", name: "United Kingdom", lat: 55.0, lng: -3.0 },
  { code: "SG", name: "Singapore", lat: 1.35, lng: 103.82 },
  { code: "KR", name: "South Korea", lat: 37.0, lng: 127.0 },
  { code: "AU", name: "Australia", lat: -25.0, lng: 133.0 },
  { code: "CH", name: "Switzerland", lat: 46.8, lng: 8.2 },
  { code: "HK", name: "Hong Kong", lat: 22.3, lng: 114.2 },
]

export async function GET() {
  const regionCounters = {
    north_america: Math.floor(100 + Math.random() * 200),
    south_america: Math.floor(50 + Math.random() * 100),
    europe: Math.floor(150 + Math.random() * 250),
    asia: Math.floor(200 + Math.random() * 300),
    africa: Math.floor(30 + Math.random() * 80),
    oceania: Math.floor(20 + Math.random() * 50),
  }

  const topCountries = COUNTRIES.slice(0, 10).map(c => ({
    country: c.name,
    code: c.code,
    lat: c.lat,
    lng: c.lng,
    tx_count: Math.floor(50 + Math.random() * 150),
    volume: Math.floor(100000 + Math.random() * 500000),
    fraud_rate: Math.random() * 0.15,
    risk_score: Math.random(),
  })).sort((a, b) => b.tx_count - a.tx_count)

  const highActivityNodes = COUNTRIES.filter(() => Math.random() > 0.6).map(c => ({
    country: c.name,
    code: c.code,
    lat: c.lat,
    lng: c.lng,
    activity_level: Math.random() > 0.7 ? "critical" : Math.random() > 0.4 ? "high" : "elevated",
    recent_fraud_count: Math.floor(Math.random() * 10),
    alert_count: Math.floor(Math.random() * 5),
  }))

  const globalStats = {
    total_transactions: regionCounters.north_america + regionCounters.south_america + 
                        regionCounters.europe + regionCounters.asia + 
                        regionCounters.africa + regionCounters.oceania,
    total_volume: Math.floor(1000000 + Math.random() * 5000000),
    average_risk_score: 0.25 + Math.random() * 0.2,
    fraud_percentage: 5 + Math.random() * 10,
    active_countries: Math.floor(30 + Math.random() * 10),
    live_connections: Math.floor(100 + Math.random() * 200),
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    region_counters: regionCounters,
    top_countries: topCountries,
    high_activity_nodes: highActivityNodes,
    global_stats: globalStats,
    chains: {
      BTC: { tx_count: Math.floor(100 + Math.random() * 200), volume: Math.floor(500000 + Math.random() * 1000000) },
      ETH: { tx_count: Math.floor(150 + Math.random() * 250), volume: Math.floor(400000 + Math.random() * 800000) },
      SOL: { tx_count: Math.floor(80 + Math.random() * 150), volume: Math.floor(200000 + Math.random() * 400000) },
      USDT: { tx_count: Math.floor(200 + Math.random() * 300), volume: Math.floor(1000000 + Math.random() * 2000000) },
      BNB: { tx_count: Math.floor(60 + Math.random() * 100), volume: Math.floor(150000 + Math.random() * 300000) },
    },
  })
}
