"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
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
  AlertTriangle,
  Trash2,
  History
} from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const suggestedQuestions = [
  "What are the main risk factors for wallet 0x742d35Cc6634C0532925a3b844Bc454e4438f44E?",
  "How do I identify a rug pull?",
  "What is wash trading and how to detect it?",
  "Explain sanctions screening for crypto",
  "What makes a DeFi protocol safe?",
  "How does cross-chain fund tracking work?",
  "What are the signs of a phishing scam?",
  "How to analyze NFT collection legitimacy?"
]

const exampleTopics = [
  { icon: Wallet, label: "Wallet Analysis", query: "Analyze wallet risk factors" },
  { icon: AlertTriangle, label: "Risk Detection", query: "How to detect fraud in crypto?" },
  { icon: Network, label: "Transaction Flows", query: "Explain cross-chain transaction tracking" },
  { icon: FileText, label: "Compliance", query: "What is OFAC sanctions screening?" }
]

function AskAIContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-submit initial query if present
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery)
    }
  }, [])

  const handleSend = async (query?: string) => {
    const messageText = query || input
    if (!messageText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // If no conversation exists, create one
      if (!conversationId) {
        const newConvRes = await fetch("/api/ai-chat/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initial_question: messageText })
        })

        if (!newConvRes.ok) {
          throw new Error("Failed to create conversation")
        }

        const newConvData = await newConvRes.json()
        setConversationId(newConvData.conversation_id)

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: newConvData.response,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Continue existing conversation
        const continueRes = await fetch(`/api/ai-chat/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: messageText })
        })

        if (!continueRes.ok) {
          throw new Error("Failed to send message")
        }

        const continueData = await continueRes.json()

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: continueData.response,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch {
      toast.error("Failed to get response from AI")
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

  const handleClearChat = () => {
    setMessages([])
    setConversationId(null)
    toast.success("Chat cleared")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
              <Bot className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Ask CryptoGuard
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered crypto risk analysis and investigation assistant
          </p>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] flex flex-col min-h-[500px]">
          <CardHeader className="pb-2 flex-shrink-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                <span className="text-foreground">Chat</span>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 border text-xs ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bot className="w-16 h-16 text-yellow-500/30 mb-6" />
                  <p className="text-gray-300 text-lg mb-2">How can I help you today?</p>
                  <p className="text-gray-500 text-sm mb-6 max-w-md">
                    Ask me anything about crypto risk analysis, fraud detection, compliance, or investigation techniques.
                  </p>
                  
                  {/* Topic Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6 max-w-md w-full">
                    {exampleTopics.map((topic, idx) => {
                      const Icon = topic.icon
                      return (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => setInput(topic.query)}
                          className="h-auto py-3 flex flex-col items-center gap-2 border-yellow-500/30 text-yellow-300/70 hover:bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/50"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{topic.label}</span>
                        </Button>
                      )
                    })}
                  </div>

                  {/* Suggested Questions */}
                  <div className="w-full max-w-2xl">
                    <p className="text-xs text-gray-500 mb-3">Suggested questions:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedQuestions.slice(0, 4).map((question, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInput(question)
                          }}
                          className="text-xs border-gray-700 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500/50"
                        >
                          {question.length > 40 ? question.slice(0, 40) + "..." : question}
                        </Button>
                      ))}
                    </div>
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
                    <div className={`max-w-[85%] ${message.role === "user" ? "order-1" : ""}`}>
                      <div
                        className={`p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-yellow-500/20 border border-yellow-500/30 text-gray-200"
                            : "bg-black/40 border border-gray-700 text-gray-200"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm prose prose-invert prose-sm max-w-none">{message.content}</div>
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
                  <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing your question...</span>
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
                placeholder="Ask about wallets, protocols, NFTs, compliance..."
                className="flex-1 h-12 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-12 px-6 bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_#ffd70044] font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <p className="text-xs text-gray-500 w-full text-center mb-2">Quick actions:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Analyze wallet 0x742d35Cc6634C0532925a3b844Bc454e4438f44E")}
            className="text-xs border-gray-700 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300"
          >
            <Wallet className="w-3 h-3 mr-1" /> Sample Wallet Analysis
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("How to detect rug pulls?")}
            className="text-xs border-gray-700 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300"
          >
            <AlertTriangle className="w-3 h-3 mr-1" /> Rug Pull Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Explain OFAC sanctions screening")}
            className="text-xs border-gray-700 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300"
          >
            <FileText className="w-3 h-3 mr-1" /> Compliance Info
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function AskAIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
        <Footer />
      </div>
    }>
      <AskAIContent />
    </Suspense>
  )
}