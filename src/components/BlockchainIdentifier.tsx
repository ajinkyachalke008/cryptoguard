"use client"

import { useState } from "react"
import { Clipboard, ExternalLink, Check } from "lucide-react"
import { toast } from "sonner"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface BlockchainIdentifierProps {
  type: "address" | "tx"
  value: string
  label?: string
  isCopyable?: boolean
  showLink?: boolean
  chain?: "ethereum" | "bsc" | "polygon" | "arbitrum"
  className?: string
  truncate?: boolean
  variant?: "default" | "header" | "evidence"
}

const explorerUrls = {
  ethereum: "https://etherscan.io",
  bsc: "https://bscscan.com",
  polygon: "https://polygonscan.com",
  arbitrum: "https://arbiscan.io"
}

export function BlockchainIdentifier({
  type,
  value,
  label,
  isCopyable = true,
  showLink = true,
  chain = "ethereum",
  className,
  truncate = true,
  variant = "default"
}: BlockchainIdentifierProps) {
  const [copied, setCopied] = useState(false)

  const truncateMiddle = (str: string) => {
    if (!str) return ""
    if (str.length <= 12) return str
    return `${str.slice(0, 6)}…${str.slice(-4)}`
  }

  const handleCopy = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Copied to clipboard", {
        description: `Public blockchain identifier copied`,
        duration: 1500
      })
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  const getExplorerLink = () => {
    const baseUrl = explorerUrls[chain]
    const path = type === "address" ? "address" : "tx"
    return `${baseUrl}/${path}/${value}`
  }

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "inline-flex items-center gap-2 group",
          variant === "header" && "px-3 py-1.5 bg-black/40 border border-yellow-500/20 rounded-lg",
          className
        )}
      >
        {label && (
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest select-none">
            {label}:
          </span>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <code 
              className={cn(
                "font-mono cursor-help transition-colors select-all",
                variant === "header" ? "text-base text-yellow-300" : "text-sm text-gray-300 hover:text-indigo-400",
                variant === "evidence" && "text-xs italic"
              )}
            >
              {truncate ? truncateMiddle(value) : value}
            </code>
          </TooltipTrigger>
          <TooltipContent className="bg-black border border-white/10 text-white font-mono text-[10px] break-all max-w-[300px]">
            {value}
          </TooltipContent>
        </Tooltip>
  
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 group-focus-within:opacity-100">
          {isCopyable && (
            <button
              onClick={handleCopy}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCopy(e)
                }
              }}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 sm:text-gray-500 hover:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={`Copy ${type === "address" ? "wallet address" : "transaction ID"}`}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {showLink && (
            <a
              href={getExplorerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 sm:text-gray-500 hover:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
              aria-label="View on block explorer"
              title="View on Block Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
