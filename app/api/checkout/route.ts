import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pixOrders } from "@/lib/db/schema"
import { getSettings } from "@/lib/queries"

export const runtime = "nodejs"

const API = "https://axyrapay.com.br/api"
const TOKEN = process.env.AXYRAPAY_TOKEN

export async function POST(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json({ ok: false, error: "Gateway de pagamento não configurado." }, { status: 500 })
    }

    const { name, email, document, phone, amount, description, plan } = await req.json()

    if (!name || !email || !document || !phone || !amount) {
      return NextResponse.json({ ok: false, error: "Dados obrigatórios ausentes." }, { status: 400 })
    }

    const s = await getSettings()
    const plans = [
      { label: s.label1m, price: Number(s.price1m) },
      { label: s.label3m, price: Number(s.price3m) },
      { label: s.label6m, price: Number(s.price6m) },
    ]
    const selected =
      (plan && plans.find((p) => p.label === plan)) ||
      plans.find((p) => Math.abs(p.price - Number(amount)) < 0.01)
    if (!selected || !Number.isFinite(selected.price)) {
      return NextResponse.json({ ok: false, error: "Plano ou valor inválido." }, { status: 400 })
    }
    const validAmount = selected.price

    const res = await fetch(`${API}/payment.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        name,
        email,
        document: String(document).replace(/\D/g, ""),
        phone: String(phone).replace(/\D/g, ""),
        amount: validAmount,
        description: description ?? "Assinatura Privacy",
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.ok) {
      return NextResponse.json({ ok: false, error: data.error ?? "Falha ao gerar cobrança." }, { status: 400 })
    }

    try {
      await db.insert(pixOrders).values({
        externalId: String(data.transaction_id ?? ""),
        plan: plan ?? description ?? "Assinatura",
        amount: String(validAmount),
        customerName: name,
        customerEmail: email,
        customerCpf: String(document).replace(/\D/g, ""),
        customerPhone: String(phone).replace(/\D/g, ""),
        status: "pending",
      })
    } catch (e) {
      console.log("[v0] Falha ao gravar ordem PIX:", e)
    }

    return NextResponse.json({
      ok: true,
      transaction_id: data.transaction_id,
      copy_paste: data.copy_paste ?? data.pix_code,
      amount: data.amount,
      status: data.status,
    })
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 })
  }
}
