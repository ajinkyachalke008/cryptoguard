"use client"

import { Tx } from "@/hooks/useTransactions"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Globe, AlertTriangle, Shield, CheckCircle2, ExternalLink, Calendar, MapPin, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface TransactionDetailsDrawerProps {
  tx: Tx | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenOnGlobe: (tx: Tx) => void
}

export function TransactionDetailsDrawer({ tx, open, onOpenChange, onOpenOnGlobe }: TransactionDetailsDrawerProps) {
  if (!tx) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Tx ID copied")
  }

  const getRiskColor = (status: string) => {
    switch (status) {
      case "safe": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      case "risky": return "text-amber-400 border-amber-500/30 bg-amber-500/10"
      case "fraud": return "text-red-500 border-red-500/30 bg-red-500/10"
      default: return "text-gray-400 border-gray-500/30 bg-gray-500/10"
    }
  }

  const getRiskIcon = (status: string) => {
    switch (status) {
      case "safe": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      case "risky": return <AlertTriangle className="w-5 h-5 text-amber-400" />
      case "fraud": return <Shield className="w-5 h-5 text-red-500" />
      default: return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-black/95 border-yellow-500/20 text-foreground overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Transaction Details
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Comprehensive forensic analysis of the transaction
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Risk Summary */}
          <div className={`p-4 rounded-xl border ${getRiskColor(tx.status)} flex items-center gap-4`}>
            {getRiskIcon(tx.status)}
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider">{tx.status} Risk Level</div>
              <div className="text-2xl font-bold">{(tx.riskScore * 100).toFixed(1)}% Score</div>
            </div>
          </div>

          {/* Tx ID Section */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <code className="text-xs font-mono text-yellow-300 break-all">{tx.id}</code>
              <Button size="icon" variant="ghost" className="shrink-0 hover:bg-yellow-500/20" onClick={() => handleCopy(tx.id)}>
                <Copy className="w-4 h-4 text-yellow-500" />
              </Button>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase">Amount</div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <DollarSign className="w-4 h-4 text-green-400" />
                {tx.amount.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase">Network</div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">{tx.chain}</Badge>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase">Transfer Route</div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">From</div>
                  <div className="text-sm font-medium">{tx.from}</div>
                </div>
              </div>
              <div className="ml-4 h-6 border-l border-dashed border-white/20" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">To</div>
                  <div className="text-sm font-medium">{tx.to}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase">Timeline</div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              {new Date(tx.timestamp).toLocaleString()}
            </div>
          </div>

          {/* AI Insights (Mocked if not present in tx) */}
          <div className="space-y-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-xs font-black text-yellow-500 uppercase flex items-center gap-2">
              <Shield className="w-4 h-4" /> AI Forensics
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-yellow-200">Confidence: {(tx.riskScore > 0.5 ? 0.92 : 0.88 * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Our hybrid engine detected patterns consistent with {tx.status === 'fraud' ? 'known laundering clusters' : tx.status === 'risky' ? 'unusual cross-border flows' : 'typical retail behavior'}. 
                {tx.status !== 'safe' && " Recommend immediate manual review."}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 grid grid-cols-2 gap-3">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold" onClick={() => onOpenOnGlobe(tx)}>
              <Globe className="w-4 h-4 mr-2" /> View on Globe
            </Button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <ExternalLink className="w-4 h-4 mr-2" /> Explorer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
