"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Copy, Trash2, Plus, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string | null
  status: "active" | "revoked"
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchApiKeys()
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
      setIsLoading(false)
    }
  }

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key")
      return
    }

    setIsGenerating(true)
    
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
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("API key copied to clipboard!")
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
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
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
            <Key className="size-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              API Keys
            </h1>
          </div>
          <p className="text-gray-400">
            Manage your API keys to access Cryptoguard programmatically
          </p>
        </div>

        {/* Generate New Key Card */}
        <div className="mb-8 rounded-xl border border-yellow-500/40 bg-black/60 p-6 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
            <Plus className="size-5" />
            Generate New API Key
          </h2>
          
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Enter key name (e.g., Production API)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-black/40 border-yellow-500/30 text-gray-200 placeholder:text-gray-500 focus:border-yellow-500/60"
              onKeyDown={(e) => e.key === "Enter" && generateApiKey()}
            />
            <Button
              onClick={generateApiKey}
              disabled={isGenerating}
              className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : "Generate Key"}
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
                      onClick={() => copyToClipboard(generatedKey)}
                      className="bg-green-500 text-black hover:bg-green-400"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Keys List */}
        <div className="rounded-xl border border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] overflow-hidden">
          <div className="p-6 border-b border-yellow-500/30">
            <h2 className="text-xl font-semibold text-yellow-300">Your API Keys</h2>
            <p className="text-sm text-gray-400 mt-1">{apiKeys.length} key(s) total</p>
          </div>

          <div className="divide-y divide-yellow-500/20">
            {isLoading ? (
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
                    apiKey.status === "revoked" 
                      ? "bg-red-500/5 opacity-60" 
                      : "hover:bg-yellow-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-200">
                          {apiKey.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            apiKey.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {apiKey.status}
                        </span>
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
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(apiKey.key)}
                          disabled={apiKey.status === "revoked"}
                          className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>
                          Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : "Never"}
                        </span>
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
        </div>

        {/* Usage Info */}
        <div className="mt-8 rounded-xl border border-blue-500/40 bg-blue-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">API Usage</h3>
              <p className="text-sm text-gray-400 mb-3">
                Include your API key in the Authorization header of your requests:
              </p>
              <code className="block px-4 py-3 bg-black/60 rounded border border-blue-500/30 text-blue-300 text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
              <p className="text-sm text-gray-500 mt-3">
                Visit our <a href="/docs" className="text-yellow-400 hover:text-yellow-300 underline">API documentation</a> for more details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
