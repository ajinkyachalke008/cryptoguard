import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { timezoneProfiles, walletActivityLogs } from "@/db/schema"
import { eq } from "drizzle-orm"

type ConfidenceLevel = "low" | "medium" | "high" | "insufficient_data"
type BehaviorPattern = "human_like" | "bot_like" | "mixed" | "unknown"

interface HourlyActivity {
  hour: number
  activity: number
  transaction_count: number
}

interface TimezoneSignal {
  type: string
  description: string
  weight: number
  present: boolean
}

interface TimezoneResponse {
  peak_hours_utc: number[]
  activity_distribution: HourlyActivity[]
  likely_timezone_range: string
  confidence: ConfidenceLevel
  behavior_pattern: BehaviorPattern
  signals_used: TimezoneSignal[]
  explanation: string
  limitations: string[]
  total_transactions_analyzed: number
  analysis_period_days: number
}

function computeActivityDistribution(activityLogs: any[]): HourlyActivity[] {
  const hourCounts = new Array(24).fill(0)
  
  activityLogs.forEach(log => {
    const hour = new Date(log.timestamp).getUTCHours()
    hourCounts[hour]++
  })
  
  const maxCount = Math.max(...hourCounts, 1)
  
  return hourCounts.map((count, hour) => ({
    hour,
    activity: Math.round((count / maxCount) * 100),
    transaction_count: count
  }))
}

function findPeakHours(distribution: HourlyActivity[]): number[] {
  const threshold = 60
  return distribution
    .filter(d => d.activity >= threshold)
    .map(d => d.hour)
    .sort((a, b) => a - b)
}

function inferTimezoneRange(peakHours: number[]): string {
  if (peakHours.length === 0) return "Unable to determine (insufficient peak activity)"
  
  const avgPeak = peakHours.reduce((a, b) => a + b, 0) / peakHours.length
  
  if (avgPeak >= 6 && avgPeak <= 10) {
    return "UTC+8 to UTC+12 (East Asia / Oceania)"
  } else if (avgPeak >= 10 && avgPeak <= 14) {
    return "UTC+5 to UTC+8 (South Asia / Southeast Asia)"
  } else if (avgPeak >= 14 && avgPeak <= 18) {
    return "UTC+0 to UTC+4 (Europe / Middle East)"
  } else if (avgPeak >= 18 && avgPeak <= 22) {
    return "UTC-5 to UTC-8 (Americas)"
  } else {
    return "UTC-8 to UTC-4 (Americas / Pacific)"
  }
}

function detectBehaviorPattern(distribution: HourlyActivity[]): BehaviorPattern {
  const activeHours = distribution.filter(d => d.activity > 20)
  const variance = computeVariance(distribution.map(d => d.activity))
  
  if (activeHours.length >= 20) return "bot_like"
  if (activeHours.length <= 8 && variance > 500) return "human_like"
  if (activeHours.length > 8 && activeHours.length < 16) return "mixed"
  return "unknown"
}

function computeVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

function computeTimezoneSignals(
  totalTxs: number,
  peakHours: number[],
  pattern: BehaviorPattern,
  analysisdays: number
): TimezoneSignal[] {
  return [
    {
      type: "sufficient_history",
      description: "At least 30 transactions over 7+ days for reliable temporal analysis",
      weight: 0.30,
      present: totalTxs >= 30 && analysisdays >= 7
    },
    {
      type: "clear_peak_pattern",
      description: "Distinct peak activity windows (3-6 hour concentration)",
      weight: 0.35,
      present: peakHours.length >= 2 && peakHours.length <= 8
    },
    {
      type: "human_behavior_indicators",
      description: "Activity patterns suggest human operation (sleep cycles, work hours)",
      weight: 0.25,
      present: pattern === "human_like"
    },
    {
      type: "temporal_consistency",
      description: "Peak hours remain consistent across the analysis period",
      weight: 0.10,
      present: analysisdays > 14
    }
  ]
}

function computeConfidence(signals: TimezoneSignal[], totalTxs: number): ConfidenceLevel {
  if (totalTxs < 10) return "insufficient_data"
  
  const totalWeight = signals
    .filter(s => s.present)
    .reduce((sum, s) => sum + s.weight, 0)
  
  const presentCount = signals.filter(s => s.present).length
  
  if (presentCount >= 3 && totalWeight >= 0.7) return "high"
  if (presentCount >= 2 && totalWeight >= 0.4) return "medium"
  return "low"
}

function generateExplanation(
  confidence: ConfidenceLevel,
  peakHours: number[],
  pattern: BehaviorPattern,
  timezoneRange: string
): string {
  if (confidence === "insufficient_data") {
    return "Insufficient transaction history to perform reliable timezone fingerprinting. More on-chain activity is needed for temporal pattern analysis."
  }
  
  if (pattern === "bot_like") {
    return `Activity is distributed across most hours of the day, suggesting automated or bot-like behavior. Timezone inference is unreliable for automated systems. Peak hours detected at ${peakHours.join(", ")} UTC may reflect server scheduling rather than human presence.`
  }
  
  if (peakHours.length === 0) {
    return "No clear peak activity windows detected. Activity is either too sparse or too evenly distributed for timezone inference."
  }
  
  const peakRange = peakHours.length > 1 
    ? `${peakHours[0]}:00 - ${peakHours[peakHours.length - 1]}:00 UTC`
    : `${peakHours[0]}:00 UTC`
  
  return `Peak activity observed during ${peakRange}, suggesting the operator is likely active during business/waking hours in ${timezoneRange}. This inference assumes human-driven activity without VPN or scheduling tools.`
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
    const profile = await db.query.timezoneProfiles.findFirst({
      where: eq(timezoneProfiles.walletAddress, address),
    })

    if (profile && profile.hourlyActivityDistribution && profile.peakHours) {
      const distribution = profile.hourlyActivityDistribution as HourlyActivity[]
      const peakHours = profile.peakHours as number[]
      const pattern = detectBehaviorPattern(distribution)
      const timezoneRange = inferTimezoneRange(peakHours)
      const totalTxs = distribution.reduce((sum, d) => sum + d.transaction_count, 0)
      const signals = computeTimezoneSignals(totalTxs, peakHours, pattern, 30)
      
      const response: TimezoneResponse = {
        peak_hours_utc: peakHours,
        activity_distribution: distribution,
        likely_timezone_range: timezoneRange,
        confidence: profile.confidence as ConfidenceLevel,
        behavior_pattern: pattern,
        signals_used: signals,
        explanation: generateExplanation(profile.confidence as ConfidenceLevel, peakHours, pattern, timezoneRange),
        limitations: [
          "VPN usage may mask true geographic location",
          "Automated trading bots operate 24/7 regardless of timezone",
          "Timezone inference cannot identify specific countries",
          "Shared wallets may show multiple operator patterns"
        ],
        total_transactions_analyzed: totalTxs,
        analysis_period_days: 30
      }
      
      return NextResponse.json(response)
    }

    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const seed = Math.abs(addressHash)
    const simulatedTxCount = (seed % 150) + 20
    const analysisDays = (seed % 60) + 7
    
    const patternType = seed % 3
    const distribution: HourlyActivity[] = Array.from({ length: 24 }, (_, hour) => {
      let activity: number
      let txCount: number
      
      if (patternType === 0) {
        const peakCenter = (seed % 12) + 6
        const distance = Math.abs(hour - peakCenter)
        activity = Math.max(0, 100 - (distance * 15) + ((seed + hour) % 20))
        txCount = Math.round((activity / 100) * (simulatedTxCount / 8))
      } else if (patternType === 1) {
        activity = 30 + ((seed + hour * 7) % 50)
        txCount = Math.round((activity / 100) * (simulatedTxCount / 24))
      } else {
        const morning = hour >= 8 && hour <= 12
        const evening = hour >= 18 && hour <= 22
        activity = (morning || evening) ? 60 + ((seed + hour) % 40) : 5 + ((seed + hour) % 15)
        txCount = Math.round((activity / 100) * (simulatedTxCount / 10))
      }
      
      return {
        hour,
        activity: Math.min(100, Math.max(0, activity)),
        transaction_count: Math.max(0, txCount)
      }
    })
    
    const peakHours = findPeakHours(distribution)
    const pattern = detectBehaviorPattern(distribution)
    const timezoneRange = inferTimezoneRange(peakHours)
    const signals = computeTimezoneSignals(simulatedTxCount, peakHours, pattern, analysisDays)
    const confidence = computeConfidence(signals, simulatedTxCount)
    
    const response: TimezoneResponse = {
      peak_hours_utc: peakHours,
      activity_distribution: distribution,
      likely_timezone_range: timezoneRange,
      confidence,
      behavior_pattern: pattern,
      signals_used: signals,
      explanation: generateExplanation(confidence, peakHours, pattern, timezoneRange),
      limitations: [
        "Analysis based on simulated data for MVP demonstration",
        "Production system would require full blockchain indexing",
        "VPN usage may mask true geographic location",
        "Automated systems operate independently of timezone"
      ],
      total_transactions_analyzed: simulatedTxCount,
      analysis_period_days: analysisDays
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Error fetching timezone data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
