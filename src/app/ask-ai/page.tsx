"use client"

import { useState, useRef, useEffect } from "react"
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
  type?: "text" | "wallet_summary" | "transaction_list" | "risk_alert"
  metadata?: {
    wallet?: string
    risk_score?: number
    transactions?: { hash: string; amount: number; status: string }[]
  }
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

// Enhanced mock AI response generator
function generateMockResponse(question: string): Promise<ChatMessage> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuestion = question.toLowerCase()
      let content = ""
      let type: "text" | "risk_alert" = "text"

      if (lowerQuestion.includes("wallet") && (lowerQuestion.includes("risk") || lowerQuestion.includes("analyze") || lowerQuestion.includes("0x"))) {
        type = "risk_alert"
        content = `🔍 **Wallet Risk Analysis**

Based on my analysis, here are the key risk factors I typically evaluate:

**1. Transaction History**
- Volume and frequency of transactions
- Interaction with known malicious addresses
- Unusual patterns (rapid transfers, round amounts)

**2. Counterparty Risk**
- Connections to mixers (Tornado Cash, etc.)
- Interactions with sanctioned addresses
- Links to known scam wallets

**3. DeFi Exposure**
- Interaction with unaudited protocols
- Exposure to exploited contracts
- Rug pull token holdings

**4. Compliance Flags**
- OFAC/SDN list matches
- PEP connections
- High-risk jurisdiction exposure

Would you like me to analyze a specific wallet address?`
      } else if (lowerQuestion.includes("rug pull")) {
        content = `🚨 **Rug Pull Detection Guide**

A rug pull occurs when developers abandon a project and run away with investor funds. Here's how to identify potential rug pulls:

**🔴 Red Flags:**
1. **Liquidity Not Locked** - Check if LP tokens are locked
2. **Anonymous Team** - No verifiable team members
3. **No Audit** - Missing security audits from reputable firms
4. **Concentrated Ownership** - Few wallets hold majority of supply
5. **Unlimited Mint Functions** - Contract allows infinite token creation
6. **High Sell Fees** - Unusual tax on selling

**✅ Safety Checks:**
- Verify liquidity lock on platforms like Unicrypt
- Check holder distribution on Etherscan
- Review smart contract for dangerous functions
- Research team backgrounds
- Look for community engagement

Our Protocol Risk Scanner automatically detects these patterns. Would you like to analyze a specific token?`
      } else if (lowerQuestion.includes("wash trading")) {
        content = `📊 **Wash Trading Detection**

Wash trading involves the same entity trading with themselves to artificially inflate volume. Here's how we detect it:

**Detection Methods:**

1. **Circular Trading Patterns**
   - A→B→C→A loops
   - Rapid back-and-forth transfers

2. **Volume Analysis**
   - Few wallets dominating volume
   - Unrealistic volume/holder ratios

3. **Timing Patterns**
   - Trades at regular intervals
   - Immediate buy-sell sequences

4. **Price Manipulation**
   - Self-trades at inflated prices
   - Artificial floor price maintenance

**Our NFT Risk Scanner detects:**
- 72%+ wash trading ratios in some collections
- Circular trade patterns
- Bot activity signatures

Would you like me to check a specific NFT collection?`
      } else if (lowerQuestion.includes("sanction") || lowerQuestion.includes("ofac")) {
        content = `⚖️ **Sanctions Screening Explained**

Sanctions screening is crucial for crypto compliance. Here's what we check:

**Lists We Monitor:**
- 🇺🇸 OFAC SDN (US Treasury)
- 🇪🇺 EU Sanctions List  
- 🇬🇧 UK HMT Sanctions
- 🇺🇳 UN Consolidated List

**Screening Types:**

1. **Direct Match**
   - Wallet directly on sanctions list
   - Immediate high-risk flag

2. **Cluster Exposure**
   - Wallet received funds from sanctioned addresses
   - Calculated exposure percentage

3. **Indirect Links**
   - 2nd or 3rd degree connections
   - Requires investigation

**Compliance Actions:**
- Block transactions
- File SARs (Suspicious Activity Reports)
- Enhanced due diligence

Our Wallet Scanner automatically checks all major sanctions lists. Want to screen a wallet?`
      } else if (lowerQuestion.includes("defi") || lowerQuestion.includes("protocol") || lowerQuestion.includes("safe")) {
        content = `🛡️ **DeFi Protocol Safety Checklist**

Evaluating DeFi protocol security:

**Audit Status (Critical)**
- ✅ Multiple audits from top firms (Trail of Bits, OpenZeppelin)
- ✅ All critical issues resolved
- ✅ Recent audit (within 6 months)

**Smart Contract Analysis**
- Admin key management (multisig preferred)
- Timelock on upgrades
- No dangerous functions (unlimited mint, etc.)

**Team & Governance**
- Verified team identities
- Decentralized governance
- Active development

**Historical Performance**
- No previous exploits
- Track record of security patches
- Bug bounty program

**Our Audit Scores:**
- 90-100: Well Audited ✅
- 70-89: Audited
- 40-69: Caution ⚠️
- 0-39: Unsafe ❌

Try our Protocol Risk Scanner for detailed analysis!`
      } else if (lowerQuestion.includes("cross-chain") || lowerQuestion.includes("bridge") || lowerQuestion.includes("tracking")) {
        content = `🔗 **Cross-Chain Transaction Tracking**

Following funds across blockchains:

**How It Works:**

1. **Bridge Detection**
   - Monitor known bridge contracts
   - Track wrapped asset creation
   - Match source/destination transactions

2. **Flow Visualization**
   Origin → Bridge → Destination → DEX → Final

3. **Risk Tagging**
   Each hop is tagged with risk indicators:
   - 🟢 Clean transfer
   - 🟡 Risky (mixer, unknown protocol)
   - 🔴 High risk (sanctioned, scam)

**Chains We Support:**
- Ethereum, Bitcoin, BSC
- Polygon, Arbitrum, Solana
- Avalanche, Base, and more

**Use Cases:**
- Trace stolen funds
- Investigate money laundering
- Compliance reporting

Our Multi-Chain Timeline visualizes complex flows. Try a cross-chain investigation!`
      } else if (lowerQuestion.includes("phishing") || lowerQuestion.includes("scam")) {
        content = `🎣 **Phishing & Scam Detection**

Common crypto scams and how to identify them:

**Phishing Attacks:**
- Fake wallet connection popups
- Cloned DEX/NFT sites
- Malicious approval requests

**Warning Signs:**
1. Unsolicited DMs about investments
2. "Too good to be true" returns
3. Pressure to act quickly
4. Requests for seed phrases
5. Suspicious smart contract approvals

**Our Detection:**
- Known phishing address database
- Malicious contract pattern detection
- Fake collection identification
- Suspicious approval monitoring

**Protection Tips:**
- Verify URLs carefully
- Use hardware wallets
- Revoke unused approvals
- Never share seed phrases

Our scanners flag wallets with phishing connections!`
      } else if (lowerQuestion.includes("nft") || lowerQuestion.includes("collection")) {
        content = `🖼️ **NFT Collection Legitimacy Analysis**

Evaluating NFT collections:

**Authenticity Checks:**
- Official social media verification
- Contract deployment history
- Creator wallet analysis

**Market Health:**
- Organic trading volume
- Holder distribution
- Floor price stability

**Red Flags We Detect:**
- 🚩 High wash trading ratio
- 🚩 Fake volume inflation
- 🚩 Copycat collections
- 🚩 Concentrated ownership
- 🚩 Artificial price pumping

**Volume Analysis:**
- Reported vs Real Volume
- Bot activity detection
- Circular trade patterns

Our NFT Risk Scanner provides:
- Wash trading percentage
- Estimated real volume
- Suspicious wallet identification

Want to analyze a specific collection?`
      } else {
        content = `I understand you're asking about "${question}".

Let me help you with that. Here's what I can assist with:

**🔍 Risk Analysis**
- Wallet risk scoring
- Protocol security assessment
- NFT collection analysis
- Marketplace evaluation

**📋 Compliance**
- Sanctions screening (OFAC, EU, UK)
- PEP identification
- Transaction monitoring

**🔗 Investigation**
- Cross-chain fund tracking
- Transaction flow visualization
- Entity clustering

**📊 Detection**
- Wash trading identification
- Fake volume analysis
- Rug pull indicators

What specific topic would you like to explore? You can also try:
- "Analyze wallet 0x..."
- "Check protocol Uniswap"
- "Investigate NFT collection Bored Apes"`
      }

      resolve({
        id: Date.now().toString(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        type
      })
    }, 1500)
  })
}

export default function AskAIPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
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
      timestamp: new Date().toISOString(),
      type: "text"
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateMockResponse(messageText)
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

  const handleClearChat = () => {
    setMessages([])
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
                        {message.type === "risk_alert" ? (
                          <div className="flex gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="whitespace-pre-wrap text-sm prose prose-invert prose-sm max-w-none">{message.content}</div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm prose prose-invert prose-sm max-w-none">{message.content}</div>
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
