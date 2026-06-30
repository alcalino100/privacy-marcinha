import { type NextRequest, NextResponse } from "next/server"

const API = "https://axyrapay.com.br/api"
const TOKEN = process.env.AXYRAPAY_TOKEN ?? "013f7434558df7ab6c2d7cbebf4769477857bd6b9724d329fc875905ca663833"

export async function POST(req: NextRequest) {
  try {
    const { name, email, document, phone, amount, description } = await req.json()

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
