"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pixOrders, pageVisits, profileSettings, posts } from "@/lib/db/schema"
import { desc, eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

export async function validateSignupCode(code: string) {
  const expected = process.env.ADMIN_SIGNUP_CODE
  if (!expected) return { ok: false, error: "Cadastro de admin desativado. Configure ADMIN_SIGNUP_CODE." }
  if (code.trim() !== expected) return { ok: false, error: "Código de convite inválido." }
  return { ok: true }
}

export async function getDashboard() {
  await requireUser()

  const orders = await db.select().from(pixOrders).orderBy(desc(pixOrders.createdAt)).limit(200)

  const [{ totalGenerated }] = await db
    .select({ totalGenerated: sql<number>`count(*)::int` })
    .from(pixOrders)
  const [{ totalPaid }] = await db
    .select({ totalPaid: sql<number>`count(*)::int` })
    .from(pixOrders)
    .where(eq(pixOrders.status, "paid"))
  const [{ revenue }] = await db
    .select({ revenue: sql<number>`coalesce(sum(amount),0)::float` })
    .from(pixOrders)
    .where(eq(pixOrders.status, "paid"))
  const [{ paidToday }] = await db
    .select({ paidToday: sql<number>`count(*)::int` })
    .from(pixOrders)
    .where(and(eq(pixOrders.status, "paid"), sql`"paidAt" >= current_date`))
  const [{ totalVisits }] = await db
    .select({ totalVisits: sql<number>`count(*)::int` })
    .from(pageVisits)
  const [{ visitsToday }] = await db
    .select({ visitsToday: sql<number>`count(*)::int` })
    .from(pageVisits)
    .where(sql`"createdAt" >= current_date`)

  const recentVisits = await db
    .select()
    .from(pageVisits)
    .orderBy(desc(pageVisits.createdAt))
    .limit(50)

  const allPosts = await db.select().from(posts).orderBy(posts.sortOrder, posts.id)

  return {
    orders,
    recentVisits,
    posts: allPosts,
    stats: {
      totalGenerated: totalGenerated ?? 0,
      totalPaid: totalPaid ?? 0,
      revenue: revenue ?? 0,
      paidToday: paidToday ?? 0,
      totalVisits: totalVisits ?? 0,
      visitsToday: visitsToday ?? 0,
    },
  }
}

const SETTINGS_FIELDS = [
  "name", "handle", "bio", "avatarUrl", "coverUrl", "lockedUrl",
  "price1m", "price3m", "price6m", "photos", "videos", "locked",
  "likes", "posts", "media", "accent", "accentDark", "bg",
  "subsLabel", "promoLabel", "label1m", "label3m", "label6m",
  "postsLabel", "mediaLabel", "readMore", "instagram", "x", "tiktok",
] as const

export async function saveSettings(data: Record<string, string>) {
  await requireUser()
  const set: Record<string, unknown> = { updatedAt: new Date() }
  for (const k of SETTINGS_FIELDS) if (data[k] !== undefined) set[k] = data[k]
  await db.update(profileSettings).set(set).where(eq(profileSettings.id, 1))
  revalidatePath("/")
  revalidatePath("/admin")
  return { ok: true }
}

export async function savePost(data: {
  id?: number
  imageUrl: string
  caption: string
  locked: boolean
  photos: string
  videos: string
  likes: string
}) {
  await requireUser()
  const { id, ...values } = data
  if (id) {
    await db.update(posts).set(values).where(eq(posts.id, id))
  } else {
    await db.insert(posts).values(values)
  }
  revalidatePath("/")
  revalidatePath("/admin")
  return { ok: true }
}

export async function deletePost(id: number) {
  await requireUser()
  await db.delete(posts).where(eq(posts.id, id))
  revalidatePath("/")
  revalidatePath("/admin")
  return { ok: true }
}
