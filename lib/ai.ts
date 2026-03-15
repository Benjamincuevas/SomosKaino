// Funciones de IA — Google Gemini vía @google/genai SDK

import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function generateReply({
  userMessage,
  systemPrompt,
  conversationHistory = [],
}: {
  userMessage: string
  systemPrompt: string
  conversationHistory?: { role: "user" | "assistant"; content: string }[]
}) {
  const contents = [
    ...conversationHistory.map((msg) => ({
      role:  msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ]

  const response = await ai.models.generateContent({
    model:    "gemini-2.5-flash",
    contents,
    config: { systemInstruction: systemPrompt },
  })

  return response.text ?? ""
}
