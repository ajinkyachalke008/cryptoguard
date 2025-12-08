"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Shield, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(255,215,0,0.15),transparent_60%)]" />
      
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 text-yellow-300 hover:text-yellow-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_#ffd70033]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your CryptoGuard account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
