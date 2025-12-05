"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send,
  Loader2,
  User,
  Bot,
  Sparkles,
  Copy,
  CheckCircle2,
  Wallet,
  FileText,
  Network,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  type?: "text" | "wallet_summary" | "transaction_list" | "risk_alert"
  metadata?: {
    wallet?: string
    risk_score?: number
    transactions?: { hash: string; amount: number; status: string }[]
  }
}

interface AskCryptoGuardChatProps {
  initialContext?: {
    wallet?: string
    protocol?: string
    collection?: string
  }
  onWalletClick?: (address: string) => void
}

const suggestedQuestions = [
  "What are the main risk factors for this wallet?",
  "Show me the transaction history summary",
  "Are there any connections to known mixers?",
  "What protocols has this wallet interacted with?",
  "Is this wallet associated with any sanctions lists?",
  "Analyze the cross-chain activity"
]

// Mock AI response generator
function generateMockResponse(question: string, context?: { wallet?: string }): Promise<ChatMessage> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses: Record<string, () => ChatMessage> = {
        risk: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `Based on my analysis of ${context?.wallet || "this wallet"}, I've identified several risk factors:\n\n1. **Mixer Interactions**: The wallet has made 3 transactions to known mixing services in the past 30 days.\n\n2. **High-Risk Connections**: 12% of incoming funds originate from addresses flagged for suspicious activity.\n\n3. **Unusual Patterns**: There's a pattern of rapid transfers followed by consolidation, which is often associated with layering.\n\nOverall risk assessment: **Medium-High (65/100)**`,
          timestamp: new Date().toISOString(),
          type: "text"
        }),
        transaction: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: "Here's a summary of recent transaction activity:",
          timestamp: new Date().toISOString(),
          type: "transaction_list",
          metadata: {
            transactions: [
              { hash: "0xabc...123", amount: 5000, status: "safe" },
              { hash: "0xdef...456", amount: 12000, status: "risky" },
              { hash: "0xghi...789", amount: 3500, status: "safe" },
              { hash: "0xjkl...012", amount: 45000, status: "fraud" }
            ]
          }
        }),
        mixer: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `Yes, I've detected mixer-related activity:\n\n⚠️ **Tornado Cash**: 2 deposits totaling 15 ETH\n⚠️ **Unknown Mixer**: 1 interaction flagged by heuristics\n\nThis significantly increases the risk profile. Mixer usage is often associated with money laundering attempts.`,
          timestamp: new Date().toISOString(),
          type: "risk_alert"
        }),
        protocol: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `This wallet has interacted with the following DeFi protocols:\n\n✅ **Uniswap V3** - 45 swaps (Low Risk)\n✅ **Aave V3** - 12 deposits/withdrawals (Low Risk)\n⚠️ **Unknown DEX** - 3 swaps (Medium Risk - Unaudited)\n❌ **Suspicious Pool** - 1 interaction (High Risk - Potential Scam)\n\nI recommend reviewing the interaction with the suspicious pool.`,
          timestamp: new Date().toISOString(),
          type: "text"
        }),
        sanctions: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `🔍 **Sanctions Check Results**:\n\n✅ **OFAC SDN List**: No direct match\n✅ **EU Sanctions**: No direct match\n✅ **UN Sanctions**: No direct match\n\n⚠️ **Indirect Exposure**: This wallet has received funds from a cluster that includes addresses with 5% exposure to OFAC-sanctioned entities.\n\nRecommendation: Monitor for further exposure and document for compliance.`,
          timestamp: new Date().toISOString(),
          type: "text"
        }),
        crosschain: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `📊 **Cross-Chain Activity Analysis**:\n\n**Ethereum**: 156 transactions, $2.3M volume\n**BSC**: 23 transactions, $450K volume\n**Polygon**: 89 transactions, $120K volume\n**Arbitrum**: 12 transactions, $85K volume\n\n🔗 **Bridge Activity**:\n- Used Multichain bridge 5 times\n- Used Synapse bridge 2 times\n- Used official bridges 8 times\n\n⚠️ Note: Rapid bridging between chains detected, which can indicate obfuscation attempts.`,
          timestamp: new Date().toISOString(),
          type: "text"
        }),
        default: () => ({
          id: Date.now().toString(),
          role: "assistant",
          content: `I understand you're asking about "${question}". Let me analyze the available data...\n\nBased on my analysis, here's what I found:\n\n1. The query relates to risk assessment patterns\n2. I've cross-referenced with our threat intelligence database\n3. No immediate critical alerts, but continued monitoring is recommended\n\nWould you like me to provide more specific details about any particular aspect?`,
          timestamp: new Date().toISOString(),
          type: "text"
        })
      }

      const lowerQuestion = question.toLowerCase()
      let responseKey = "default"
      
      if (lowerQuestion.includes("risk") || lowerQuestion.includes("factor")) responseKey = "risk"
      else if (lowerQuestion.includes("transaction") || lowerQuestion.includes("history")) responseKey = "transaction"
      else if (lowerQuestion.includes("mixer")) responseKey = "mixer"
      else if (lowerQuestion.includes("protocol") || lowerQuestion.includes("defi")) responseKey = "protocol"
      else if (lowerQuestion.includes("sanction")) responseKey = "sanctions"
      else if (lowerQuestion.includes("cross") || lowerQuestion.includes("chain") || lowerQuestion.includes("bridge")) responseKey = "crosschain"

      resolve(responses[responseKey]())
    }, 1500)
  })
}

export function AskCryptoGuardChat({ initialContext, onWalletClick }: AskCryptoGuardChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      type: "text"
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateMockResponse(input, initialContext)
      setMessages(prev => [...prev, response])
    } catch {
      toast.error("Failed to get response")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSuggestion = (question: string) => {
    setInput(question)
  }

  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022] flex flex-col h-[600px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-400" />
            <span className="text-foreground">Ask CryptoGuard</span>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 border text-xs ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Assistant
            </Badge>
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Ask questions about wallets, transactions, protocols, and risk factors
        </CardDescription>
        {initialContext?.wallet && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
              <Wallet className="w-3 h-3 mr-1" />
              Context: {initialContext.wallet.slice(0, 10)}...{initialContext.wallet.slice(-6)}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Bot className="w-12 h-12 text-yellow-500/50 mb-4" />
              <p className="text-gray-400 mb-4">Ask me anything about crypto risk analysis</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestedQuestions.slice(0, 4).map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestion(question)}
                    className="text-xs border-yellow-500/30 text-yellow-300/70 hover:bg-yellow-500/10 hover:text-yellow-300"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-yellow-400" />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-yellow-500/20 border border-yellow-500/30 text-gray-200"
                        : "bg-black/40 border border-gray-700 text-gray-200"
                    }`}
                  >
                    {message.type === "transaction_list" && message.metadata?.transactions ? (
                      <div>
                        <p className="mb-3">{message.content}</p>
                        <div className="space-y-2">
                          {message.metadata.transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/30">
                              <code className="text-xs text-yellow-300">{tx.hash}</code>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">${tx.amount.toLocaleString()}</span>
                                <Badge className={`text-xs ${
                                  tx.status === "safe" ? "bg-green-500/20 text-green-400" :
                                  tx.status === "risky" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-red-500/20 text-red-400"
                                }`}>
                                  {tx.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : message.type === "risk_alert" ? (
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content, message.id)}
                        className="h-5 px-1 text-gray-500 hover:text-yellow-300"
                      >
                        {copied === message.id ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about risk factors, transactions, protocols..."
            className="flex-1 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_#ffd70044]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
