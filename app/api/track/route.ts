import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pageVisits } from "@/lib/db/schema"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null
    await db.insert(pageVisits).values({
      path: body.path ?? "/",
      referrer: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
      ip,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
