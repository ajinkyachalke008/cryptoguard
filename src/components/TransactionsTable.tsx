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

  const formatTime = (date?: Date | number) => {
    try {
      const d = typeof date === "number" ? new Date(date) : (date instanceof Date ? date : new Date())
      if (!d || isNaN(d.getTime())) return "12:00:00"
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      })
    } catch {
      return "12:00:00"
    }
  }

  const formatDate = (date?: Date | number) => {
    try {
      const d = typeof date === "number" ? new Date(date) : (date instanceof Date ? date : new Date())
      if (!d || isNaN(d.getTime())) return "Aug 21, 2026"
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return "Aug 21, 2026"
    }
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
    <div className="rounded-xl border border-yellow-500/40 bg-black/70 p-3 sm:p-4 backdrop-blur-md shadow-[0_0_30px_#ffd70033]">
      <div className="flex items-center justify-between mb-3 gap-2 pb-2.5 border-b border-yellow-500/25">
        <div className="text-yellow-400 font-black text-base sm:text-lg flex items-center gap-2 drop-shadow-[0_0_10px_#ffd70044]">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          Live Intelligence Feed
        </div>
        <div className="flex items-center gap-2 text-yellow-300 px-3 py-1 rounded-lg bg-black/80 border border-yellow-500/30 shrink-0 shadow-[0_0_12px_rgba(255,215,0,0.15)]">
          <Clock className="w-3.5 h-3.5 text-yellow-400" />
          <div className="text-right">
            <div className="text-xs sm:text-sm font-black font-mono text-yellow-300 tracking-wider leading-tight drop-shadow-[0_0_8px_#ffd70066]">
              {formatTime(currentTime)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-yellow-400/80 font-bold leading-tight">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <TooltipProvider>
          <table className="w-full text-xs table-fixed">
            <thead>
              <tr className="text-left text-gray-300 border-b border-yellow-500/30">
                <th className="py-2 px-1.5 sm:px-2 font-black text-yellow-300 w-[17%] sm:w-[15%]">Time</th>
                <th className="py-2 px-1.5 sm:px-2 font-black text-white w-[22%] sm:w-[20%]">Tx ID</th>
                <th className="py-2 px-1.5 sm:px-2 font-black text-yellow-400 w-[18%] sm:w-[16%]">Amount</th>
                <th className="py-2 px-1.5 sm:px-2 font-bold text-gray-300 w-[17%] sm:w-[17%]">From</th>
                <th className="py-2 px-1.5 sm:px-2 font-black text-yellow-300 w-[17%] sm:w-[17%]">To</th>
                <th className="py-2 px-1.5 sm:px-2 font-black text-white w-[9%] sm:w-[15%] text-right sm:text-left">Risk</th>
              </tr>
            </thead>
            <tbody>
              {localTxs.map((t, idx) => (
                <tr 
                  key={t.id} 
                  className="border-b border-yellow-500/10 hover:bg-yellow-500/10 cursor-pointer transition-colors group"
                  onClick={() => handleRowClick(t)}
                >
                  {/* Bold Timestamp */}
                  <td className="py-2.5 px-1.5 sm:px-2 font-mono font-black text-yellow-300 text-[11px] sm:text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/30 whitespace-nowrap">
                      {formatTime(new Date(t.timestamp || Date.now() - idx * 2500))}
                    </span>
                  </td>

                  {/* Tx ID with Copy / Scan / Globe */}
                  <td className="py-2.5 px-1.5 sm:px-2 font-mono font-bold text-gray-200">
                    <div className="flex items-center gap-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="hover:text-yellow-300 transition-colors truncate block max-w-[70px] sm:max-w-[90px]">
                            {shortenId(t.id)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-yellow-500/40 text-yellow-100 font-mono text-[10px]">
                          {t.id}
                        </TooltipContent>
                      </Tooltip>
                      
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 p-0 rounded hover:bg-yellow-500/20 hover:text-yellow-400"
                              onClick={(e) => handleCopy(e, t.id)}
                            >
                              {copiedId === t.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Tx ID</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 p-0 rounded hover:bg-yellow-500/20 hover:text-yellow-400"
                              disabled={scanningIds.has(t.id)}
                              onClick={(e) => handleScan(e, t)}
                            >
                              {scanningIds.has(t.id) ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-2.5 h-2.5" />
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
                              className="h-5 w-5 p-0 rounded hover:bg-yellow-500/20 hover:text-yellow-400"
                              onClick={(e) => handleOpenOnGlobe(e, t)}
                            >
                              <Globe className="w-2.5 h-2.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Open on Globe</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-yellow-300 font-black font-mono text-[11px] sm:text-xs truncate drop-shadow-[0_0_6px_#ffd70033]">
                    ${t.amount.toLocaleString()}
                  </td>

                  {/* From Country */}
                  <td className="py-2.5 px-1.5 sm:px-2 font-bold text-gray-200">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block max-w-[65px] sm:max-w-[90px] text-[11px] sm:text-xs">
                          {t.from}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border border-yellow-500/30 text-yellow-200 text-xs">
                        Origin: {t.from}
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* To Country */}
                  <td className="py-2.5 px-1.5 sm:px-2 font-black text-yellow-300">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block max-w-[65px] sm:max-w-[90px] text-[11px] sm:text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 text-yellow-300">
                          {t.to}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border border-yellow-500/30 text-yellow-200 text-xs">
                        Destination: {t.to}
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* Risk Status */}
                  <td className="py-2.5 px-1.5 sm:px-2 text-right sm:text-left">
                    <span
                      className={`inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider border ${
                        t.status === "safe"
                          ? "text-emerald-300 border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_8px_#10b98133]"
                          : t.status === "risky"
                          ? "text-amber-300 border-amber-500/50 bg-amber-500/20 animate-pulse shadow-[0_0_8px_#f59e0b33]"
                          : "text-red-300 border-red-500/60 bg-red-500/25 shadow-[0_0_12px_#ef444466] animate-pulse"
                      }`}
                    >
                      <span className="hidden sm:inline">{t.status}</span>
                      <span className="sm:hidden">{t.status === "safe" ? "✓" : t.status === "risky" ? "!" : "✕"}</span>
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
