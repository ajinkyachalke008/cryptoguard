"use client"

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-yellow-500/20 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-2 items-center">
        <div className="flex gap-6 text-sm">
          <a className="text-yellow-300 hover:text-yellow-200" href="#features">Explore features</a>
          <a className="text-yellow-300 hover:text-yellow-200" href="#about">About us</a>
          <a className="text-yellow-300 hover:text-yellow-200" href="#contact">Contact</a>
        </div>
        <div className="text-right text-xs text-muted-foreground">© {new Date().getFullYear()} Cryptoguard</div>
      </div>
    </footer>
  )
}