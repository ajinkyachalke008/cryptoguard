"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Building2,
  Shield,
  Star
} from "lucide-react"

export type AuditLabel = "UNSAFE" | "CAUTION" | "AUDITED" | "WELL_AUDITED"

export interface AuditFirm {
  name: string
  tier: "TOP_TIER" | "MID_TIER" | "UNKNOWN"
  date: string
  report_url?: string
  findings?: {
    critical: number
    high: number
    medium: number
    low: number
    resolved: number
  }
}

export interface AuditRatingData {
  protocol_name: string
  chain: string
  contracts: string[]
  audit_score: number
  audit_label: AuditLabel
  audit_reason: string
  audits: AuditFirm[]
  last_audit_date?: string
  unaddressed_critical_issues: number
  team_verified: boolean
}

interface AuditRatingPanelProps {
  data: AuditRatingData
}

const labelConfig = {
  UNSAFE: {
    label: "UNSAFE",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  },
  CAUTION: {
    label: "CAUTION",
    icon: AlertTriangle,
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
    glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.3)]"
  },
  AUDITED: {
    label: "AUDITED",
    icon: CheckCircle2,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  WELL_AUDITED: {
    label: "WELL AUDITED",
    icon: Shield,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  }
}

const tierColors = {
  TOP_TIER: "text-green-400 bg-green-500/20 border-green-500/50",
  MID_TIER: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
  UNKNOWN: "text-gray-400 bg-gray-500/20 border-gray-500/50"
}

export function AuditRatingPanel({ data }: AuditRatingPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = labelConfig[data.audit_label]
  const LabelIcon = config.icon

  const scoreColor = data.audit_score >= 75 ? "text-green-400" : 
                     data.audit_score >= 50 ? "text-yellow-400" : 
                     data.audit_score >= 25 ? "text-orange-400" : "text-red-400"

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Audit Rating</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <LabelIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          {data.protocol_name} on {data.chain}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${data.audit_score * 2.51} 251`}
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{data.audit_score}</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className={`${config.textColor} font-medium mb-2`}>{data.audit_reason}</p>
            <div className="flex flex-wrap gap-2">
              {data.team_verified && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Team Verified
                </Badge>
              )}
              {data.unaddressed_critical_issues > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {data.unaddressed_critical_issues} Critical Issues
                </Badge>
              )}
              {data.last_audit_date && (
                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Last Audit: {data.last_audit_date}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Audit History */}
        {data.audits.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span>Audit History ({data.audits.length} audits)</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {data.audits.map((audit, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-black/40 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-200">{audit.name}</span>
                        <Badge className={`text-xs border ${tierColors[audit.tier]}`}>
                          {audit.tier === "TOP_TIER" && <Star className="w-3 h-3 mr-1" />}
                          {audit.tier.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{audit.date}</span>
                        {audit.report_url && (
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300 h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {audit.findings && (
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                          <p className="text-lg font-bold text-red-400">{audit.findings.critical}</p>
                          <p className="text-[10px] text-gray-500">Critical</p>
                        </div>
                        <div className="p-2 rounded bg-orange-500/10 border border-orange-500/30">
                          <p className="text-lg font-bold text-orange-400">{audit.findings.high}</p>
                          <p className="text-[10px] text-gray-500">High</p>
                        </div>
                        <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                          <p className="text-lg font-bold text-yellow-400">{audit.findings.medium}</p>
                          <p className="text-[10px] text-gray-500">Medium</p>
                        </div>
                        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                          <p className="text-lg font-bold text-blue-400">{audit.findings.low}</p>
                          <p className="text-[10px] text-gray-500">Low</p>
                        </div>
                        <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                          <p className="text-lg font-bold text-green-400">{audit.findings.resolved}</p>
                          <p className="text-[10px] text-gray-500">Resolved</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts */}
        {data.contracts.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Audited Contracts:</p>
            <div className="flex flex-wrap gap-2">
              {data.contracts.map((contract, idx) => (
                <code key={idx} className="text-xs text-yellow-300/80 bg-black/40 px-2 py-1 rounded border border-yellow-500/20">
                  {contract.slice(0, 10)}...{contract.slice(-6)}
                </code>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
