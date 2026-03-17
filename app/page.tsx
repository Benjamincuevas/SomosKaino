// Esta es la Landing Page — lo primero que ve un visitante en /
// Aquí van: hero, features, precios, CTA

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xl font-bold text-green-600">SomosKaino</span>
        <div className="flex gap-4">
          <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Empezar gratis
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <h1 className="text-5xl font-bold text-gray-900 max-w-2xl leading-tight">
          Cierra más ventas con{" "}
          <span className="text-green-600">IA en WhatsApp</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl">
          SomosKaino responde a tus leads automáticamente, los califica y te avisa
          cuando están listos para cerrar. Para agentes inmobiliarios.
        </p>
        <a
          href="/register"
          className="bg-green-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-green-700 transition"
        >
          Prueba gratis 14 días →
        </a>
      </section>

      {/* TODO: Agregar sección de features */}
      {/* TODO: Agregar sección de precios */}
      {/* TODO: Agregar footer */}

    </main>
  )
}
