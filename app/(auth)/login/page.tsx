import Link from "next/link"
import { signIn } from "../actions"
import FormMessage from "@/components/FormMessage"

export default function LoginPage({ searchParams }: { searchParams: { error?: string; ok?: string; next?: string } }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold">Entrar a ServiNet</h1>
        <FormMessage error={searchParams.error} ok={searchParams.ok} />
        <form action={signIn} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? "/panel"} />
          <div>
            <label className="label" htmlFor="email">Correo</label>
            <input className="input" id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full">Entrar</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link href="/registro" className="font-semibold text-brand-600">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
