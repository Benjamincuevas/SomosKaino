import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants").select("name").eq("owner_id", user.id).single()

  const tenantName = tenant?.name ?? "Mi cuenta"
  const email      = user.email ?? ""

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar tenantName={tenantName} email={email} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header name={tenantName} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
