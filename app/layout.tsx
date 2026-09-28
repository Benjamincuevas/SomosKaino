import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "ServiNet — Profesionales para tu hogar y negocio",
  description:
    "Pide plomeros, electricistas, albañiles, maestros constructores e ingenieros verificados en República Dominicana. Recibe cotizaciones y elige.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main>{children}</main>
        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
          ServiNet · Hecho en República Dominicana
        </footer>
      </body>
    </html>
  )
}
