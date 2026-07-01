"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pixOrders, pageVisits, profileSettings } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
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

  return {
    orders,
    recentVisits,
    stats: {
      totalGenerated: totalGenerated ?? 0,
      totalPaid: totalPaid ?? 0,
      revenue: revenue ?? 0,
      totalVisits: totalVisits ?? 0,
      visitsToday: visitsToday ?? 0,
    },
  }
}

export async function saveSettings(data: Record<string, string>) {
  await requireUser()
  await db
    .update(profileSettings)
    .set({
      name: data.name,
      handle: data.handle,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      coverUrl: data.coverUrl,
      lockedUrl: data.lockedUrl,
      price1m: data.price1m,
      price3m: data.price3m,
      price6m: data.price6m,
      photos: data.photos,
      videos: data.videos,
      locked: data.locked,
      likes: data.likes,
      posts: data.posts,
      media: data.media,
      updatedAt: new Date(),
    })
    .where(eq(profileSettings.id, 1))
  revalidatePath("/")
  revalidatePath("/admin")
  return { ok: true }
}
