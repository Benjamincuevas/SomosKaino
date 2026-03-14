// Funciones de IA — genera respuestas usando Google Gemini
// Usa el nuevo SDK @google/genai (reemplazo oficial de @google/generative-ai)

import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// Genera una respuesta automática para un mensaje de WhatsApp
export async function generateReply({
  userMessage,
  systemPrompt,
  conversationHistory = [],
}: {
  userMessage: string
  systemPrompt: string
  conversationHistory?: { role: "user" | "assistant"; content: string }[]
}) {
  // Construir el historial en el formato que espera el nuevo SDK
  const contents = [
    // Historial previo de la conversación
    ...conversationHistory.map((msg) => ({
      role:  msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    // Mensaje actual del contacto
    { role: "user", parts: [{ text: userMessage }] },
  ]

  const response = await ai.models.generateContent({
    model:    "gemini-2.0-flash-lite",
    contents,
    config: {
      systemInstruction: systemPrompt,
    },
  })

  return response.text ?? ""
}
