"use client"

import { Clock, Activity, Flag, Zap } from "lucide-react"

interface TimelineEvent {
  timestamp: string
  event: string
  details: string
  type: "transaction" | "interaction" | "flag"
}

interface TransactionTimelineProps {
  events: TimelineEvent[]
}

export function TransactionTimeline({ events }: TransactionTimelineProps) {
  const getIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "transaction":
        return <Activity className="w-4 h-4" />
      case "interaction":
        return <Zap className="w-4 h-4" />
      case "flag":
        return <Flag className="w-4 h-4" />
    }
  }

  const getColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "transaction":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "interaction":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "flag":
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-yellow-500/20" />
      
      <div className="space-y-6">
        {sortedEvents.map((event, i) => (
          <div key={i} className="relative pl-16">
            <div
              className={`absolute left-5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getColor(
                event.type
              )}`}
            >
              {getIcon(event.type)}
            </div>
            
            <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 hover:bg-yellow-500/5 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{event.event}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <p className="text-xs text-gray-400">{event.details}</p>
              
              <div className="mt-2 text-xs text-gray-500">
                {new Date(event.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
