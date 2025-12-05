"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon,
  ExternalLink,
  Clock,
  ArrowRight,
  Filter,
  CheckCheck
} from "lucide-react"

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TriggerType = "INCOMING_FROM_SANCTIONED_CLUSTER" | "OUTGOING_TO_SANCTIONED" | "RETROACTIVE_SANCTIONS_MATCH" | "NEW_LIST_MATCH"

export interface SanctionsAlert {
  alert_id: string
  wallet: string
  trigger_type: TriggerType
  sanctions_sources: string[]
  severity: AlertSeverity
  tx_hashes: string[]
  timestamp: string
  description: string
  acknowledged?: boolean
}

interface SanctionsAlertsProps {
  alerts: SanctionsAlert[]
  onAcknowledge?: (alertId: string) => void
  onViewTransaction?: (txHash: string) => void
}

const severityConfig = {
  LOW: {
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
    icon: Bell
  },
  MEDIUM: {
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    icon: AlertTriangle
  },
  HIGH: {
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
    icon: AlertTriangle
  },
  CRITICAL: {
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    icon: AlertOctagon
  }
}

const triggerLabels: Record<TriggerType, string> = {
  INCOMING_FROM_SANCTIONED_CLUSTER: "Incoming from Sanctioned Cluster",
  OUTGOING_TO_SANCTIONED: "Outgoing to Sanctioned Address",
  RETROACTIVE_SANCTIONS_MATCH: "Retroactive Sanctions Match",
  NEW_LIST_MATCH: "New Sanctions List Match"
}

export function SanctionsAlerts({ alerts, onAcknowledge, onViewTransaction }: SanctionsAlertsProps) {
  const [filter, setFilter] = useState<AlertSeverity | "ALL">("ALL")
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) return false
    if (filter === "ALL") return true
    return alert.severity === filter
  })

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length

  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span className="text-foreground">Sanctions Alerts</span>
              {unacknowledgedCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border ml-2">
                  {unacknowledgedCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time alerts for sanctions-related activity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className={`text-xs ${showAcknowledged ? 'text-yellow-300' : 'text-gray-400'}`}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
            className={filter === "ALL" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" : "border-gray-600 text-gray-400"}
          >
            All
          </Button>
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as AlertSeverity[]).map(severity => (
            <Button
              key={severity}
              variant={filter === severity ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(severity)}
              className={filter === severity 
                ? `${severityConfig[severity].bgColor} ${severityConfig[severity].borderColor} ${severityConfig[severity].textColor}`
                : "border-gray-600 text-gray-400"
              }
            >
              {severity}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No alerts to display</p>
            <p className="text-xs text-gray-500 mt-1">
              {filter !== "ALL" ? "Try changing the filter" : "All clear!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredAlerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const SeverityIcon = config.icon

              return (
                <div 
                  key={alert.alert_id}
                  className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${config.bgColor}`}>
                        <SeverityIcon className={`w-5 h-5 ${config.textColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${config.bgColor} ${config.textColor} text-xs`}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">{triggerLabels[alert.trigger_type]}</span>
                        </div>
                        <p className="text-sm text-gray-200 mb-2">{alert.description}</p>
                        <code className="text-xs text-yellow-300/80 bg-black/40 px-2 py-1 rounded">
                          {alert.wallet}
                        </code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp}
                          </span>
                          <span>Sources: {alert.sanctions_sources.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.tx_hashes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTransaction?.(alert.tx_hashes[0])}
                          className="text-gray-400 hover:text-yellow-300"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Tx
                        </Button>
                      )}
                      {!alert.acknowledged && onAcknowledge && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcknowledge(alert.alert_id)}
                          className="text-gray-400 hover:text-green-400"
                        >
                          <CheckCheck className="w-4 h-4 mr-1" />
                          Ack
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
