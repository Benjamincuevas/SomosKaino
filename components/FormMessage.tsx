// Muestra el ?error= o ?ok= que dejan las server actions al redirigir
export default function FormMessage({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
  }
  if (ok) {
    return <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{ok}</p>
  }
  return null
}
