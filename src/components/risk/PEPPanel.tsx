"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Globe,
  Shield
} from "lucide-react"

export type PEPRiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH"
export type PEPType = "Domestic" | "Foreign" | "International Organization" | "Close Associate" | "Family Member"

export interface PEPData {
  pep_risk_level: PEPRiskLevel
  pep_type?: PEPType
  pep_explanation: string
  data_source?: string
  linked_entities?: {
    name: string
    role: string
    relationship: string
    country?: string
  }[]
  last_updated?: string
}

interface PEPPanelProps {
  data: PEPData
}

const riskConfig = {
  NONE: {
    label: "No PEP connection detected",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  LOW: {
    label: "PEP-LINKED (Low)",
    icon: Shield,
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
    glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.3)]"
  },
  MEDIUM: {
    label: "PEP-LINKED (Medium)",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  HIGH: {
    label: "PEP-LINKED (High)",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

const pepTypeIcons = {
  "Domestic": Building2,
  "Foreign": Globe,
  "International Organization": Globe,
  "Close Associate": User,
  "Family Member": User
}

export function PEPPanel({ data }: PEPPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = riskConfig[data.pep_risk_level]
  const StatusIcon = config.icon
  const TypeIcon = data.pep_type ? pepTypeIcons[data.pep_type] || User : User

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">PEP Risk Assessment</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          Politically Exposed Persons database check
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Status */}
        <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <p className={`${config.textColor} font-medium`}>{data.pep_explanation}</p>
        </div>

        {/* PEP Type & Source */}
        <div className="flex flex-wrap gap-4">
          {data.pep_type && (
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Type: {data.pep_type}</span>
            </div>
          )}
          {data.data_source && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Source: {data.data_source}</span>
            </div>
          )}
          {data.last_updated && (
            <div className="text-xs text-gray-500">
              Last updated: {data.last_updated}
            </div>
          )}
        </div>

        {/* Expandable Linked Entities */}
        {data.linked_entities && data.linked_entities.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span>Linked Entities ({data.linked_entities.length})</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {data.linked_entities.map((entity, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-black/40 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-200">{entity.name}</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {entity.relationship}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{entity.role}</span>
                      {entity.country && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {entity.country}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
