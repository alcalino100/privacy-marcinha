import { db } from "@/lib/db"
import { profileSettings, posts } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

export type Settings = typeof profileSettings.$inferSelect
export type Post = typeof posts.$inferSelect

const DEFAULTS: Settings = {
  id: 1,
  name: "Marcinha Amorin",
  handle: "@marcinha_amorin",
  bio: "Oiie amores, sou a marcinha, sua loira rosada, a mais gostosa do site, quer ver mais sobre...faça sua assinatura agora mesmo!",
  avatarUrl: "/perfil.jpg",
  coverUrl: "/capa.jpg",
  lockedUrl: "/desfocada.jpg",
  price1m: "24.90",
  price3m: "59.90",
  price6m: "99.90",
  photos: "670",
  videos: "453",
  locked: "75",
  likes: "319.5K",
  posts: "646",
  media: "1.123",
  accent: "#f07040",
  accentDark: "#f5956a",
  bg: "#f0ebe4",
  subsLabel: "Assinaturas",
  promoLabel: "Promoções",
  label1m: "1 mês",
  label3m: "3 meses (20% off)",
  label6m: "6 meses (30% off)",
  postsLabel: "Postagens",
  mediaLabel: "Mídias",
  readMore: "Ler mais",
  instagram: null,
  x: null,
  tiktok: null,
  updatedAt: new Date(),
}

export async function getSettings(): Promise<Settings> {
  try {
    const rows = await db
      .select()
      .from(profileSettings)
      .where(eq(profileSettings.id, 1))
      .limit(1)
    return rows[0] ?? DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    return await db.select().from(posts).orderBy(asc(posts.sortOrder), asc(posts.id))
  } catch {
    return []
  }
}
