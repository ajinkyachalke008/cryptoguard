"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "Real-time Risk Scoring",
    desc: "Millisecond risk predictions with glowing clarity.",
    img:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Graph + Rules + LLM Hybrid Detection",
    desc: "Best-in-class hybrid AI pipeline.",
    img:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Exports & Case Bundles",
    desc: "One-click sharable investigation kits.",
    img:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1600&auto=format&fit=crop",
  },
]

const solutions = [
  {
    title: "Fraud Dashboard",
    img:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/0ad00823-3ee5-4e7f-969c-c69c567a8b0d/generated_images/futuristic-ai-crypto-fraud-detection-das-c0f89733-20250928055008.jpg?",
  },
  {
    title: "Compliance Reports",
    img:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Graph Network",
    img:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop",
  },
]

export default function FeaturesSolutions() {
  const [modal, setModal] = useState<null | { title: string; img: string }>(null)

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-xl border border-yellow-500/30 bg-black/40 p-4 shadow-[0_0_30px_#ffd70022] transition-transform will-change-transform hover:-translate-y-1 hover:shadow-[0_0_40px_#ffd70055]"
          >
            <div className="absolute inset-0 opacity-30">
              <Image src={f.img} alt="feature" fill className="object-cover" />
            </div>
            <div className="relative">
              <div className="text-yellow-400 font-semibold mb-1">{f.title}</div>
              <div className="text-muted-foreground text-sm">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-center text-2xl font-semibold text-yellow-400 mt-14">Our Solutions</h3>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {solutions.map((s) => (
          <button
            key={s.title}
            onClick={() => setModal(s)}
            className="group relative h-48 overflow-hidden rounded-xl border border-yellow-500/30 bg-black/40 p-4 text-left shadow-[0_0_30px_#ffd70022] transition-transform hover:-translate-y-1 hover:shadow-[0_0_40px_#ffd70055]"
          >
            <Image src={s.img} alt={s.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition" />
            <div className="relative text-yellow-300 font-medium">{s.title}</div>
          </button>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-3xl rounded-xl border border-yellow-500/40 bg-background/90 p-6 shadow-[0_0_40px_#ffd70044]">
            <div className="text-yellow-400 mb-4 font-semibold">{modal.title}</div>
            <div className="relative h-80">
              <Image src={modal.img} alt={modal.title} fill className="object-cover rounded-md" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Mini demo placeholder: animated fraud widgets coming soon.
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setModal(null)} className="bg-yellow-500 text-black hover:bg-yellow-400">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}