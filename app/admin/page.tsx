import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getDashboard } from "@/app/actions/admin"
import { getSettings } from "@/lib/queries"
import { AdminDashboard } from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [{ orders, recentVisits, stats, posts, trend }, settings] = await Promise.all([
    getDashboard(),
    getSettings(),
  ])

  return (
    <AdminDashboard
      stats={stats}
      orders={orders as any}
      visits={recentVisits as any}
      settings={settings}
      posts={posts}
      trend={trend}
    />
  )
}
