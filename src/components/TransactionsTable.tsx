"use client"

import { useState, useEffect } from "react"
import { Clock, Copy, Globe, ShieldCheck, Loader2, Check, ExternalLink } from "lucide-react"
import { useTransactions, Tx } from "@/hooks/useTransactions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TransactionDetailsDrawer } from "@/components/TransactionDetailsDrawer"

export default function TransactionsTable() {
  const { txs } = useTransactions()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [scanningIds, setScanningIds] = useState<Set<string>>(new Set())
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localTxs, setLocalTxs] = useState<Tx[]>([])

  // Sync local state with hook data, but preserve local updates (like scan results)
  useEffect(() => {
    setLocalTxs(prev => {
      const newTxs = txs.slice(0, 15).map(t => {
        const existing = prev.find(p => p.id === t.id)
        return existing || t
      })
      return newTxs
    })
  }, [txs])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const shortenId = (id: string) => {
    if (id.length <= 13) return id
    return `${id.slice(0, 8)}...${id.slice(-4)}`
  }

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success("Tx ID copied")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleScan = async (e: React.MouseEvent, tx: Tx) => {
    e.stopPropagation()
    if (scanningIds.has(tx.id)) return

    setScanningIds(prev => new Set(prev).add(tx.id))
    toast.info("Scanning transaction...")

    try {
      const res = await fetch("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_id: tx.id }),
      })
      
      const result = await res.json()
      
      if (res.ok) {
        setLocalTxs(prev => prev.map(t => 
          t.id === tx.id 
            ? { ...t, status: result.classification, riskScore: result.risk_score / 100 } 
            : t
        ))
        toast.success("Scan completed")
        
        if (result.classification === "fraud" || result.classification === "risky") {
          toast("High risk detected", {
            description: "View forensic route on 3D Globe",
            action: {
              label: "View Globe",
              onClick: () => handleOpenOnGlobe(null, tx)
            }
          })
        }
      } else {
        toast.error("Scan failed")
      }
    } catch (error) {
      toast.error("Scan failed")
    } finally {
      setScanningIds(prev => {
        const next = new Set(prev)
        next.delete(tx.id)
        return next
      })
    }
  }

  const handleOpenOnGlobe = (e: React.MouseEvent | null, tx: Tx) => {
    e?.stopPropagation()
    
    // Dispatch custom event for Globe integration
    const event = new CustomEvent('CRYPTOGUARD_GLOBE_FOCUS_TX', {
      detail: {
        tx_id: tx.id,
        from_country: tx.from,
        to_country: tx.to,
        from_coords: tx.latLngFrom,
        to_coords: tx.latLngTo,
        amount: tx.amount,
        classification: tx.status,
        risk_score: tx.riskScore,
      }
    })
    window.dispatchEvent(event)
    
    toast.success("Focusing Globe on route")
    
    // If we're on a mobile device or small screen, we might want to scroll to globe
    if (window.innerWidth < 1024) {
      const globeElement = document.getElementById('globe-container')
      globeElement?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleRowClick = (tx: Tx) => {
    setSelectedTx(tx)
    setDrawerOpen(true)
  }

  return (
    <div className="rounded-lg sm:rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <div className="text-yellow-400 font-semibold text-sm sm:text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Live Intelligence Feed
        </div>
        <div className="flex items-center gap-1.5 text-yellow-300 shrink-0">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <div className="text-right">
            <div className="text-[10px] sm:text-xs font-mono tracking-wider leading-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-[8px] sm:text-[10px] text-yellow-300/70 leading-tight">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <TooltipProvider>
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-yellow-500/20">
                <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Tx ID</th>
                <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Amount</th>
                <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">From</th>
                <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">To</th>
                <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Risk</th>
              </tr>
            </thead>
            <tbody>
              {localTxs.map((t) => (
                <tr 
                  key={t.id} 
                  className="border-b border-yellow-500/10 hover:bg-yellow-500/5 cursor-pointer transition-colors group"
                  onClick={() => handleRowClick(t)}
                >
                  <td className="py-3 pr-3 sm:pr-4 font-mono text-gray-300">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="hover:text-yellow-400 transition-colors">{shortenId(t.id)}</span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-yellow-500/40 text-yellow-100 font-mono text-[10px]">
                          {t.id}
                        </TooltipContent>
                      </Tooltip>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 rounded-md hover:bg-yellow-500/20 hover:text-yellow-400"
                              onClick={(e) => handleCopy(e, t.id)}
                            >
                              {copiedId === t.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Tx ID</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 rounded-md hover:bg-yellow-500/20 hover:text-yellow-400"
                              disabled={scanningIds.has(t.id)}
                              onClick={(e) => handleScan(e, t)}
                            >
                              {scanningIds.has(t.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>AI Risk Scan</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 rounded-md hover:bg-yellow-500/20 hover:text-yellow-400"
                              onClick={(e) => handleOpenOnGlobe(e, t)}
                            >
                              <Globe className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Open on Globe</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 sm:pr-4 text-foreground font-semibold whitespace-nowrap">
                    ${t.amount.toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 sm:pr-4 text-gray-400 whitespace-nowrap">{t.from}</td>
                  <td className="py-3 pr-3 sm:pr-4 text-gray-400 whitespace-nowrap">{t.to}</td>
                  <td className="py-3 pr-3 sm:pr-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        t.status === "safe"
                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          : t.status === "risky"
                          ? "text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse"
                          : "text-red-500 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_#ef444455] animate-pulse"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      <TransactionDetailsDrawer 
        tx={selectedTx}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onOpenOnGlobe={(tx) => handleOpenOnGlobe(null, tx)}
      />
    </div>
  )
}
