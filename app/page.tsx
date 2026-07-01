import { ProfileView } from "@/components/profile-view"
import { getSettings } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function Page() {
  const settings = await getSettings()
  return <ProfileView s={settings} />
}
