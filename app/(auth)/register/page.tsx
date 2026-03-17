"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, Building2, Mail, Lock, ArrowRight, Zap, Check } from "lucide-react"

const FEATURES = [
  "Bandeja de WhatsApp con IA integrada",
  "CRM de leads y contactos",
  "Catálogo de productos con envío automático",
  "Alertas de handover en tiempo real",
]

// ── Left panel — brand section ──────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 bg-[#003d2e]">

      {/* Decorative blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-emerald-400/8 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Zap size={16} className="text-green-300" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-base tracking-tight">SomosKaino</span>
      </div>

      {/* Heading + features */}
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-white leading-[1.15] tracking-tight max-w-sm">
            Vende más con{" "}
            <span className="text-green-300">cada conversación</span>
          </h1>
          <p className="text-green-200/60 text-base leading-relaxed max-w-xs">
            Activa tu agente de IA en minutos y empieza a convertir chats en ventas.
          </p>
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center shrink-0">
                <Check size={11} className="text-green-300" strokeWidth={2.5} />
              </div>
              <span className="text-white/70 text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* Pricing hint card */}
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-0.5">Plan mensual</p>
            <p className="text-white font-bold text-lg">$49 USD<span className="text-white/40 text-sm font-normal">/mes</span></p>
          </div>
          <span className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            Sin tarjeta requerida
          </span>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-green-200/30 text-xs">© {new Date().getFullYear()} SomosKaino</p>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────
export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [name,            setName]            = useState("")
  const [company,         setCompany]         = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, company },
      },
    })

    if (error) {
      setError(error.message.includes("already registered")
        ? "Este email ya está registrado. ¿Quieres iniciar sesión?"
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
        <div className="w-full max-w-[420px] flex flex-col gap-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-200">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">SomosKaino</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Crea tu cuenta</h2>
            <p className="text-sm text-gray-500">Empieza sin tarjeta de crédito</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name + Company row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Nombre</label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Empresa</label>
                <div className="relative">
                  <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tu negocio"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Correo electrónico</label>
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

            {/* Password + Confirm row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Contraseña</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Confirmar</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Repite la clave"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-[#008060] hover:bg-[#006b51] active:translate-y-px text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-900/10"
            >
              {loading ? "Creando cuenta..." : (<>Crear cuenta <ArrowRight size={15} /></>)}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-[#008060] font-semibold hover:text-[#006b51] transition-colors">
                Inicia sesión
              </a>
            </p>
            <p className="text-xs text-gray-400">
              Al registrarte aceptas nuestros{" "}
              <a href="#" className="underline hover:text-gray-600 transition-colors">Términos</a>
              {" "}y{" "}
              <a href="#" className="underline hover:text-gray-600 transition-colors">Política de privacidad</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
