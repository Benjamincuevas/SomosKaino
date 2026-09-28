import { createClient as createBrowserSupabase } from "@/lib/supabase/client"

export const MAX_FILE_BYTES = 5 * 1024 * 1024

// Sube un archivo a <bucket>/<uid>/<aleatorio>.<ext> y devuelve la ruta
export async function uploadToOwnFolder(bucket: "solicitudes" | "verificaciones", userId: string, file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" pesa más de 5 MB`)
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const supabase = createBrowserSupabase()
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw new Error(`No pudimos subir "${file.name}"`)
  return path
}
