"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, ArrowRight, Zap } from "lucide-react"

// ── Left panel — brand section ──────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 bg-[#003d2e]">

      {/* Decorative blobs */}
      <div className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[350px] h-[350px] rounded-full bg-emerald-400/8 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Zap size={16} className="text-green-300" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-base tracking-tight">SomosKaino</span>
      </div>

      {/* Heading */}
      <div className="relative z-10 flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-white leading-[1.15] tracking-tight max-w-sm">
          Tu centro de comando para{" "}
          <span className="text-green-300">ventas por WhatsApp</span>
        </h1>
        <p className="text-green-200/60 text-base leading-relaxed max-w-xs">
          El agente IA que responde, califica y cierra ventas mientras tú duermes.
        </p>

        {/* Stats card */}
        <div className="mt-2 rounded-2xl p-5 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-xs font-semibold text-green-300/70 uppercase tracking-widest">Rendimiento hoy</p>
          <div className="flex flex-col gap-3">
            {[
              { label: "Mensajes respondidos", val: "98%", w: "w-[98%]" },
              { label: "Leads calificados",    val: "74%", w: "w-[74%]" },
              { label: "Tasa de conversión",   val: "41%", w: "w-[41%]" },
            ].map(({ label, val, w }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/60">{label}</span>
                  <span className="text-green-300 font-semibold">{val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-300 ${w}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-green-200/30 text-xs">© {new Date().getFullYear()} SomosKaino</p>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────
export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message.includes("Invalid login")
        ? "Email o contraseña incorrectos."
        : error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#faf9f7] px-6 py-12">
        <div className="w-full max-w-[420px] flex flex-col gap-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-200">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">SomosKaino</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-sm text-gray-500">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-[#008060] hover:bg-[#006b51] active:translate-y-px text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-900/10"
            >
              {loading ? "Ingresando..." : (<>Ingresar <ArrowRight size={15} /></>)}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-[#008060] font-semibold hover:text-[#006b51] transition-colors">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
