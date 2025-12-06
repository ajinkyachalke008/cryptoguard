"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

export function RegistrationModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || "Registration failed. Please try again.")
        return
      }
      
      toast.success("🎉 Account created successfully! Welcome to CryptoGuard.")
      onOpenChange(false)
      
      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.")
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
              required 
              placeholder="••••••••"
              minLength={8}
              className="bg-black/40 border-yellow-500/30 focus:border-yellow-500/60" 
            />
            <p className="text-xs text-gray-500">Minimum 8 characters</p>
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold shadow-[0_0_24px_#ffd70066] transition-all hover:shadow-[0_0_32px_#ffd70088]"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}