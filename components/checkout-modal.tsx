"use client"

import { useEffect, useRef, useState } from "react"
import { X, Copy, Check, Loader2, CheckCircle2 } from "lucide-react"

type Plan = { label: string; price: string; amount: number }

export function CheckoutModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "pix">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [pix, setPix] = useState<{ code: string; txId: string } | null>(null)
  const [status, setStatus] = useState("pending")
  const [form, setForm] = useState({ name: "", email: "", document: "", phone: "" })
  const poll = useRef<ReturnType<typeof setInterval> | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: plan.amount, description: `Assinatura ${plan.label}` }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Falha ao gerar cobrança.")
      setPix({ code: data.copy_paste, txId: data.transaction_id })
      setStep("pix")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step !== "pix" || !pix) return
    poll.current = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?transaction_id=${encodeURIComponent(pix.txId)}`)
      const data = await res.json()
      setStatus(data.status)
      if (data.status === "confirmed" && poll.current) clearInterval(poll.current)
    }, 5000)
    return () => {
      if (poll.current) clearInterval(poll.current)
    }
  }, [step, pix])

  function copy() {
    if (!pix) return
    navigator.clipboard.writeText(pix.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-gray-900">
            {step === "form" ? `Assinar — ${plan.label}` : "Pague com PIX"}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              required
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 rounded-lg border border-gray-200 px-4 text-[16px] outline-none focus:border-[#f07040]"
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-lg border border-gray-200 px-4 text-[16px] outline-none focus:border-[#f07040]"
            />
            <input
              required
              inputMode="numeric"
              placeholder="CPF"
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
              className="h-12 rounded-lg border border-gray-200 px-4 text-[16px] outline-none focus:border-[#f07040]"
            />
            <input
              required
              inputMode="tel"
              placeholder="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-12 rounded-lg border border-gray-200 px-4 text-[16px] outline-none focus:border-[#f07040]"
            />
            {error && <p className="text-[13px] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#f07040] text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Gerar PIX · ${plan.price}`}
            </button>
          </form>
        )}

        {step === "pix" && pix && (
          <div className="flex flex-col items-center gap-3">
            {status === "confirmed" ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <CheckCircle2 size={56} className="text-green-500" />
                <p className="text-[15px] font-semibold text-gray-900">Pagamento confirmado!</p>
                <p className="text-[13px] text-gray-500">Sua assinatura foi liberada.</p>
              </div>
            ) : (
              <>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pix.code)}`}
                  alt="QR Code PIX"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
                <p className="text-center text-[13px] text-gray-500">
                  Escaneie o QR Code ou use o código copia e cola abaixo.
                </p>
                <div className="w-full break-all rounded-lg bg-gray-100 p-3 text-[12px] text-gray-700">
                  {pix.code}
                </div>
                <button
                  onClick={copy}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f07040] text-[15px] font-semibold text-white"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copiado!" : "Copiar código PIX"}
                </button>
                <p className="flex items-center gap-2 text-[13px] text-gray-400">
                  <Loader2 size={14} className="animate-spin" /> Aguardando pagamento...
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
