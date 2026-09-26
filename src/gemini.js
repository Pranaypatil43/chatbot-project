const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are a sharp, warm, and helpful AI assistant. 

FORMAT YOUR RESPONSES like this when giving structured answers:
- Start with a short 1-2 sentence intro.
- Use numbered sections like "01. Section Title" followed by a brief description on the next line.
- Use bullet points (- item) for lists inside sections.
- Use **bold** for key terms and *italic* for emphasis.
- End with a short follow-up question or offer to go deeper.

Keep responses concise and scannable. Use emojis sparingly.
If the question is simple and conversational, just reply naturally — no need for sections.`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function getGeminiResponse(userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      }),
    });

    // Retry on 503 (overloaded) or 429 (rate limit)
    if ((res.status === 503 || res.status === 429) && attempt < retries) {
      await sleep(1500 * attempt); // 1.5s, 3s
      continue;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text
      ?? 'Sorry, I could not generate a response. Please try again.';
  }

  throw new Error('Service is temporarily unavailable. Please try again in a moment.');
}
