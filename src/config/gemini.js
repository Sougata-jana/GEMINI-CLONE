//node-version # Should be 18
// npm install @google/generative-ai
import {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-pro";

// Prefer env var, fallback to placeholder (user must set real key in .env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "REPLACE_WITH_KEY";

async function runChat(prompt) {
	if (!prompt || !prompt.trim()) return "";
	const genAI = new GoogleGenerativeAI(API_KEY);
	const model = genAI.getGenerativeModel({ model: MODEL_NAME });

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 4096, // allow longer answers
	};
	const safetySettings = [
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
		},
	];

	const chat = model.startChat({ generationConfig, safetySettings, history: [] });

	let fullText = "";
	let loops = 0;
	let result = await chat.sendMessage(prompt);
	while (true) {
		const response = result.response;
		const piece = response.text() || "";
		const finish = response?.candidates?.[0]?.finishReason;
		fullText += (fullText && piece ? "\n" : "") + piece;
		console.log(`[Gemini] chunk finishReason=${finish} length=${piece.length}`);
		if (finish !== 'MAX_TOKENS' || loops >= 2) break; // stop after a few continuations
		loops++;
		// Ask to continue
		result = await chat.sendMessage("Continue.");
	}
	console.log('[Gemini] full length', fullText.length);
	return fullText;
}

export default runChat;