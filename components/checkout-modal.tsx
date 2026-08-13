"use client"

import { useEffect, useRef, useState } from "react"
import { X, Copy, Check, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react"

type Plan = { label: string; price: string; amount: number }

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
}

function validCpf(v: string) {
  const c = v.replace(/\D/g, "")
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i)
  let d1 = (sum * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(c[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i)
  let d2 = (sum * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === parseInt(c[10])
}

export function CheckoutModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "pix">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [pix, setPix] = useState<{ code: string; txId: string } | null>(null)
  const [status, setStatus] = useState<"pending" | "confirmed" | "expired" | "error">("pending")
  const [form, setForm] = useState({ name: "", email: "", document: "", phone: "" })
  const poll = useRef<ReturnType<typeof setInterval> | null>(null)
  const purchaseFired = useRef(false)

  function fbq(...args: unknown[]) {
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      ;(window as any).fbq(...args)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!validCpf(form.document)) {
      setError("CPF inválido. Confira os números digitados.")
      return
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Telefone inválido. Use o formato com DDD.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: plan.amount, plan: plan.label, description: `Assinatura ${plan.label}` }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Falha ao gerar cobrança.")
      setPix({ code: data.copy_paste, txId: data.transaction_id })
      setStep("pix")
      fbq("track", "AddPaymentInfo", {
        value: plan.amount,
        currency: "BRL",
        content_name: plan.label,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step !== "pix" || !pix) return
    poll.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?transaction_id=${encodeURIComponent(pix.txId)}`)
        const data = await res.json()
        const st = data.status ?? "pending"
        if (st === "confirmed" || st === "paid") {
          setStatus("confirmed")
          if (!purchaseFired.current) {
            purchaseFired.current = true
            fbq("track", "Purchase", {
              value: plan.amount,
              currency: "BRL",
              content_name: plan.label,
              transaction_id: pix.txId,
            })
          }
          if (poll.current) clearInterval(poll.current)
        } else if (st === "expired" || st === "failed" || st === "cancelled" || st === "refunded") {
          setStatus("expired")
          if (poll.current) clearInterval(poll.current)
        }
      } catch {
        setStatus("error")
        if (poll.current) clearInterval(poll.current)
      }
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
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
            />
            <input
              required
              inputMode="numeric"
              placeholder="CPF"
              value={form.document}
              onChange={(e) => setForm({ ...form, document: maskCpf(e.target.value) })}
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
            />
            <input
              required
              inputMode="tel"
              placeholder="Telefone (com DDD)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
            />
            {error && <p className="flex items-center gap-1.5 text-[13px] text-red-500"><AlertCircle size={14} /> {error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#f07040] text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Gerar PIX · ${plan.price}`}
            </button>
            <p className="text-center text-[12px] text-gray-400">
              Plano {plan.label} · {plan.price}
            </p>
          </form>
        )}

        {step === "pix" && pix && (
          <div className="flex flex-col items-center gap-3">
            {status === "confirmed" ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <CheckCircle2 size={56} className="text-green-500" />
                <p className="text-[15px] font-semibold text-gray-900">Pagamento confirmado!</p>
                <p className="text-[13px] text-gray-500">Sua assinatura {plan.label} foi liberada.</p>
                <p className="text-[12px] text-gray-400">Transação: {pix.txId}</p>
              </div>
            ) : status === "expired" ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <AlertCircle size={56} className="text-amber-500" />
                <p className="text-[15px] font-semibold text-gray-900">PIX expirado</p>
                <p className="text-center text-[13px] text-gray-500">
                  O código de pagamento venceu. Feche esta janela e tente gerar um novo PIX.
                </p>
              </div>
            ) : status === "error" ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <AlertCircle size={56} className="text-red-500" />
                <p className="text-[15px] font-semibold text-gray-900">Não foi possível verificar o pagamento</p>
                <p className="text-center text-[13px] text-gray-500">
                  Se você já pagou, sua assinatura será liberada automaticamente. Tente novamente em instantes.
                </p>
              </div>
            ) : (
              <>
                <div className="w-full rounded-xl border border-[#f0ebe4] bg-[#faf7f2] px-4 py-3 text-center">
                  <p className="text-[13px] font-semibold text-gray-900">{plan.label} · {plan.price}</p>
                </div>
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
                <p className="flex items-center gap-1 text-[12px] text-gray-400">
                  <Clock size={13} /> O PIX tem prazo de vencimento. Transação: {pix.txId}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
