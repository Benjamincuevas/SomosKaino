export default function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value)
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-accent-500" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-gray-300">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-gray-600">
        {count ? `${Number(value).toFixed(1)} (${count})` : "Sin reseñas"}
      </span>
    </span>
  )
}
