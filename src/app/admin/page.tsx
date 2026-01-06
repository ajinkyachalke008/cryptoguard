"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Shield,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Ban,
  LogOut,
  Key,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  FileText,
  Download,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  ShieldAlert,
  History
} from "lucide-react"
import { toast } from "sonner"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"

interface AdminStats {
  users: {
    total: number
    active: number
    suspended: number
    blocked: number
    pending_verification: number
    new_today: number
    new_this_week: number
    growth_rate: number
  }
  signups: {
    total_today: number
    total_week: number
    by_method: { email: number; oauth_google: number; wallet: number }
    by_account_type: { user: number; developer: number; enterprise: number }
  }
  logins: {
    total_today: number
    success_rate: number
    failed_attempts: number
    unique_users: number
  }
  security: {
    active_alerts: number
    critical_alerts: number
    suspicious_logins: number
    blocked_attempts: number
    geo_anomalies: number
  }
  sessions: {
    active: number
    average_duration_minutes: number
    peak_concurrent: number
  }
  fraud_detection: {
    flagged_accounts: number
    auto_blocked: number
    under_review: number
  }
}

interface AuthLog {
  id: number
  userId: number
  email: string
  eventType: string
  loginMethod: string
  ipHash: string
  deviceType: string
  browser: string
  os: string
  countryCode: string
  countryName: string
  failureReason: string | null
  riskFlags: string[]
  createdAt: string
}

interface User {
  id: number
  email: string
  emailMasked: string
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
  suspendedAt: string | null
  suspendReason: string | null
  createdAt: string
  riskScore: number
  flagged: boolean
}

interface SecurityAlert {
  id: number
  userId: number
  userEmail: string
  alertType: string
  description: string
  severity: string
  status: string
  metadata: Record<string, unknown>
  createdAt: string
}

interface Session {
  id: number
  userId: number
  userEmail: string
  sessionToken: string
  ipHash: string
  deviceType: string
  browser: string
  os: string
  countryCode: string
  lastActivityAt: string
  createdAt: string
  isActive: boolean
}

interface AuditLog {
  id: number
  adminUserId: number
  adminEmail: string
  targetUserId: number
  targetEmail: string
  action: string
  actionDescription: string
  reason: string | null
  createdAt: string
}

const eventTypeColors: Record<string, string> = {
  login_success: "bg-green-500/20 text-green-400 border-green-500/50",
  login_failed: "bg-red-500/20 text-red-400 border-red-500/50",
  signup: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  logout: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  password_reset: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
}

const severityColors: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  critical: "bg-red-500/20 text-red-400 border-red-500/50"
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/50",
  suspended: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  blocked: "bg-red-500/20 text-red-400 border-red-500/50",
  pending_verification: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
}

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'mobile': return <Smartphone className="w-4 h-4" />
    case 'tablet': return <Tablet className="w-4 h-4" />
    default: return <Monitor className="w-4 h-4" />
  }
}

const getCountryFlag = (code: string) => {
  const flags: Record<string, string> = {
    US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", CN: "🇨🇳",
    RU: "🇷🇺", IN: "🇮🇳", BR: "🇧🇷", JP: "🇯🇵", KR: "🇰🇷",
    NG: "🇳🇬"
  }
  return flags[code] || "🌍"
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  
  const [authLogPage, setAuthLogPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const [sessionPage, setSessionPage] = useState(1)
  const [alertPage, setAlertPage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [alertSeverityFilter, setAlertSeverityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")
  const [actionReason, setActionReason] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchAuthLogs()
  }, [authLogPage, eventTypeFilter])

  useEffect(() => {
    fetchUsers()
  }, [userPage, userStatusFilter, searchQuery])

  useEffect(() => {
    fetchSecurityAlerts()
  }, [alertPage, alertSeverityFilter])

  useEffect(() => {
    fetchSessions()
  }, [sessionPage])

  useEffect(() => {
    fetchAuditLogs()
  }, [auditPage])

  const fetchAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchStats(),
      fetchAuthLogs(),
      fetchUsers(),
      fetchSecurityAlerts(),
      fetchSessions(),
      fetchAuditLogs()
    ])
    setIsLoading(false)
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      toast.error("Failed to load stats")
    }
  }

  const fetchAuthLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: authLogPage.toString(),
        limit: "15",
        ...(eventTypeFilter !== "all" && { eventType: eventTypeFilter })
      })
      const res = await fetch(`/api/admin/auth-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAuthLogs(data.logs)
      }
    } catch {
      toast.error("Failed to load auth logs")
    }
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: "15",
        ...(userStatusFilter !== "all" && { status: userStatusFilter }),
        ...(searchQuery && { search: searchQuery })
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch {
      toast.error("Failed to load users")
    }
  }

  const fetchSecurityAlerts = async () => {
    try {
      const params = new URLSearchParams({
        page: alertPage.toString(),
        limit: "15",
        ...(alertSeverityFilter !== "all" && { severity: alertSeverityFilter }),
        status: "active"
      })
      const res = await fetch(`/api/admin/security-alerts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSecurityAlerts(data.alerts)
      }
    } catch {
      toast.error("Failed to load security alerts")
    }
  }

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams({
        page: sessionPage.toString(),
        limit: "15",
        active: "true"
      })
      const res = await fetch(`/api/admin/sessions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions)
      }
    } catch {
      toast.error("Failed to load sessions")
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: auditPage.toString(),
        limit: "15"
      })
      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs)
      }
    } catch {
      toast.error("Failed to load audit logs")
    }
  }

  const handleUserAction = async () => {
    if (!selectedUser) return
    setIsActionLoading(true)
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        setActionDialogOpen(false)
        setActionReason("")
        fetchUsers()
        fetchAuditLogs()
      } else {
        toast.error("Action failed")
      }
    } catch {
      toast.error("Action failed")
    } finally {
      setIsActionLoading(false)
    }
  }

  const openActionDialog = (user: User, action: string) => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const signupMethodData = stats ? [
    { name: "Email", value: stats.signups.by_method.email, color: "#fbbf24" },
    { name: "Google", value: stats.signups.by_method.oauth_google, color: "#4285f4" },
    { name: "Wallet", value: stats.signups.by_method.wallet, color: "#8b5cf6" }
  ] : []

  const userStatusData = stats ? [
    { name: "Active", value: stats.users.active, color: "#10b981" },
    { name: "Suspended", value: stats.users.suspended, color: "#f97316" },
    { name: "Blocked", value: stats.users.blocked, color: "#ef4444" },
    { name: "Pending", value: stats.users.pending_verification, color: "#fbbf24" }
  ] : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent flex items-center gap-3">
              <Shield className="w-10 h-10 text-yellow-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Login & Sign-Up Monitoring • User Management • Security</p>
          </div>
          <Button
            onClick={fetchAllData}
            variant="outline"
            className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-yellow-500/30 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="auth-logs" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Auth Logs
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Users
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Security Alerts
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-300">{stats?.users.total.toLocaleString()}</div>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">+{stats?.users.growth_rate}%</span> this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">New Sign-ups Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{stats?.signups.total_today}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.signups.total_week} this week
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Logins Today</CardTitle>
                  <Activity className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{stats?.logins.total_today.toLocaleString()}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.logins.success_rate}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Security Alerts</CardTitle>
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{stats?.security.active_alerts}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.security.critical_alerts} critical
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300">User Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={userStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {userStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #ffd700' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300">Sign-up Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={signupMethodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #ffd700' }} />
                      <Bar dataKey="value" fill="#fbbf24" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Sessions</span>
                    <span className="text-yellow-300 font-semibold">{stats?.sessions.active.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Failed Logins (24h)</span>
                    <span className="text-red-400 font-semibold">{stats?.logins.failed_attempts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Suspicious Logins</span>
                    <span className="text-orange-400 font-semibold">{stats?.security.suspicious_logins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Geo Anomalies</span>
                    <span className="text-purple-400 font-semibold">{stats?.security.geo_anomalies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Flagged Accounts</span>
                    <span className="text-red-400 font-semibold">{stats?.fraud_detection.flagged_accounts}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Live Authentication Feed</CardTitle>
                <CardDescription className="text-gray-400">Real-time login and signup activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {authLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-yellow-500/20 bg-black/40">
                      <Badge className={eventTypeColors[log.eventType] || "bg-gray-500/20"}>
                        {log.eventType.replace('_', ' ')}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{log.email}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getCountryFlag(log.countryCode)} {log.countryCode}</span>
                          <span>•</span>
                          <DeviceIcon type={log.deviceType} />
                          <span>{log.browser}</span>
                        </div>
                      </div>
                      {log.riskFlags.length > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Risk
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{formatRelativeTime(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth-logs" className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-300">Authentication Logs</CardTitle>
                    <CardDescription className="text-gray-400">All login and signup activity</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                      <SelectTrigger className="w-[180px] bg-black/40 border-yellow-500/30">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-yellow-500/30">
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="login_success">Login Success</SelectItem>
                        <SelectItem value="login_failed">Login Failed</SelectItem>
                        <SelectItem value="signup">Sign Up</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {authLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-black/40 hover:border-yellow-500/40 transition-colors">
                      <div className="flex-shrink-0">
                        {log.eventType === 'login_success' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : log.eventType === 'login_failed' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : log.eventType === 'signup' ? (
                          <UserCheck className="w-5 h-5 text-blue-400" />
                        ) : (
                          <LogOut className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{log.email}</span>
                          <Badge className={eventTypeColors[log.eventType]}>{log.eventType.replace('_', ' ')}</Badge>
                          {log.riskFlags.length > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">
                              {log.riskFlags.join(', ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {getCountryFlag(log.countryCode)} {log.countryName}
                          </span>
                          <span className="flex items-center gap-1">
                            <DeviceIcon type={log.deviceType} />
                            {log.browser} / {log.os}
                          </span>
                          <span>IP: {log.ipHash}</span>
                          <span>Method: {log.loginMethod}</span>
                        </div>
                        {log.failureReason && (
                          <p className="text-xs text-red-400 mt-1">Reason: {log.failureReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuthLogPage(p => Math.max(1, p - 1))}
                    disabled={authLogPage === 1}
                    className="border-yellow-500/30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-gray-400">Page {authLogPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuthLogPage(p => p + 1)}
                    className="border-yellow-500/30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-300">User Management</CardTitle>
                    <CardDescription className="text-gray-400">View and manage user accounts</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px] bg-black/40 border-yellow-500/30"
                      />
                    </div>
                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                      <SelectTrigger className="w-[150px] bg-black/40 border-yellow-500/30">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-yellow-500/30">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="pending_verification">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-black/40 hover:border-yellow-500/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{user.email}</span>
                          <Badge className={statusColors[user.status]}>{user.status.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          {user.flagged && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>ID: {user.id}</span>
                          <span>Type: {user.accountType}</span>
                          <span>Method: {user.signupMethod}</span>
                          <span>Logins: {user.loginCount}</span>
                          <span>Sessions: {user.activeSessions}</span>
                          {user.emailVerified ? (
                            <span className="text-green-400">✓ Verified</span>
                          ) : (
                            <span className="text-yellow-400">⏳ Unverified</span>
                          )}
                        </div>
                        {user.suspendReason && (
                          <p className="text-xs text-orange-400 mt-1">Suspend reason: {user.suspendReason}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Last login: {formatRelativeTime(user.lastLoginAt)}</p>
                        <p>Created: {formatDate(user.createdAt).split(',')[0]}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/95 border-yellow-500/30">
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => openActionDialog(user, 'suspend')} className="cursor-pointer text-orange-400">
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          ) : user.status === 'suspended' ? (
                            <DropdownMenuItem onClick={() => openActionDialog(user, 'unsuspend')} className="cursor-pointer text-green-400">
                              <Unlock className="w-4 h-4 mr-2" />
                              Unsuspend Account
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => openActionDialog(user, 'block')} className="cursor-pointer text-red-400">
                            <Lock className="w-4 h-4 mr-2" />
                            Block Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openActionDialog(user, 'force_logout')} className="cursor-pointer">
                            <LogOut className="w-4 h-4 mr-2" />
                            Force Logout All
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openActionDialog(user, 'reset_password')} className="cursor-pointer">
                            <Key className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="border-yellow-500/30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-gray-400">Page {userPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(p => p + 1)}
                    className="border-yellow-500/30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      Security Alerts
                    </CardTitle>
                    <CardDescription className="text-gray-400">Suspicious login detection and security events</CardDescription>
                  </div>
                  <Select value={alertSeverityFilter} onValueChange={setAlertSeverityFilter}>
                    <SelectTrigger className="w-[150px] bg-black/40 border-red-500/30">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-red-500/30">
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                      alert.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' :
                      alert.severity === 'high' ? 'border-orange-500/50 bg-orange-500/10' :
                      'border-yellow-500/20 bg-black/40'
                    }`}>
                      <div className="flex-shrink-0">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-orange-400' :
                          'text-yellow-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{alert.description}</span>
                          <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>User: {alert.userEmail}</span>
                          <span>Type: {alert.alertType.replace(/_/g, ' ')}</span>
                          {alert.metadata.country && <span>Country: {getCountryFlag(alert.metadata.country as string)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-500/50 text-gray-400">
                          Dismiss
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">{formatRelativeTime(alert.createdAt)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAlertPage(p => Math.max(1, p - 1))}
                    disabled={alertPage === 1}
                    className="border-yellow-500/30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-gray-400">Page {alertPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAlertPage(p => p + 1)}
                    className="border-yellow-500/30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-300">Active Sessions</CardTitle>
                    <CardDescription className="text-gray-400">Currently active user sessions</CardDescription>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {stats?.sessions.active.toLocaleString()} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.filter(s => s.isActive).map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-black/40">
                      <div className="flex-shrink-0">
                        <DeviceIcon type={session.deviceType} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{session.userEmail}</span>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">Active</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{getCountryFlag(session.countryCode)} {session.countryCode}</span>
                          <span>{session.browser} / {session.os}</span>
                          <span>IP: {session.ipHash}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Last activity: {formatRelativeTime(session.lastActivityAt)}</p>
                        <p>Started: {formatRelativeTime(session.createdAt)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Terminate
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                    disabled={sessionPage === 1}
                    className="border-yellow-500/30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-gray-400">Page {sessionPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSessionPage(p => p + 1)}
                    className="border-yellow-500/30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-300 flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription className="text-gray-400">All admin actions are logged for compliance</CardDescription>
                  </div>
                  <Button variant="outline" className="border-yellow-500/30 text-yellow-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/20 bg-black/40">
                      <div className="flex-shrink-0">
                        <FileText className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">{log.actionDescription}</span>
                          <Badge variant="outline" className="text-xs">{log.action}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>Admin: {log.adminEmail}</span>
                          <span>Target: {log.targetEmail}</span>
                          {log.reason && <span>Reason: {log.reason}</span>}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                    disabled={auditPage === 1}
                    className="border-yellow-500/30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-gray-400">Page {auditPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(p => p + 1)}
                    className="border-yellow-500/30"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300">Privacy & Legal Notice</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      This admin panel displays public blockchain identifiers and hashed/anonymized data only. 
                      Admin cannot view user passwords, private keys, seed phrases, exact GPS locations, or exact IP addresses.
                      All sensitive data is hashed for privacy. All admin actions are immutably logged for compliance and legal purposes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="bg-black/95 border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-yellow-300">
              {actionType === 'suspend' && 'Suspend User'}
              {actionType === 'unsuspend' && 'Unsuspend User'}
              {actionType === 'block' && 'Block User'}
              {actionType === 'force_logout' && 'Force Logout User'}
              {actionType === 'reset_password' && 'Reset Password'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser && `This action will be applied to ${selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-300">Reason (optional)</label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for this action..."
                className="mt-1 bg-black/40 border-yellow-500/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} className="border-gray-500/50">
              Cancel
            </Button>
            <Button
              onClick={handleUserAction}
              disabled={isActionLoading}
              className={
                actionType === 'suspend' || actionType === 'block' ? 'bg-red-500 hover:bg-red-600' :
                actionType === 'unsuspend' ? 'bg-green-500 hover:bg-green-600' :
                'bg-yellow-500 hover:bg-yellow-600 text-black'
              }
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
