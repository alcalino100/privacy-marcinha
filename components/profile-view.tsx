"use client"

import { useEffect, useRef, useState } from "react"
import { CheckoutModal } from "@/components/checkout-modal"
import type { Settings, Post } from "@/lib/queries"
import {
  Image as ImageIcon,
  Video,
  Lock,
  Heart,
  BadgeCheck,
  ChevronUp,
  FileText,
  GalleryHorizontal,
  MessageCircle,
  Home,
  Search,
  User,
  X,
} from "lucide-react"

function brl(v: string) {
  return `R$ ${Number(v).toFixed(2).replace(".", ",")}`
}

function PlanButton({
  label,
  price,
  style,
  onSelect,
}: {
  label: string
  price: string
  style: React.CSSProperties
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={style}
      className="flex h-[52px] w-full items-center justify-between rounded-full px-5 text-white transition hover:brightness-105 cursor-pointer"
    >
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="text-[15px] font-semibold">{price}</span>
    </button>
  )
}

type Plan = { label: string; price: string; amount: number }

export function ProfileView({ s, posts }: { s: Settings; posts: Post[] }) {
  const [promoOpen, setPromoOpen] = useState(true)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [bioOpen, setBioOpen] = useState(false)
  const [tab, setTab] = useState<"posts" | "media">("posts")
  const [viewer, setViewer] = useState<Post | null>(null)
  const tracked = useRef(false)

  const mediaPosts = posts.filter((p) => p.photos || p.videos)
  const visible = tab === "media" ? mediaPosts : posts

  function fbq(...args: unknown[]) {
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      ;(window as any).fbq(...args)
    }
  }

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/" }),
    }).catch(() => {})
    fbq("track", "ViewContent", { content_name: s.name })
  }, [])

  function selectPlan(p: Plan) {
    setPlan(p)
    fbq("track", "InitiateCheckout", {
      value: p.amount,
      currency: "BRL",
      content_name: p.label,
    })
  }

  const gradSolid = { backgroundImage: `linear-gradient(to right, ${s.accentDark}, ${s.accent})` }
  const gradPromo = { backgroundImage: `linear-gradient(to right, ${s.accentDark}, ${s.accentDark})` }

  const socials = [
    { key: "instagram", href: s.instagram },
    { key: "x", href: s.x },
    { key: "tiktok", href: s.tiktok },
  ].filter((x) => x.href) as { key: string; href: string }[]

  return (
    <main className="mx-auto min-h-screen w-full max-w-[480px] pb-16" style={{ backgroundColor: s.bg }}>
      <header className="sticky top-0 z-20 flex justify-center bg-white py-3">
        <img src="/privacy-logo.png" alt="privacy." className="h-6 w-auto" />
      </header>

      <div className="relative">
        <img src={s.coverUrl || "/placeholder.svg"} alt={`Foto de capa de ${s.name}`} width={480} height={180} fetchPriority="high" decoding="async" className="h-[180px] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"><ImageIcon size={12} /> {s.photos}</span>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"><Video size={12} /> {s.videos}</span>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"><Lock size={12} /> {s.locked}</span>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"><Heart size={12} /> {s.likes}</span>
        </div>
        <div className="absolute -bottom-9 left-3 z-10">
          <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-white">
            <img src={s.avatarUrl || "/placeholder.svg"} alt={`Avatar de ${s.name}`} width={72} height={72} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          </div>
          <span className="absolute bottom-1 right-1 h-[10px] w-[10px] rounded-full border-2 border-white bg-green-500" />
        </div>
      </div>

      <section className="px-4 pb-4 pt-12">
        <div className="flex items-center gap-1">
          <h1 className="text-[17px] font-bold text-gray-900">{s.name}</h1>
          <BadgeCheck size={16} className="text-[#3b82f6]" />
        </div>
        <p className="text-[13px] text-gray-500">{s.handle}</p>
        <p className={`mt-2 text-[13px] text-gray-700 ${bioOpen ? "" : "line-clamp-2"}`}>
          {s.bio}
          {s.bio.length > 80 && (
            <button
              onClick={() => setBioOpen((v) => !v)}
              className="ml-1 font-medium"
              style={{ color: s.accent }}
            >
              {bioOpen ? "Mostrar menos" : s.readMore}
            </button>
          )}
        </p>
        {socials.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-gray-700">
            {socials.map((x) => (
              <a key={x.key} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.key}>
                <img src={`https://cdn.simpleicons.org/${x.key}/374151`} alt="" width={24} height={24} />
              </a>
            ))}
          </div>
        )}

        <h2 className="mb-2 mt-4 text-[15px] font-semibold text-gray-900">{s.subsLabel}</h2>
        <PlanButton
          label={s.label1m}
          price={brl(s.price1m)}
          style={gradSolid}
          onSelect={() => selectPlan({ label: s.label1m, price: brl(s.price1m), amount: Number(s.price1m) })}
        />

        <div className="mt-4 border-t" style={{ borderColor: "#e5e0d8" }}>
          <button onClick={() => setPromoOpen((v) => !v)} className="flex w-full items-center justify-between py-3">
            <span className="text-[15px] font-semibold text-gray-900">{s.promoLabel}</span>
            <ChevronUp size={18} className={`text-gray-600 transition-transform duration-300 ${promoOpen ? "" : "rotate-180"}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${promoOpen ? "max-h-60" : "max-h-0"}`}>
            <div className="flex flex-col gap-2 pb-2">
              <PlanButton
                label={s.label3m}
                price={brl(s.price3m)}
                style={gradPromo}
                onSelect={() => selectPlan({ label: s.label3m, price: brl(s.price3m), amount: Number(s.price3m) })}
              />
              <PlanButton
                label={s.label6m}
                price={brl(s.price6m)}
                style={gradPromo}
                onSelect={() => selectPlan({ label: s.label6m, price: brl(s.price6m), amount: Number(s.price6m) })}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex w-full border-b-2" style={{ borderColor: "#e5e0d8" }}>
        <button
          onClick={() => setTab("posts")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-2 text-[14px] font-medium ${tab === "posts" ? "text-gray-900" : "text-gray-400"}`}
          style={tab === "posts" ? { borderColor: s.accent } : { borderColor: "transparent" }}
        >
          <FileText size={16} /> {s.posts} {s.postsLabel}
        </button>
        <button
          onClick={() => setTab("media")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-2 text-[14px] font-medium ${tab === "media" ? "text-gray-900" : "text-gray-400"}`}
          style={tab === "media" ? { borderColor: s.accent } : { borderColor: "transparent" }}
        >
          <GalleryHorizontal size={16} /> {s.media} {s.mediaLabel}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-4">
        {visible.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-xl border border-[#ede8e0] bg-white">
            <button
              onClick={() => (p.locked ? selectPlan({ label: s.label1m, price: brl(s.price1m), amount: Number(s.price1m) }) : setViewer(p))}
              className="relative block w-full aspect-square bg-[#ede8e0]"
              aria-label={p.locked ? `Conteúdo bloqueado de ${s.name}` : p.caption || "Ver post"}
            >
              <img
                src={p.imageUrl || "/placeholder.svg"}
                alt={p.locked ? `Conteúdo bloqueado de ${s.name}` : p.caption || "Post"}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover ${p.locked ? "blur-2xl scale-110" : ""}`}
              />
              {p.locked && (
                <>
                  <svg className="absolute -bottom-8 -left-8 opacity-60" width="140" height="140" viewBox="0 0 180 180" fill="none">
                    <path d="M0 180 A180 180 0 0 1 180 0" stroke="white" strokeWidth="14" fill="none" />
                    <path d="M0 130 A130 130 0 0 1 130 0" stroke="white" strokeWidth="14" fill="none" />
                  </svg>
                  <svg className="absolute -right-8 -top-8 rotate-180 opacity-60" width="140" height="140" viewBox="0 0 180 180" fill="none">
                    <path d="M0 180 A180 180 0 0 1 180 0" stroke="white" strokeWidth="14" fill="none" />
                    <path d="M0 130 A130 130 0 0 1 130 0" stroke="white" strokeWidth="14" fill="none" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Lock size={36} strokeWidth={1.5} className="text-[#8a9bb0]" />
                  </span>
                </>
              )}
            </button>
            <div className="px-2.5 py-2">
              {p.caption && <p className="truncate text-[12px] text-gray-700">{p.caption}</p>}
              <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                {p.photos && <span className="flex items-center gap-1"><ImageIcon size={13} /> {p.photos}</span>}
                {p.videos && <span className="flex items-center gap-1"><Video size={13} /> {p.videos}</span>}
                {p.likes && <span className="flex items-center gap-1"><Heart size={13} /> {p.likes}</span>}
              </div>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full py-8 text-center text-[13px] text-gray-400">Nenhuma publicação ainda.</p>
        )}
      </div>

      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-[#e5e0d8] bg-white px-4 py-3">
        <Home size={24} className="text-gray-500" />
        <Search size={24} className="text-gray-500" />
        <MessageCircle size={24} className="text-gray-500" />
        <User size={24} className="text-gray-500" />
      </nav>

      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewer(null)}>
          <div className="flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <img src={s.avatarUrl || "/placeholder.svg"} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-900">{s.name} <BadgeCheck size={13} className="text-[#3b82f6]" /></div>
                  <span className="text-[11px] text-gray-400">{s.handle}</span>
                </div>
              </div>
              <button onClick={() => setViewer(null)} aria-label="Fechar">
                <X size={22} className="text-gray-500" />
              </button>
            </div>
            <div className="relative aspect-square bg-black">
              <img src={viewer.imageUrl || "/placeholder.svg"} alt={viewer.caption || "Post"} className="h-full w-full object-contain" />
            </div>
            {viewer.caption && <p className="px-4 py-2 text-[13px] text-gray-700">{viewer.caption}</p>}
            <div className="flex items-center gap-4 px-4 pb-4 pt-1 text-[13px] text-gray-500">
              {viewer.photos && <span className="flex items-center gap-1"><ImageIcon size={15} /> {viewer.photos}</span>}
              {viewer.videos && <span className="flex items-center gap-1"><Video size={15} /> {viewer.videos}</span>}
              {viewer.likes && <span className="flex items-center gap-1"><Heart size={15} /> {viewer.likes}</span>}
            </div>
          </div>
        </div>
      )}

      {plan && <CheckoutModal plan={plan} onClose={() => setPlan(null)} />}
    </main>
  )
}
