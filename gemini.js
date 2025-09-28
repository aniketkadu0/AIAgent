import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiEndpoint: "https://generativelanguage.googleapis.com/v1",
});

export async function askGemini(prompt) {
  for (let i = 0; i < 3; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // Try to extract JSON from any extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];

      return text;
    } catch (err) {
      console.error(`Gemini attempt ${i + 1} failed:`, err.message);
      if (i === 2) return '{"error": "Gemini API unavailable"}';
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
