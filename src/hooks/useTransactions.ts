"use client"

import { useEffect, useMemo, useState } from "react"
import { FORENSIC_COUNTRIES, resolveForensicEntity, generateRealisticTxHash, CountryInfo } from "@/lib/services/forensicEngine"

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
  fromAddress?: string
  toAddress?: string
}

export const COUNTRIES = FORENSIC_COUNTRIES;

const CHAINS = ["ETH", "BTC", "USDT", "BNB", "MATIC", "AVAX", "ARB"]

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createTxFromSeed(seed: number, timestamp: number): Tx {
  const chain = pick(CHAINS);
  const forensic = resolveForensicEntity(`0x${seed.toString(16).padStart(8, '0')}`, chain);
  
  // Realistic 4-tier risk distribution matching specification:
  // 65% Safe (0-29), 15% Watch/Low (30-59), 12% Risky (60-84), 8% Fraud (85-100)
  const roll = seed % 100;
  let riskScore: number;
  let status: TxStatus = "safe";

  if (roll < 65) {
    riskScore = (seed % 28) + 2; // 2 - 29 (SAFE)
    status = "safe";
  } else if (roll < 80) {
    riskScore = (seed % 29) + 30; // 30 - 58 (WATCH / LOW)
    status = "safe";
  } else if (roll < 92) {
    riskScore = (seed % 24) + 60; // 60 - 83 (RISKY)
    status = "risky";
  } else {
    riskScore = (seed % 15) + 85; // 85 - 99 (FRAUD)
    status = "fraud";
  }
  
  return {
    id: forensic.txHash,
    amount: forensic.amountUSD,
    from: forensic.fromCountry.name,
    to: forensic.toCountry.name,
    latLngFrom: [forensic.fromCountry.lat, forensic.fromCountry.lng],
    latLngTo: [forensic.toCountry.lat, forensic.toCountry.lng],
    status,
    riskScore,
    chain: chain.toUpperCase(),
    timestamp,
    fromAddress: forensic.fromAddress,
    toAddress: forensic.toAddress
  };
}

function generateInitialTxs(): Tx[] {
  const now = typeof Date !== "undefined" ? Date.now() : 1700000000000
  const initialTxs: Tx[] = []
  for (let m = 0; m <= 29; m++) {
    const numTxsInMinute = 6 + (m % 5) * 3
    const tsBase = now - m * 60000
    for (let j = 0; j < numTxsInMinute; j++) {
      const ts = tsBase - (j * 3200)
      const seed = Math.floor(ts) + j * 997
      initialTxs.push(createTxFromSeed(seed, ts))
    }
  }
  return initialTxs
}

export function useTransactions() {
  const [txs, setTxs] = useState<Tx[]>(() => generateInitialTxs())

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const seed = now + Math.floor(Math.random() * 100000)
      setTxs((prev) => [
        createTxFromSeed(seed, now),
        ...prev,
      ].slice(0, 1500))
    }, 600)

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
      const minute = Math.min(29, Math.max(0, Math.floor((now - t.timestamp) / 60000)))
      if (t.status === "safe") {
        safeBuckets[minute] = (safeBuckets[minute] || 0) + 1
      } else if (t.status === "risky") {
        riskyBuckets[minute] = (riskyBuckets[minute] || 0) + 1
      } else {
        fraudBuckets[minute] = (fraudBuckets[minute] || 0) + 1
      }
    })
    
    const data = Array.from({ length: 30 }, (_, i) => {
      const key = 29 - i
      return { 
        name: key === 0 ? "Now" : `${key}m`, 
        safe: Math.max(2, safeBuckets[key] || 0),
        risky: Math.max(1, riskyBuckets[key] || 0),
        fraud: Math.max(0, fraudBuckets[key] || 0)
      }
    })
    return data
  }, [txs])

  return { txs, leaderboard, perMinute }
}