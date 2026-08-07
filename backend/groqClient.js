const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(messages) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL,
      messages: messages,
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}