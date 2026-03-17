// layout.tsx raíz: envuelve TODAS las páginas de la app
// Es como el "marco" que nunca cambia (fuentes, metadata, providers)

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Inter: fuente de Google, se carga de forma optimizada con Next.js
const inter = Inter({ subsets: ["latin"] })

// Metadata: lo que ve Google y las redes sociales
export const metadata: Metadata = {
  title: "SomosKaino - CRM con IA para WhatsApp",
  description: "Gestiona tus leads de bienes raíces con inteligencia artificial",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* children = el contenido de cada página */}
        {children}
      </body>
    </html>
  )
}
