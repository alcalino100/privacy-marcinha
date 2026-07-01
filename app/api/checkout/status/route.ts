import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pixOrders } from "@/lib/db/schema"
import { and, eq, ne } from "drizzle-orm"

export const runtime = "nodejs"

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
    const status = data.status ?? "pending"

    if (status === "confirmed" || status === "paid") {
      try {
        await db
          .update(pixOrders)
          .set({ status: "paid", paidAt: new Date() })
          .where(and(eq(pixOrders.externalId, String(id)), ne(pixOrders.status, "paid")))
      } catch (e) {
        console.log("[v0] Falha ao sincronizar status:", e)
      }
    }

    return NextResponse.json({ ok: data.ok ?? false, status })
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 })
  }
}
