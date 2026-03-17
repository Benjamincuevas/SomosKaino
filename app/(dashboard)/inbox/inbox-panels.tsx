"use client"

import { usePathname } from "next/navigation"

export default function InboxPanels({
  sidebar,
  children,
}: {
  sidebar:  React.ReactNode
  children: React.ReactNode
}) {
  const pathname        = usePathname()
  const inConversation  = pathname.startsWith("/inbox/")

  return (
    <div className="h-full flex overflow-hidden">
      {/* Lista de chats — oculta en mobile cuando hay conversación abierta */}
      <div className={`
        ${inConversation ? "hidden md:flex" : "flex"}
        w-full md:w-80 shrink-0 border-r border-slate-800/60 flex-col bg-slate-900/50 overflow-hidden
      `}>
        {sidebar}
      </div>

      {/* Conversación — oculta en mobile cuando solo hay lista */}
      <div className={`
        ${!inConversation ? "hidden md:flex" : "flex"}
        flex-1 overflow-hidden
      `}>
        {children}
      </div>
    </div>
  )
}
