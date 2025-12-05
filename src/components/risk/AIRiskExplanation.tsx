"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Lightbulb,
  FileText,
  Copy,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

export type RiskFactorType = "SANCTIONS" | "PEP" | "MIXER" | "SCAM" | "EXPLOIT" | "RUG_PULL" | "WASH_TRADING" | "DARKNET" | "PHISHING"

export interface RiskFactor {
  factor_type: RiskFactorType
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  evidence: {
    type: "tx_hash" | "address" | "protocol" | "pattern"
    value: string
    description: string
  }[]
}

export interface AIRiskExplanationData {
  entity_address: string
  entity_type: "wallet" | "protocol" | "nft_collection" | "marketplace"
  risk_score: number
  short_summary: string
  analyst_summary: string
  risk_factors: RiskFactor[]
  recommendations?: string[]
  generated_at: string
}

interface AIRiskExplanationProps {
  data: AIRiskExplanationData
}

const factorConfig: Record<RiskFactorType, { label: string; color: string; bgColor: string }> = {
  SANCTIONS: { label: "Sanctions", color: "text-red-400", bgColor: "bg-red-500/20" },
  PEP: { label: "PEP Exposure", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  MIXER: { label: "Mixer Usage", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  SCAM: { label: "Scam Activity", color: "text-red-400", bgColor: "bg-red-500/20" },
  EXPLOIT: { label: "Exploit", color: "text-red-400", bgColor: "bg-red-500/20" },
  RUG_PULL: { label: "Rug Pull", color: "text-red-400", bgColor: "bg-red-500/20" },
  WASH_TRADING: { label: "Wash Trading", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  DARKNET: { label: "Darknet", color: "text-red-400", bgColor: "bg-red-500/20" },
  PHISHING: { label: "Phishing", color: "text-red-400", bgColor: "bg-red-500/20" }
}

const severityConfig = {
  LOW: { color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/50" },
  MEDIUM: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/50" },
  HIGH: { color: "text-orange-400", bgColor: "bg-orange-500/20", borderColor: "border-orange-500/50" },
  CRITICAL: { color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/50" }
}

export function AIRiskExplanation({ data }: AIRiskExplanationProps) {
  const [showDetailed, setShowDetailed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `Risk Report for ${data.entity_address}\n\nSummary: ${data.short_summary}\n\nDetailed Analysis:\n${data.analyst_summary}\n\nRisk Score: ${data.risk_score}/100\n\nGenerated: ${data.generated_at}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Report copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-400"
    if (score >= 50) return "text-orange-400"
    if (score >= 25) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-yellow-400" />
            <span className="text-foreground">AI Risk Explanation</span>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 border text-xs ml-2">
              Powered by AI
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-400 hover:text-yellow-300"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Natural language risk assessment for {data.entity_type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Score Badge */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${getRiskColor(data.risk_score)}`}>
            {data.risk_score}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Risk Score</p>
            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  data.risk_score >= 75 ? "bg-red-500" :
                  data.risk_score >= 50 ? "bg-orange-500" :
                  data.risk_score >= 25 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${data.risk_score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Short Summary */}
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-300 mb-1">Summary</p>
              <p className="text-sm text-gray-200">{data.short_summary}</p>
            </div>
          </div>
        </div>

        {/* Toggle Detailed View */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full justify-between text-gray-400 hover:text-yellow-300"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Detailed Analysis
          </span>
          {showDetailed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {showDetailed && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Analyst Summary */}
            <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
              <p className="text-sm text-gray-200 whitespace-pre-line">{data.analyst_summary}</p>
            </div>

            {/* Risk Factors */}
            {data.risk_factors.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Risk Factors ({data.risk_factors.length})
                </p>
                <div className="space-y-3">
                  {data.risk_factors.map((factor, idx) => {
                    const factorStyle = factorConfig[factor.factor_type]
                    const severityStyle = severityConfig[factor.severity]
                    
                    return (
                      <div key={idx} className={`p-3 rounded-lg ${factorStyle.bgColor} border ${severityStyle.borderColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${factorStyle.bgColor} ${factorStyle.color} text-xs`}>
                            {factorStyle.label}
                          </Badge>
                          <Badge className={`${severityStyle.bgColor} ${severityStyle.color} text-xs`}>
                            {factor.severity}
                          </Badge>
                        </div>
                        {factor.evidence.length > 0 && (
                          <div className="space-y-1">
                            {factor.evidence.map((ev, evIdx) => (
                              <div key={evIdx} className="flex items-start gap-2 text-xs">
                                <span className="text-gray-500">{ev.type}:</span>
                                <code className="text-yellow-300/80 bg-black/40 px-1 rounded">
                                  {ev.value.length > 20 ? `${ev.value.slice(0, 10)}...${ev.value.slice(-6)}` : ev.value}
                                </code>
                                <span className="text-gray-400 flex-1">{ev.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-300">Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Generated At */}
        <div className="text-xs text-gray-500 text-right">
          Generated: {data.generated_at}
        </div>
      </CardContent>
    </Card>
  )
}
