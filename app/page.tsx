import type { Metadata } from "next"
import { ProfileView } from "@/components/profile-view"
import { getSettings, getPosts } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: `${s.name} | Privacy`,
    description: s.bio,
    openGraph: {
      title: `${s.name} | Privacy`,
      description: s.bio,
      images: s.avatarUrl ? [{ url: s.avatarUrl }] : undefined,
    },
  }
}

export default async function Page() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()])
  return <ProfileView s={settings} posts={posts} />
}
