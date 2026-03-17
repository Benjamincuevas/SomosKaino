"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SendLocationButton({ conversationId }: { conversationId: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const router = useRouter()

  async function handleSend() {
    setSending(true)
    const res = await fetch(`/api/conversations/${conversationId}/send-location`, {
      method: "POST",
    })
    if (res.ok) {
      setSent(true)
      router.refresh()
      setTimeout(() => setSent(false), 3000)
    }
    setSending(false)
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition-all duration-150 disabled:opacity-50 ${
        sent
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
      }`}
    >
      <MapPin size={15} className={sent ? "text-emerald-400" : "text-green-400"} />
      <span className={`text-xs font-medium ${sent ? "text-emerald-400" : "text-green-400"}`}>
        {sending ? "Enviando..." : sent ? "¡Ubicación enviada!" : "Enviar ubicación"}
      </span>
    </button>
  )
}
