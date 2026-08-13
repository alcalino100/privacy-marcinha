import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pixOrders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

const TOKEN = process.env.AXYRAPAY_TOKEN

// Endpoint privado que recebe as notificações (webhooks) do gateway AxyraPay.
// Configure esta URL no painel da AxyraPay: https://SEU-DOMINIO/api/webhook
export async function POST(req: NextRequest) {
  try {
    // Valida a origem via token (Authorization: Bearer, header x-webhook-token ou query ?token=)
    const auth = req.headers.get("authorization")?.replace("Bearer ", "")
    const headerToken = req.headers.get("x-webhook-token")
    const queryToken = req.nextUrl.searchParams.get("token")
    if (auth !== TOKEN && headerToken !== TOKEN && queryToken !== TOKEN) {
      return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 })
    }

    const event = await req.json()
    const transactionId = event.transaction_id ?? event.id
    const status = event.status ?? event.payment_status

    console.log("[v0] Webhook AxyraPay recebido:", { transactionId, status })

    // Aqui você trata o evento (ex.: liberar assinatura quando status === "confirmed").
    if (status === "confirmed" || status === "paid") {
      console.log("[v0] Pagamento confirmado para a transação:", transactionId)
      if (transactionId) {
        try {
          await db
            .update(pixOrders)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(pixOrders.externalId, String(transactionId)))
        } catch (e) {
          console.log("[v0] Falha ao atualizar ordem paga:", e)
        }
      }
    }

    return NextResponse.json({ ok: true, received: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 })
  }
}

// Bloqueia acesso via navegador (GET) — este endpoint não é público.
export async function GET() {
  return NextResponse.json({ ok: false, error: "Método não permitido." }, { status: 405 })
}
