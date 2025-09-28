import { bot } from "./bot.js";
import { writePatientData } from "./sheets.js";
import { askGemini } from "./gemini.js";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  bot.sendMessage(chatId, "🤖 Processing patient info...");

  try {
    const prompt = `
Extract patient details from this sentence in JSON format with these fields:
name, age, symptoms, medicine, bill, pending.
Sentence: "${userText}"
Return only valid JSON.
`;

    const aiResponse = await askGemini(prompt);

    let patientData;
    try {
      patientData = JSON.parse(aiResponse);

      // Basic validation
      if (!patientData.name || !patientData.age) {
        throw new Error("Missing required fields");
      }
    } catch (err) {
      return bot.sendMessage(
        chatId,
        "⚠️ Could not parse patient info. Please provide clearer info."
      );
    }

    await writePatientData(patientData);
    bot.sendMessage(chatId, `✅ Patient data added: ${patientData.name}`);
  } catch (err) {
    console.error("Error:", err.message);
    bot.sendMessage(
      chatId,
      "❌ Something went wrong while processing patient info."
    );
  }
});
