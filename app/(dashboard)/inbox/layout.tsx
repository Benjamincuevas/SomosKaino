import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InboxList   from "./inbox-list"
import InboxPanels from "./inbox-panels"

export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants").select("id").eq("owner_id", user.id).single()
  if (!tenant) redirect("/login")

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, status, ai_paused, updated_at, deleted_at, contacts ( id, name, phone ), messages ( content, direction, sent_by_ai, created_at )")
    .eq("tenant_id", tenant.id)
    .order("updated_at", { ascending: false })

  return (
    <InboxPanels
      sidebar={
        <InboxList
          initialConversations={(conversations ?? []) as any}
          tenantId={tenant.id}
        />
      }
    >
      {children}
    </InboxPanels>
  )
}
