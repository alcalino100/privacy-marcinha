"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { saveSettings } from "@/app/actions/admin"
import { ImageUpload } from "@/components/image-upload"
import { PostsManager } from "@/components/posts-manager"
import type { Settings, Post } from "@/lib/queries"
import { LogOut, LayoutDashboard, ListOrdered, Users, Settings as SettingsIcon, Palette, GalleryHorizontalEnd } from "lucide-react"

type Order = {
  id: number
  plan: string
  amount: string
  customerName: string | null
  customerEmail: string | null
  status: string
  createdAt: string | Date
}
type Visit = {
  id: number
  path: string | null
  referrer: string | null
  ip: string | null
  createdAt: string | Date
}
type Stats = {
  totalGenerated: number
  totalPaid: number
  revenue: number
  totalVisits: number
  visitsToday: number
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const dt = (d: string | Date) => new Date(d).toLocaleString("pt-BR")

const TABS = [
  { id: "stats", label: "Visão geral", icon: LayoutDashboard },
  { id: "orders", label: "PIX", icon: ListOrdered },
  { id: "visits", label: "Acessos", icon: Users },
  { id: "cards", label: "Cards", icon: GalleryHorizontalEnd },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "settings", label: "Perfil", icon: SettingsIcon },
] as const

export function AdminDashboard({
  stats,
  orders,
  visits,
  settings,
  posts,
}: {
  stats: Stats
  orders: Order[]
  visits: Visit[]
  settings: Settings
  posts: Post[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("stats")
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function logout() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, String(v ?? "")]),
    ) as Record<string, string>
    await saveSettings(payload)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const field = (k: keyof Settings) => ({
    value: String(form[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value }),
    className:
      "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-900 outline-none focus:border-[#f07040]",
  })

  const setImg = (k: keyof Settings) => (url: string) => setForm({ ...form, [k]: url })

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-[#f0ebe4] pb-10">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e0d8] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/privacy-logo.png" alt="privacy." className="h-5 w-auto" />
          <span className="text-[13px] font-semibold text-gray-400">admin</span>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-gray-900">
          <LogOut size={16} /> Sair
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-[#e5e0d8] bg-white px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-[13px] font-medium ${
              tab === t.id ? "border-b-2 border-[#f07040] text-gray-900" : "text-gray-400"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card label="PIX gerados" value={String(stats.totalGenerated)} />
            <Card label="PIX pagos" value={String(stats.totalPaid)} />
            <Card label="Faturamento" value={brl(stats.revenue)} />
            <Card label="Acessos totais" value={String(stats.totalVisits)} />
            <Card label="Acessos hoje" value={String(stats.visitsToday)} />
            <Card
              label="Conversão"
              value={`${stats.totalVisits ? ((stats.totalPaid / stats.totalVisits) * 100).toFixed(1) : "0"}%`}
            />
          </div>
        )}

        {tab === "orders" && (
          <div className="overflow-x-auto rounded-xl border border-[#e5e0d8] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[#e5e0d8] text-gray-500">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Plano</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      Nenhuma cobrança gerada ainda.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[#f0ece5] text-gray-800">
                    <td className="p-3 whitespace-nowrap">{dt(o.createdAt)}</td>
                    <td className="p-3">
                      <div className="font-medium">{o.customerName ?? "—"}</div>
                      <div className="text-gray-400">{o.customerEmail}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{o.plan}</td>
                    <td className="p-3 whitespace-nowrap">{brl(Number(o.amount))}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${
                          o.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {o.status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "visits" && (
          <div className="overflow-x-auto rounded-xl border border-[#e5e0d8] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[#e5e0d8] text-gray-500">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Página</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400">
                      Nenhum acesso registrado ainda.
                    </td>
                  </tr>
                )}
                {visits.map((v) => (
                  <tr key={v.id} className="border-b border-[#f0ece5] text-gray-800">
                    <td className="p-3 whitespace-nowrap">{dt(v.createdAt)}</td>
                    <td className="p-3">{v.path ?? "/"}</td>
                    <td className="p-3 max-w-[160px] truncate">{v.referrer ?? "direto"}</td>
                    <td className="p-3">{v.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "cards" && <PostsManager posts={posts} />}

        {tab === "appearance" && (
          <form onSubmit={onSave} className="flex flex-col gap-4 rounded-xl border border-[#e5e0d8] bg-white p-4">
            <Group title="Cores do site">
              <ColorLabel t="Cor de destaque" value={form.accent} onChange={(v) => setForm({ ...form, accent: v })} />
              <ColorLabel t="Destaque secundário" value={form.accentDark} onChange={(v) => setForm({ ...form, accentDark: v })} />
              <ColorLabel t="Cor de fundo" value={form.bg} onChange={(v) => setForm({ ...form, bg: v })} />
            </Group>
            <Group title="Textos e rótulos">
              <Label t="Título assinaturas"><input {...field("subsLabel")} /></Label>
              <Label t="Título promoções"><input {...field("promoLabel")} /></Label>
              <Label t="Rótulo plano 1"><input {...field("label1m")} /></Label>
              <Label t="Rótulo plano 2"><input {...field("label3m")} /></Label>
              <Label t="Rótulo plano 3"><input {...field("label6m")} /></Label>
              <Label t="Aba postagens"><input {...field("postsLabel")} /></Label>
              <Label t="Aba mídias"><input {...field("mediaLabel")} /></Label>
              <Label t="Texto 'Ler mais'"><input {...field("readMore")} /></Label>
            </Group>
            <SaveBar saving={saving} saved={saved} />
          </form>
        )}

        {tab === "settings" && (
          <form onSubmit={onSave} className="flex flex-col gap-4 rounded-xl border border-[#e5e0d8] bg-white p-4">
            <Group title="Identidade">
              <Label t="Nome">
                <input {...field("name")} />
              </Label>
              <Label t="@handle">
                <input {...field("handle")} />
              </Label>
              <Label t="Bio" full>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-[14px] text-gray-900 outline-none focus:border-[#f07040]"
                />
              </Label>
            </Group>

            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Imagens</h3>
              <div className="flex flex-col gap-3">
                <ImageUpload label="Foto de perfil" value={form.avatarUrl} onChange={setImg("avatarUrl")} />
                <ImageUpload label="Foto de capa" value={form.coverUrl} onChange={setImg("coverUrl")} />
                <ImageUpload label="Imagem bloqueada padrão" value={form.lockedUrl} onChange={setImg("lockedUrl")} />
              </div>
            </div>

            <Group title="Valores dos planos (R$)">
              <Label t="1 mês">
                <input {...field("price1m")} inputMode="decimal" />
              </Label>
              <Label t="3 meses">
                <input {...field("price3m")} inputMode="decimal" />
              </Label>
              <Label t="6 meses">
                <input {...field("price6m")} inputMode="decimal" />
              </Label>
            </Group>

            <Group title="Contadores">
              <Label t="Fotos">
                <input {...field("photos")} />
              </Label>
              <Label t="Vídeos">
                <input {...field("videos")} />
              </Label>
              <Label t="Bloqueados">
                <input {...field("locked")} />
              </Label>
              <Label t="Curtidas">
                <input {...field("likes")} />
              </Label>
              <Label t="Postagens">
                <input {...field("posts")} />
              </Label>
              <Label t="Mídias">
                <input {...field("media")} />
              </Label>
            </Group>

            <SaveBar saving={saving} saved={saved} />
          </form>
        )}
      </div>
    </div>
  )
}

function SaveBar({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={saving}
        className="h-11 rounded-full bg-[#f07040] px-6 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
      {saved && <span className="text-[13px] font-medium text-green-600">Salvo!</span>}
    </div>
  )
}

function ColorLabel({ t, value, onChange }: { t: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] text-gray-500">{t}</span>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 flex-1 bg-transparent text-[14px] text-gray-900 outline-none"
        />
      </div>
    </label>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e5e0d8] bg-white p-4">
      <p className="text-[12px] text-gray-500">{label}</p>
      <p className="mt-1 text-[22px] font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Label({ t, children, full }: { t: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-[12px] text-gray-500">{t}</span>
      {children}
    </label>
  )
}
