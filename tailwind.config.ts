import type { Config } from "tailwindcss"

const config: Config = {
  // darkMode: le dice a Tailwind cómo activar el modo oscuro
  darkMode: ["class"],
  // content: escanea estos archivos para generar solo el CSS que usas
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Aquí agregaremos colores y fuentes personalizadas de SomosKaino
      colors: {
        brand: {
          50:  "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          900: "#14532d",
        },
      },
    },
  },
  plugins: [],
}

export default config
