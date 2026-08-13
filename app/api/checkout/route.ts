import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pixOrders } from "@/lib/db/schema"

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
        amount: Number(amount),
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
        amount: String(amount),
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
