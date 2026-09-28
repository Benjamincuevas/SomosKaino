import Link from "next/link"
import { signUp } from "../actions"
import { CITIES } from "@/lib/catalog"
import FormMessage from "@/components/FormMessage"

export default function RegistroPage({ searchParams }: { searchParams: { error?: string; rol?: string } }) {
  const isPro = searchParams.rol === "profesional"

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>

        <div className="my-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
          <Link href="/registro?rol=cliente" className={`rounded-md py-2 text-center ${!isPro ? "bg-white shadow" : "text-gray-600"}`}>
            Necesito un servicio
          </Link>
          <Link href="/registro?rol=profesional" className={`rounded-md py-2 text-center ${isPro ? "bg-white shadow" : "text-gray-600"}`}>
            Soy profesional
          </Link>
        </div>

        <FormMessage error={searchParams.error} />

        <form action={signUp} className="space-y-4">
          <input type="hidden" name="role" value={isPro ? "profesional" : "cliente"} />
          <div>
            <label className="label" htmlFor="full_name">{isPro ? "Nombre o nombre de tu empresa" : "Nombre completo"}</label>
            <input className="input" id="full_name" name="full_name" required minLength={3} autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="phone">WhatsApp</label>
            <input className="input" id="phone" name="phone" type="tel" required placeholder="809-555-1234" autoComplete="tel" />
            <p className="mt-1 text-xs text-gray-500">Solo se comparte cuando aceptas un trabajo.</p>
          </div>
          <div>
            <label className="label" htmlFor="city">{isPro ? "Ciudad donde trabajas" : "Ciudad"}</label>
            <select className="input" id="city" name="city" required defaultValue="">
              <option value="" disabled>Elige una ciudad</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="email">Correo</label>
            <input className="input" id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input className="input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <button className="btn-primary w-full">{isPro ? "Registrarme como profesional" : "Crear cuenta"}</button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-brand-600">Entra</Link>
        </p>
      </div>
    </div>
  )
}
