import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 })

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, { access: "private" })
    // Store store is private; serve via public delivery route.
    return NextResponse.json({ url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}` })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Falha no upload." }, { status: 500 })
  }
}
