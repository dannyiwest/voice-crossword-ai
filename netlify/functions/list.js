import OpenAI from "openai";

export const handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  const prompt = `
They were classified as easy, medium, difficult, hard: I am making a game, list 25 unique questions that increase with difficulty in the genre of ${genre}.`;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const arr = JSON.parse(response.choices[0].message.content);
    return { statusCode: 200, body: JSON.stringify(arr) };
  } catch (err) {
    console.error("OpenAI error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "List generation failed" }) };
  }
};