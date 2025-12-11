import { NextRequest, NextResponse } from "next/server"

const COUNTRIES = [
  { code: "US", name: "United States", lat: 38.0, lng: -97.0, region: "North America" },
  { code: "CA", name: "Canada", lat: 56.0, lng: -106.0, region: "North America" },
  { code: "MX", name: "Mexico", lat: 23.0, lng: -102.0, region: "North America" },
  { code: "BR", name: "Brazil", lat: -10.0, lng: -55.0, region: "South America" },
  { code: "AR", name: "Argentina", lat: -34.0, lng: -64.0, region: "South America" },
  { code: "GB", name: "United Kingdom", lat: 55.0, lng: -3.0, region: "Europe" },
  { code: "FR", name: "France", lat: 46.0, lng: 2.0, region: "Europe" },
  { code: "DE", name: "Germany", lat: 51.0, lng: 10.0, region: "Europe" },
  { code: "ES", name: "Spain", lat: 40.0, lng: -4.0, region: "Europe" },
  { code: "IT", name: "Italy", lat: 42.0, lng: 12.0, region: "Europe" },
  { code: "NL", name: "Netherlands", lat: 52.0, lng: 5.0, region: "Europe" },
  { code: "RU", name: "Russia", lat: 55.75, lng: 37.62, region: "Europe" },
  { code: "CN", name: "China", lat: 35.0, lng: 103.0, region: "Asia" },
  { code: "IN", name: "India", lat: 21.0, lng: 78.0, region: "Asia" },
  { code: "PK", name: "Pakistan", lat: 30.0, lng: 70.0, region: "Asia" },
  { code: "BD", name: "Bangladesh", lat: 23.7, lng: 90.4, region: "Asia" },
  { code: "JP", name: "Japan", lat: 36.0, lng: 138.0, region: "Asia" },
  { code: "KR", name: "South Korea", lat: 37.0, lng: 127.0, region: "Asia" },
  { code: "AU", name: "Australia", lat: -25.0, lng: 133.0, region: "Oceania" },
  { code: "NZ", name: "New Zealand", lat: -41.0, lng: 174.0, region: "Oceania" },
  { code: "ZA", name: "South Africa", lat: -30.0, lng: 25.0, region: "Africa" },
  { code: "NG", name: "Nigeria", lat: 9.0, lng: 8.0, region: "Africa" },
  { code: "EG", name: "Egypt", lat: 26.0, lng: 30.0, region: "Africa" },
  { code: "AE", name: "UAE", lat: 24.0, lng: 54.0, region: "Middle East" },
  { code: "TR", name: "Turkey", lat: 39.0, lng: 35.0, region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", lat: 24.0, lng: 45.0, region: "Middle East" },
  { code: "ID", name: "Indonesia", lat: -5.0, lng: 120.0, region: "Asia" },
  { code: "VN", name: "Vietnam", lat: 14.0, lng: 108.0, region: "Asia" },
  { code: "TH", name: "Thailand", lat: 15.0, lng: 100.0, region: "Asia" },
  { code: "PH", name: "Philippines", lat: 13.0, lng: 122.0, region: "Asia" },
  { code: "PL", name: "Poland", lat: 52.0, lng: 21.0, region: "Europe" },
  { code: "SE", name: "Sweden", lat: 60.0, lng: 18.0, region: "Europe" },
  { code: "NO", name: "Norway", lat: 60.0, lng: 10.0, region: "Europe" },
  { code: "CL", name: "Chile", lat: -33.0, lng: -70.0, region: "South America" },
  { code: "CO", name: "Colombia", lat: 4.0, lng: -72.0, region: "South America" },
  { code: "KE", name: "Kenya", lat: -1.0, lng: 37.0, region: "Africa" },
  { code: "SG", name: "Singapore", lat: 1.35, lng: 103.82, region: "Asia" },
  { code: "HK", name: "Hong Kong", lat: 22.3, lng: 114.2, region: "Asia" },
  { code: "CH", name: "Switzerland", lat: 46.8, lng: 8.2, region: "Europe" },
  { code: "PT", name: "Portugal", lat: 39.4, lng: -8.2, region: "Europe" },
]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const country = COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase())

  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 })
  }

  const topCounterparts = COUNTRIES
    .filter(c => c.code !== country.code)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map(c => ({
      country: c.name,
      code: c.code,
      tx_count: Math.floor(10 + Math.random() * 50),
      volume: Math.floor(10000 + Math.random() * 100000),
      direction: Math.random() > 0.5 ? "outbound" : "inbound",
    }))

  const timeseriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tx_count: Math.floor(5 + Math.random() * 30),
    volume: Math.floor(5000 + Math.random() * 50000),
    fraud_count: Math.floor(Math.random() * 3),
    risk_score: 0.1 + Math.random() * 0.5,
  }))

  const recentAlerts = Array.from({ length: Math.floor(Math.random() * 8) }, (_, i) => ({
    id: `alert-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    type: Math.random() > 0.5 ? "fraud" : "risky",
    amount: Math.floor(1000 + Math.random() * 50000),
    counterpart: topCounterparts[Math.floor(Math.random() * topCounterparts.length)]?.country || "Unknown",
    chain: ["BTC", "ETH", "SOL", "USDT"][Math.floor(Math.random() * 4)],
    risk_score: 0.6 + Math.random() * 0.4,
  }))

  const suspiciousWallets = Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
    address: `0x${Math.random().toString(16).slice(2, 14)}...${Math.random().toString(16).slice(2, 6)}`,
    tx_count: Math.floor(5 + Math.random() * 30),
    total_volume: Math.floor(10000 + Math.random() * 200000),
    risk_score: 0.7 + Math.random() * 0.3,
    flags: ["high_velocity", "mixer_interaction", "new_wallet", "large_transfers"]
      .filter(() => Math.random() > 0.6),
  }))

  return NextResponse.json({
    country: {
      name: country.name,
      code: country.code,
      lat: country.lat,
      lng: country.lng,
      region: country.region,
    },
    summary: {
      total_tx_24h: Math.floor(100 + Math.random() * 500),
      total_volume_24h: Math.floor(100000 + Math.random() * 1000000),
      safe_percentage: 60 + Math.random() * 25,
      risky_percentage: 10 + Math.random() * 15,
      fraud_percentage: Math.random() * 10,
      avg_risk_score: 0.2 + Math.random() * 0.3,
      trend: Math.random() > 0.5 ? "increasing" : "decreasing",
      trend_percentage: Math.random() * 20,
    },
    top_counterparts: topCounterparts,
    timeseries: timeseriesData,
    recent_alerts: recentAlerts,
    suspicious_wallets: suspiciousWallets,
    chain_breakdown: {
      BTC: { tx_count: Math.floor(20 + Math.random() * 80), percentage: 15 + Math.random() * 20 },
      ETH: { tx_count: Math.floor(30 + Math.random() * 100), percentage: 20 + Math.random() * 25 },
      SOL: { tx_count: Math.floor(10 + Math.random() * 50), percentage: 5 + Math.random() * 15 },
      USDT: { tx_count: Math.floor(40 + Math.random() * 120), percentage: 25 + Math.random() * 30 },
      OTHER: { tx_count: Math.floor(10 + Math.random() * 40), percentage: 5 + Math.random() * 10 },
    },
  })
}
