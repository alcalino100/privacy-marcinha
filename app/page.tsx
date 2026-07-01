import { ProfileView } from "@/components/profile-view"
import { getSettings, getPosts } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()])
  return <ProfileView s={settings} posts={posts} />
}
