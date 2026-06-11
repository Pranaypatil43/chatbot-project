import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getGroqResponse(userMessage) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a warm, friendly, and caring AI assistant. 
        When someone shares how they feel (tired, lazy, sad, stressed, etc.), respond with empathy first, then give practical and encouraging tips to help them feel better.
        Keep responses concise, positive, and easy to read. Use emojis occasionally to make it feel friendly and warm.
        Format tips as short bullet points when listing suggestions.`
      },
      { role: 'user', content: userMessage }
    ]
  });
  return response.choices[0].message.content;
}
