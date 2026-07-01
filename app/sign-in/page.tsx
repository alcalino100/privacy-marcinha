import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AdminAuth } from "@/components/admin-auth"

export const dynamic = "force-dynamic"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")
  return <AdminAuth />
}
