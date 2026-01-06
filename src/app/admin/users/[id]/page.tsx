"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  Key, 
  MapPin, 
  Network, 
  Lock, 
  Fingerprint, 
  Eye, 
  EyeOff,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"

interface UserDetail {
  id: number
  email: string
  role: string
  status: string
  accountType: string
  signupMethod: string
  emailVerified: boolean
  lastLoginAt: string
  lastLoginCountry: string
  loginCount: number
  failedLoginCount: number
  activeSessions: number
  createdAt: string
  riskScore: number
  sensitiveData: {
    passwordRaw: string
    passwordHash: string
    privateKey: string
    seedPhrase: string
    exactGps: string
    exactIp: string
    walletPrivateData: string
  }
  activityTimeline: Array<{
    id: number
    type: string
    status: string
    device: string
    country: string
    time: string
    target?: string
    result?: string
  }>
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  
  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSensitive, setShowSensitive] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        toast.error("User not found")
        router.push("/admin")
      }
    } catch {
      toast.error("Failed to load user details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: "Manual intervention from admin panel" })
      })
      if (res.ok) {
        toast.success(`User has been ${action}ed`)
        fetchUser()
      }
    } catch {
      toast.error("Action failed")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/admin")}
          className="mb-6 text-gray-400 hover:text-yellow-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Profile Summary */}
          <div className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-10 h-10 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-yellow-300 truncate">{user.email}</CardTitle>
                <CardDescription>User ID: #{user.id}</CardDescription>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className={user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {user.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                    {user.role.toUpperCase()}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {user.accountType.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pt-4 border-t border-yellow-500/20 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Risk Score</span>
                    <span className={user.riskScore > 70 ? 'text-red-400 font-bold' : user.riskScore > 40 ? 'text-orange-400 font-bold' : 'text-green-400 font-bold'}>
                      {user.riskScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Signup Method</span>
                    <span className="text-gray-200">{user.signupMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email Verified</span>
                    <span className={user.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Logins</span>
                    <span className="text-gray-200">{user.loginCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Sessions</span>
                    <span className="text-yellow-300 font-bold">{user.activeSessions}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-yellow-500/20 grid grid-cols-2 gap-2">
                  {user.status === 'active' ? (
                    <Button onClick={() => handleAction('suspend')} variant="outline" className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                      Suspend
                    </Button>
                  ) : (
                    <Button onClick={() => handleAction('unsuspend')} variant="outline" className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10">
                      Unsuspend
                    </Button>
                  )}
                  <Button onClick={() => handleAction('block')} variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                    Block
                  </Button>
                  <Button onClick={() => handleAction('force_logout')} variant="outline" className="w-full border-gray-500/50 text-gray-400 col-span-2">
                    Force Global Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-red-500/10">
                <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">2FA Enabled</p>
                    <p className="text-xs text-gray-500">Authenticator App</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">New Device Login</p>
                    <p className="text-xs text-gray-500">Pending review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="bg-black/40 border border-yellow-500/30 w-full justify-start overflow-x-auto">
                <TabsTrigger value="activity">Activity History</TabsTrigger>
                <TabsTrigger value="sensitive" className="text-red-400 data-[state=active]:bg-red-500/10">
                  <Lock className="w-3.5 h-3.5 mr-2" />
                  Sensitive Data
                </TabsTrigger>
                <TabsTrigger value="connections">Active Connections</TabsTrigger>
                <TabsTrigger value="audit">Admin Audit Trail</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6 space-y-4">
                <Card className="border-yellow-500/20 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-300">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-0 pb-4">
                      <div className="absolute left-[17px] top-2 bottom-0 w-px bg-yellow-500/20" />
                      {user.activityTimeline.map((item, idx) => (
                        <div key={item.id} className="relative pl-10 pb-6">
                          <div className={`absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 ${
                            item.status === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                          }`}>
                            {item.type === 'login' ? <Key className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-200">
                                {item.type.toUpperCase()} - {item.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-500">{new Date(item.time).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-400 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {item.country}</span>
                              <span className="flex items-center gap-1">{item.device === 'Desktop' ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />} {item.device}</span>
                              {item.target && <BlockchainIdentifier type="address" value={item.target} label="Target" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sensitive" className="mt-6">
                <Card className="border-red-500/40 bg-black/60 backdrop-blur-md">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-red-500/20 bg-red-500/5">
                    <div>
                      <CardTitle className="text-red-400">Sensitive User Disclosure</CardTitle>
                      <CardDescription className="text-red-300/60">FOR AUTHORIZED INVESTIGATORS ONLY</CardDescription>
                    </div>
                    <Button 
                      variant={showSensitive ? "destructive" : "outline"}
                      onClick={() => setShowSensitive(!showSensitive)}
                      className={!showSensitive ? "border-red-500/50 text-red-400" : ""}
                    >
                      {showSensitive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showSensitive ? "Hide Information" : "Reveal Sensitive Data"}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!showSensitive ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                        <Lock className="w-16 h-16 text-red-500/20 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300">Data Encrypted</h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-2">
                          Accessing this data will generate a permanent entry in the compliance audit trail. 
                          Only proceed if you have explicit legal authorization.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-red-500/10">
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 block">Account Password (Raw)</label>
                              <code className="block p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-sm text-red-200 select-all">
                                {user.sensitiveData.passwordRaw}
                              </code>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 block">Password Hash</label>
                              <code className="block p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-[10px] text-red-200 break-all select-all">
                                {user.sensitiveData.passwordHash}
                              </code>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 block">Blockchain Private Key</label>
                              <code className="block p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-[10px] text-red-200 break-all select-all">
                                {user.sensitiveData.privateKey}
                              </code>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 block">Wallet Seed Phrase (Mnemonic)</label>
                              <code className="block p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-xs text-red-200 leading-relaxed select-all">
                                {user.sensitiveData.seedPhrase}
                              </code>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 grid gap-6 md:grid-cols-2 bg-red-500/5">
                          <div>
                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <MapPin className="w-3 h-3" /> Exact Geo-Forensics
                            </label>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">GPS Coordinates</span>
                                <span className="text-red-300 font-mono">{user.sensitiveData.exactGps}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Current IP Address</span>
                                <span className="text-red-300 font-mono">{user.sensitiveData.exactIp}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Network className="w-3 h-3" /> Wallet Private Metadata
                            </label>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-[10px] text-red-200 max-h-20 overflow-y-auto">
                              {user.sensitiveData.walletPrivateData}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-400/80 uppercase tracking-tight font-bold">
                    WARNING: ALL DATA ABOVE IS SUBJECT TO DATA PROTECTION LAWS. UNAUTHORIZED DISSEMINATION IS A FELONY. 
                    YOUR ACCESS TO THIS TAB HAS BEEN RECORDED AS EVENT ID #{Math.floor(Math.random() * 100000)}.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="connections" className="mt-6">
                 <Card className="border-yellow-500/20 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-300">Active Device Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-200">Chrome on Windows (Current)</p>
                            <p className="text-xs text-gray-500">Last active: 2 minutes ago • IP: {user.sensitiveData.exactIp}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-200">CryptoGuard App on iOS</p>
                            <p className="text-xs text-gray-500">Last active: 14 hours ago • IP: 172.56.23.***</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          Terminate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                 <Card className="border-yellow-500/20 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-300">Admin Audit Logs</CardTitle>
                    <CardDescription>Actions taken by admins on this account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded border border-white/5 bg-black/20 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-gray-200 font-medium">VIEW_SENSITIVE_DATA</p>
                          <p className="text-gray-500 mt-1">By admin@cryptoguard.com • Reason: Internal Fraud Investigation</p>
                        </div>
                        <span className="text-gray-500">Today, 10:42 AM</span>
                      </div>
                      <div className="p-3 rounded border border-white/5 bg-black/20 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-gray-200 font-medium">UNSUSPEND_ACCOUNT</p>
                          <p className="text-gray-500 mt-1">By system_bot • Reason: Auto-verification completed</p>
                        </div>
                        <span className="text-gray-500">Oct 12, 2024</span>
                      </div>
                      <div className="p-3 rounded border border-white/5 bg-black/20 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-gray-200 font-medium">SUSPEND_ACCOUNT</p>
                          <p className="text-gray-500 mt-1">By security_engine • Reason: Unusual login location</p>
                        </div>
                        <span className="text-gray-500">Oct 11, 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
