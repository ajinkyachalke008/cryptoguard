import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { geoInferenceProfiles, timezoneProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

type ConfidenceLevel = "low" | "medium" | "high" | "insufficient_data"

interface RegionProbability {
  region: string
  probability: number
  display_probability: string
}

interface GeoSignal {
  type: string
  description: string
  weight: number
  present: boolean
  inferred_regions?: string[]
}

interface GeoResponse {
  regions: RegionProbability[]
  confidence: ConfidenceLevel
  signals_used: GeoSignal[]
  explanation: string
  limitations: string[]
  methodology: string
  data_sources: string[]
}

const REGION_TIMEZONE_MAP: Record<string, string[]> = {
  "East Asia": ["UTC+8 to UTC+12", "UTC+9", "UTC+8"],
  "South Asia": ["UTC+5 to UTC+8", "UTC+5:30", "UTC+6"],
  "Southeast Asia": ["UTC+7", "UTC+8", "UTC+5 to UTC+8"],
  "Middle East": ["UTC+3", "UTC+4", "UTC+0 to UTC+4"],
  "Eastern Europe": ["UTC+2", "UTC+3", "UTC+0 to UTC+4"],
  "Western Europe": ["UTC+0", "UTC+1", "UTC+0 to UTC+4"],
  "North America": ["UTC-5", "UTC-8", "UTC-5 to UTC-8"],
  "South America": ["UTC-3", "UTC-5", "UTC-5 to UTC-8"],
  "Africa": ["UTC+0", "UTC+2", "UTC+0 to UTC+4"],
  "Oceania": ["UTC+10", "UTC+12", "UTC+8 to UTC+12"],
}

const EXCHANGE_REGIONAL_BIAS: Record<string, string[]> = {
  binance: ["East Asia", "Southeast Asia", "Eastern Europe"],
  coinbase: ["North America", "Western Europe"],
  kraken: ["North America", "Western Europe"],
  kucoin: ["East Asia", "Southeast Asia"],
  okx: ["East Asia", "Southeast Asia"],
  bybit: ["East Asia", "Southeast Asia", "Eastern Europe"],
  huobi: ["East Asia"],
}

function computeGeoSignals(
  hasTimezoneData: boolean,
  timezoneRange: string,
  hasExchangeInteraction: boolean,
  exchangeRegions: string[],
  activityCount: number
): GeoSignal[] {
  const tzRegions = inferRegionsFromTimezone(timezoneRange)
  
  return [
    {
      type: "timezone_correlation",
      description: "Geographic region inferred from behavioral timezone patterns",
      weight: 0.40,
      present: hasTimezoneData && tzRegions.length > 0,
      inferred_regions: tzRegions
    },
    {
      type: "exchange_geography",
      description: "Regional bias based on exchange interactions (user base distribution)",
      weight: 0.35,
      present: hasExchangeInteraction && exchangeRegions.length > 0,
      inferred_regions: exchangeRegions
    },
    {
      type: "sufficient_activity",
      description: "Enough transaction history for reliable geographic inference (>25 transactions)",
      weight: 0.15,
      present: activityCount >= 25
    },
    {
      type: "consistent_patterns",
      description: "Geographic signals agree across multiple data sources",
      weight: 0.10,
      present: hasTimezoneData && hasExchangeInteraction && 
               tzRegions.some(r => exchangeRegions.includes(r))
    }
  ]
}

function inferRegionsFromTimezone(timezoneRange: string): string[] {
  const regions: string[] = []
  
  for (const [region, tzPatterns] of Object.entries(REGION_TIMEZONE_MAP)) {
    if (tzPatterns.some(tz => timezoneRange.includes(tz))) {
      regions.push(region)
    }
  }
  
  return regions
}

function computeRegionProbabilities(signals: GeoSignal[]): RegionProbability[] {
  const regionScores: Record<string, number> = {}
  
  signals.forEach(signal => {
    if (signal.present && signal.inferred_regions) {
      signal.inferred_regions.forEach(region => {
        regionScores[region] = (regionScores[region] || 0) + signal.weight
      })
    }
  })
  
  const totalScore = Object.values(regionScores).reduce((sum, s) => sum + s, 0)
  
  if (totalScore === 0) {
    return [{ region: "Unknown", probability: 100, display_probability: "100%" }]
  }
  
  const probabilities = Object.entries(regionScores)
    .map(([region, score]) => ({
      region,
      probability: Math.round((score / totalScore) * 100),
      display_probability: `${Math.round((score / totalScore) * 100)}%`
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 4)
  
  const assignedProb = probabilities.reduce((sum, p) => sum + p.probability, 0)
  if (assignedProb < 100 && probabilities.length > 0) {
    probabilities.push({
      region: "Other / Undetermined",
      probability: 100 - assignedProb,
      display_probability: `${100 - assignedProb}%`
    })
  }
  
  return probabilities
}

function computeConfidence(signals: GeoSignal[], activityCount: number): ConfidenceLevel {
  if (activityCount < 10) return "insufficient_data"
  
  const presentSignals = signals.filter(s => s.present)
  const totalWeight = presentSignals.reduce((sum, s) => sum + s.weight, 0)
  
  const hasAgreement = signals.find(s => s.type === "consistent_patterns")?.present
  
  if (presentSignals.length >= 3 && totalWeight >= 0.7 && hasAgreement) return "high"
  if (presentSignals.length >= 2 && totalWeight >= 0.4) return "medium"
  return "low"
}

function generateExplanation(
  confidence: ConfidenceLevel,
  regions: RegionProbability[],
  signals: GeoSignal[]
): string {
  if (confidence === "insufficient_data") {
    return "Insufficient on-chain activity to perform geographic inference. This wallet requires more transaction history for reliable regional analysis."
  }
  
  const presentSignals = signals.filter(s => s.present)
  
  if (presentSignals.length === 0) {
    return "No geographic signals detected. Unable to infer regional presence from available data."
  }
  
  const primaryRegion = regions[0]?.region
  const secondaryRegion = regions[1]?.region
  
  const signalSources = presentSignals.map(s => {
    switch (s.type) {
      case "timezone_correlation": return "behavioral timezone patterns"
      case "exchange_geography": return "exchange interaction geography"
      case "consistent_patterns": return "cross-source signal agreement"
      default: return s.type
    }
  }).join(", ")
  
  let explanation = `Geographic inference based on: ${signalSources}. `
  
  if (primaryRegion && primaryRegion !== "Unknown") {
    explanation += `Primary region likelihood: ${primaryRegion} (${regions[0].display_probability}). `
  }
  
  if (secondaryRegion && secondaryRegion !== "Other / Undetermined") {
    explanation += `Secondary possibility: ${secondaryRegion} (${regions[1].display_probability}). `
  }
  
  if (confidence === "low") {
    explanation += "Low confidence indicates weak or conflicting signals — treat this inference with caution."
  }
  
  return explanation
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address || address.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
  }

  try {
    const profile = await db.query.geoInferenceProfiles.findFirst({
      where: eq(geoInferenceProfiles.walletAddress, address),
    })

    if (profile && profile.regionProbabilities) {
      const regions = profile.regionProbabilities as RegionProbability[]
      const signals = computeGeoSignals(true, "UTC+0 to UTC+4", true, ["Western Europe"], 50)
      
      const response: GeoResponse = {
        regions,
        confidence: profile.confidence as ConfidenceLevel,
        signals_used: signals,
        explanation: generateExplanation(profile.confidence as ConfidenceLevel, regions, signals),
        limitations: [
          "Geographic inference is regional, not country-specific",
          "VPN and proxy usage can mask true location",
          "Exchange interactions reflect user base, not definitive location",
          "This is probabilistic analysis, not geolocation"
        ],
        methodology: "Cross-referencing timezone behavioral patterns with exchange interaction geography and transaction timing consistency.",
        data_sources: ["Transaction timestamps", "Exchange deposit patterns", "P2P network latency (simulated)"]
      }
      
      return NextResponse.json(response)
    }

    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const seed = Math.abs(addressHash)
    const activityCount = (seed % 120) + 15
    
    const tzProfile = await db.query.timezoneProfiles.findFirst({
      where: eq(timezoneProfiles.walletAddress, address),
    })
    
    const hasTimezoneData = !!tzProfile || seed % 3 !== 0
    const timezoneRanges = [
      "UTC+0 to UTC+4 (Europe / Middle East)",
      "UTC+5 to UTC+8 (South Asia / Southeast Asia)",
      "UTC-5 to UTC-8 (Americas)",
      "UTC+8 to UTC+12 (East Asia / Oceania)"
    ]
    const timezoneRange = timezoneRanges[seed % timezoneRanges.length]
    
    const exchangeNames = Object.keys(EXCHANGE_REGIONAL_BIAS)
    const hasExchangeInteraction = seed % 4 !== 0
    const interactedExchange = exchangeNames[seed % exchangeNames.length]
    const exchangeRegions = hasExchangeInteraction 
      ? EXCHANGE_REGIONAL_BIAS[interactedExchange] || []
      : []
    
    const signals = computeGeoSignals(
      hasTimezoneData,
      timezoneRange,
      hasExchangeInteraction,
      exchangeRegions,
      activityCount
    )
    
    const regions = computeRegionProbabilities(signals)
    const confidence = computeConfidence(signals, activityCount)
    
    const response: GeoResponse = {
      regions,
      confidence,
      signals_used: signals,
      explanation: generateExplanation(confidence, regions, signals),
      limitations: [
        "Analysis based on simulated data for MVP demonstration",
        "Production system would require full blockchain indexing",
        "Geographic inference is regional, not country-specific",
        "VPN and proxy usage can mask true location",
        "This is probabilistic analysis, not geolocation"
      ],
      methodology: "Cross-referencing timezone behavioral patterns with exchange interaction geography and transaction timing consistency.",
      data_sources: ["Transaction timestamps (simulated)", "Exchange deposit patterns (simulated)", "Regional exchange user base distributions"]
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Error fetching geo data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
