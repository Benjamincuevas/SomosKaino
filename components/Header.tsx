import Link from "next/link"
import { getCurrentProfile } from "@/lib/auth"
import { signOut } from "@/app/(auth)/actions"

export default async function Header() {
  const profile = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-700">
          Servi<span className="text-accent-500">Net</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {profile ? (
            <>
              {profile.role === "cliente" && (
                <Link href="/solicitar" className="btn-accent hidden sm:inline-flex">
                  Pedir un servicio
                </Link>
              )}
              {profile.role === "admin" && (
                <Link href="/admin" className="btn-outline">Admin</Link>
              )}
              <Link href="/panel" className="btn-outline">Mi panel</Link>
              {profile.role === "profesional" && (
                <Link href="/perfil" className="btn-outline hidden sm:inline-flex">Mi perfil</Link>
              )}
              <form action={signOut}>
                <button className="btn text-gray-600 hover:text-gray-900">Salir</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Entrar</Link>
              <Link href="/registro" className="btn-primary">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
