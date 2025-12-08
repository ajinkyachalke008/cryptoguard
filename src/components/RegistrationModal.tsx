"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function RegistrationModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    setLoading(true)
    
    try {
      await register(formData.email, formData.password, formData.name, formData.organization)
      onOpenChange(false)
      // Reset form
      setFormData({ name: '', email: '', organization: '', password: '', confirmPassword: '' })
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-yellow-500/40 bg-background backdrop-blur shadow-[0_0_40px_#ffd70055]">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-2xl">Join Cryptoguard</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create your account to start monitoring crypto transactions and detecting fraud
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
              placeholder="John Doe"
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
              placeholder="john@example.com"
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org" className="text-gray-300">Organization (Optional)</Label>
            <Input 
              id="org" 
              name="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="Your Company"
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw" className="text-gray-300">Password</Label>
            <Input 
              id="pw" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
              placeholder="••••••••"
              minLength={8}
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
            <p className="text-xs text-gray-500">Minimum 8 characters</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPw" className="text-gray-300">Confirm Password</Label>
            <Input 
              id="confirmPw" 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required 
              placeholder="••••••••"
              minLength={8}
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={loading || formData.password !== formData.confirmPassword} 
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold shadow-[0_0_24px_#ffd70066] transition-all hover:shadow-[0_0_32px_#ffd70088]"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}