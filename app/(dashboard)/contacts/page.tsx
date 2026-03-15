// Contactos — ruta: /contacts
// Lista de leads/contactos del CRM

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ContactsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) redirect("/login")

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, phone, notes, created_at, last_message_at")
    .eq("tenant_id", tenant.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  return (
    <div className="flex-1 overflow-auto p-6">
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
        <p className="text-gray-500 text-sm">Tus leads de WhatsApp</p>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-900 font-medium">Sin contactos todavía</p>
          <p className="text-gray-400 text-sm mt-1">
            Los contactos aparecerán cuando recibas mensajes de WhatsApp
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          {/* Header de tabla */}
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Contacto</span>
            <span>Teléfono</span>
            <span>Último mensaje</span>
            <span>Notas</span>
          </div>

          {contacts.map((contact, index) => {
            const displayName = contact.name ?? "Sin nombre"
            const lastMsg = contact.last_message_at
              ? new Date(contact.last_message_at).toLocaleDateString("es-MX", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—"

            return (
              <div
                key={contact.id}
                className={`grid grid-cols-4 px-5 py-4 items-center hover:bg-gray-50 transition ${
                  index !== contacts.length - 1 ? "border-b" : ""
                }`}
              >
                {/* Nombre con avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </span>
                </div>

                {/* Teléfono */}
                <span className="text-sm text-gray-500">{contact.phone}</span>

                {/* Último mensaje */}
                <span className="text-sm text-gray-400">{lastMsg}</span>

                {/* Notas + link a conversación */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-400 truncate">
                    {contact.notes ?? "—"}
                  </span>
                  <Link
                    href={`/inbox`}
                    className="text-xs text-green-600 hover:underline flex-shrink-0"
                  >
                    Ver chat →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}
