import { type NextRequest, NextResponse } from "next/server"

const API = "https://axyrapay.com.br/api"
const TOKEN = process.env.AXYRAPAY_TOKEN ?? "013f7434558df7ab6c2d7cbebf4769477857bd6b9724d329fc875905ca663833"

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("transaction_id")
  if (!id) return NextResponse.json({ ok: false, error: "transaction_id ausente." }, { status: 400 })

  try {
    const res = await fetch(`${API}/status.php?transaction_id=${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    const data = await res.json()
    return NextResponse.json({ ok: data.ok ?? false, status: data.status ?? "pending" })
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 })
  }
}
