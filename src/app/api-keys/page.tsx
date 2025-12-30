"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Key, 
  Copy, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2,
  Webhook,
  Settings,
  Activity,
  Globe,
  Lock,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string | null
  status: "active" | "revoked"
}

interface WebhookItem {
  id: number
  name: string
  url: string
  events: string[]
  secret: string
  status: string
  createdAt: string
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("keys")
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "" })
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true)
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false)

  useEffect(() => {
    fetchApiKeys()
    fetchWebhooks()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys/list")
      if (!response.ok) throw new Error("Failed to fetch API keys")
      const data = await response.json()
      setApiKeys(data.apiKeys || [])
    } catch (error) {
      toast.error("Failed to load API keys")
    } finally {
      setIsLoadingKeys(false)
    }
  }

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks")
      if (!response.ok) throw new Error("Failed to fetch webhooks")
      const data = await response.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      console.error("Failed to load webhooks")
    } finally {
      setIsLoadingWebhooks(false)
    }
  }

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key")
      return
    }

    setIsGeneratingKey(true)
    try {
      const response = await fetch("/api/api-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName })
      })

      if (!response.ok) throw new Error("Failed to generate API key")
      
      const data = await response.json()
      setApiKeys(prev => [data.apiKey, ...prev])
      setGeneratedKey(data.apiKey.key)
      setNewKeyName("")
      toast.success("API key generated successfully!")
    } catch (error) {
      toast.error("Failed to generate API key")
    } finally {
      setIsGeneratingKey(false)
    }
  }

  const createWebhook = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast.error("Name and URL are required")
      return
    }

    setIsCreatingWebhook(true)
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook)
      })

      if (!response.ok) throw new Error("Failed to create webhook")
      
      const data = await response.json()
      setWebhooks(prev => [data.webhook, ...prev])
      setNewWebhook({ name: "", url: "" })
      toast.success("Webhook endpoint registered")
    } catch (error) {
      toast.error("Failed to create webhook")
    } finally {
      setIsCreatingWebhook(false)
    }
  }

  const revokeKey = async (id: string) => {
    try {
      const response = await fetch("/api/api-keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: id })
      })

      if (!response.ok) throw new Error("Failed to revoke API key")

      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, status: "revoked" as const } : key
      ))
      toast.success("API key revoked successfully")
    } catch (error) {
      toast.error("Failed to revoke API key")
    }
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const maskKey = (key: string, visible: boolean) => {
    if (visible) return key
    const parts = key.split('_')
    if (parts.length >= 3) {
      return `${parts[0]}_${parts[1]}_${'•'.repeat(24)}${key.slice(-4)}`
    }
    return `${'•'.repeat(key.length - 4)}${key.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="size-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              Developer Settings
            </h1>
          </div>
          <p className="text-gray-400">
            Manage your API keys and webhook integrations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/60 border border-yellow-500/30 p-1 mb-8">
            <TabsTrigger value="keys" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Webhook className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Activity className="w-4 h-4 mr-2" />
              API Usage
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-8">
            {/* Generate New Key Card */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  <Plus className="size-5" />
                  Generate New API Key
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Create a new key to access Cryptoguard's fraud detection engine via REST API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Enter key name (e.g., Production Scanner)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 bg-black/40 border-yellow-500/30 text-gray-200 placeholder:text-gray-500 focus:border-yellow-500/60"
                    onKeyDown={(e) => e.key === "Enter" && generateApiKey()}
                  />
                  <Button
                    onClick={generateApiKey}
                    disabled={isGeneratingKey}
                    className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
                  >
                    {isGeneratingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Key"}
                  </Button>
                </div>

                {generatedKey && (
                  <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/40">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-green-400 font-semibold mb-2">New API Key Generated!</p>
                        <p className="text-sm text-gray-400 mb-3">
                          Make sure to copy your API key now. You won't be able to see it again!
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-black/60 rounded border border-green-500/30 text-green-300 text-sm font-mono break-all">
                            {generatedKey}
                          </code>
                          <Button
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedKey)
                              toast.success("Copied!")
                            }}
                            className="bg-green-500 text-black hover:bg-green-400"
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Keys List */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] overflow-hidden">
              <CardHeader className="border-b border-yellow-500/30">
                <CardTitle className="text-yellow-300">Your API Keys</CardTitle>
                <CardDescription className="text-gray-400">{apiKeys.length} key(s) total</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-yellow-500/20">
                  {isLoadingKeys ? (
                    <div className="p-12 text-center">
                      <Loader2 className="size-8 text-yellow-500 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">Loading your API keys...</p>
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <div className="p-12 text-center">
                      <Key className="size-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No API keys yet. Generate one to get started!</p>
                    </div>
                  ) : (
                    apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className={`p-6 transition-colors ${
                          apiKey.status === "revoked" ? "bg-red-500/5 opacity-60" : "hover:bg-yellow-500/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-200">{apiKey.name}</h3>
                              <Badge className={apiKey.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-red-500/20 text-red-400 border-red-500/50"}>
                                {apiKey.status.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <code className="flex-1 px-3 py-2 bg-black/60 rounded border border-yellow-500/30 text-gray-300 text-sm font-mono break-all">
                                {maskKey(apiKey.key, visibleKeys.has(apiKey.id))}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                              >
                                {visibleKeys.has(apiKey.id) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(apiKey.key)
                                  toast.success("Copied!")
                                }}
                                disabled={apiKey.status === "revoked"}
                                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                              >
                                <Copy className="size-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : "Never"}</span>
                            </div>
                          </div>

                          {apiKey.status === "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeKey(apiKey.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-8">
            {/* Create Webhook Card */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  <Plus className="size-5" />
                  Register Webhook Endpoint
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Receive real-time notifications for alerts, completed scans, and risk threshold breaches.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] items-end">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium">NAME</label>
                    <Input
                      placeholder="e.g., Alert Receiver"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-black/40 border-yellow-500/30 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium">ENDPOINT URL</label>
                    <Input
                      placeholder="https://api.yourdomain.com/webhook"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      className="bg-black/40 border-yellow-500/30 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    onClick={createWebhook}
                    disabled={isCreatingWebhook}
                    className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
                  >
                    {isCreatingWebhook ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Webhooks List */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] overflow-hidden">
              <CardHeader className="border-b border-yellow-500/30">
                <CardTitle className="text-yellow-300">Configured Webhooks</CardTitle>
                <CardDescription className="text-gray-400">{webhooks.length} active endpoint(s)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-yellow-500/20">
                  {isLoadingWebhooks ? (
                    <div className="p-12 text-center">
                      <Loader2 className="size-8 text-yellow-500 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">Loading webhooks...</p>
                    </div>
                  ) : webhooks.length === 0 ? (
                    <div className="p-12 text-center">
                      <Webhook className="size-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No webhooks registered. Add an endpoint to receive live alerts.</p>
                    </div>
                  ) : (
                    webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-6 hover:bg-yellow-500/5 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-200">{webhook.name}</h3>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                {webhook.status.toUpperCase()}
                              </Badge>
                            </div>
                            <code className="text-sm text-yellow-300 break-all">{webhook.url}</code>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {webhook.events.map((event, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] border-yellow-500/30 text-gray-400">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] text-gray-500 font-mono mb-1">SECRET KEY</p>
                              <code className="text-xs text-gray-400">{webhook.secret.slice(0, 12)}...</code>
                            </div>
                            <Button variant="outline" size="sm" className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                              Test
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab (Simulated) */}
          <TabsContent value="usage">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-500 font-medium">MONTHLY REQUESTS</p>
                  <p className="text-3xl font-bold text-yellow-300 mt-1">45,230</p>
                  <p className="text-xs text-gray-400 mt-2">45.2% of 100k quota</p>
                  <div className="w-full h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '45.2%' }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-500 font-medium">AVG RESPONSE TIME</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">124ms</p>
                  <p className="text-xs text-gray-400 mt-2">Optimal performance</p>
                  <div className="flex items-center gap-1 mt-3 text-green-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    SYSTEM HEALTHY
                  </div>
                </CardContent>
              </Card>
              <Card className="border-purple-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-500 font-medium">ERROR RATE</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">0.04%</p>
                  <p className="text-xs text-gray-400 mt-2">Last 24 hours</p>
                  <div className="flex items-center gap-1 mt-3 text-gray-400 text-xs font-semibold">
                    <Activity className="w-3 h-3" />
                    18 SUCCESSFUL CALLS/MIN
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Quick Integration</CardTitle>
                <CardDescription className="text-gray-400">Get up and running in minutes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-yellow-500" />
                    API Endpoint
                  </p>
                  <code className="block p-3 bg-black/60 rounded border border-yellow-500/30 text-yellow-300 text-sm font-mono">
                    https://api.cryptoguard.com/v2/wallet/scan
                  </code>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-500" />
                    Authentication
                  </p>
                  <code className="block p-3 bg-black/60 rounded border border-yellow-500/30 text-yellow-300 text-sm font-mono">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View API Reference
                  </Button>
                  <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                    Download Postman Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Info */}
        <div className="mt-8 rounded-xl border border-blue-500/40 bg-blue-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Need a custom plan?</h3>
              <p className="text-sm text-gray-400 mb-3">
                Institutional clients with high-volume requirements can request dedicated endpoints and custom rate limits.
              </p>
              <Button size="sm" className="bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30">
                Contact Enterprise Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
