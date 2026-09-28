import Link from "next/link"
import { CATEGORIES } from "@/lib/catalog"

const GROUPS = [
  { key: "hogar", title: "Para tu hogar" },
  { key: "construccion", title: "Construcción y remodelación" },
  { key: "negocios", title: "Para negocios y proyectos grandes" },
] as const

const STEPS = [
  { n: "1", title: "Cuenta qué necesitas", text: "Describe el trabajo en un minuto: qué, dónde y para cuándo." },
  { n: "2", title: "Recibe cotizaciones", text: "Profesionales de tu zona te envían precio y fecha. Compara perfiles y reseñas." },
  { n: "3", title: "Elige y coordina", text: "Acepta la mejor oferta y hablan directo por WhatsApp. Al terminar, califica." },
]

const TRUST = [
  { title: "Profesionales verificados", text: "Revisamos cédula y referencias antes de darles la insignia de verificado." },
  { title: "Reseñas reales", text: "Solo quien contrató un trabajo por ServiNet puede calificarlo." },
  { title: "Tu número, protegido", text: "Tu teléfono solo se comparte con el profesional que elijas." },
]

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            El profesional que necesitas, <span className="text-accent-500">sin buscar tanto.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Plomeros, electricistas, albañiles, maestros constructores e ingenieros de toda
            República Dominicana. Pide una vez, recibe varias cotizaciones y elige.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/registro?rol=cliente" className="btn-accent px-6 py-3 text-base">
              Pedir un servicio
            </Link>
            <Link href="/registro?rol=profesional" className="btn border border-white/40 px-6 py-3 text-base text-white hover:bg-white/10">
              Soy profesional, quiero clientes
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">¿Qué necesitas?</h2>
        {GROUPS.map(g => (
          <div key={g.key} className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{g.title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.filter(c => c.group === g.key).map(c => (
                <Link
                  key={c.slug}
                  href={`/solicitar?categoria=${c.slug}`}
                  className="card flex items-center gap-3 !p-4 transition hover:border-brand-500 hover:shadow"
                >
                  <span className="text-2xl" aria-hidden>{c.icon}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Cómo funciona</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map(s => (
              <div key={s.n}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{s.n}</div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">Confianza primero</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TRUST.map(t => (
            <div key={t.title} className="card">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="card flex flex-col items-start justify-between gap-4 bg-brand-50 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">¿Eres técnico, maestro o ingeniero?</h2>
            <p className="text-sm text-gray-600">Recibe trabajos de tu zona y crea tu reputación con reseñas reales. Registrarse es gratis.</p>
          </div>
          <Link href="/registro?rol=profesional" className="btn-primary">Registrarme como profesional</Link>
        </div>
      </section>
    </>
  )
}
