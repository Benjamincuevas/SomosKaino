import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p className="mt-2 text-gray-600">Puede que no exista o que no tengas acceso.</p>
      <Link href="/" className="btn-primary mt-6">Ir al inicio</Link>
    </div>
  )
}
