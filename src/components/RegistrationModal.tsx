"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function RegistrationModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-yellow-500/40 bg-background/80 backdrop-blur shadow-[0_0_40px_#ffd70055]">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Join Cryptoguard</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required className="bg-black/40 border-yellow-500/30" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" required className="bg-black/40 border-yellow-500/30" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org">Organization</Label>
            <Input id="org" name="organization" className="bg-black/40 border-yellow-500/30" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" name="password" required className="bg-black/40 border-yellow-500/30" />
          </div>
          <Button type="submit" disabled={loading} className="bg-yellow-500 text-black hover:bg-yellow-400">
            {loading ? "Submitting..." : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}