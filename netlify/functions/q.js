import OpenAI from "openai";

export const handler = async (event) => {
  const { genre, step } = event.queryStringParameters || {};
  const levels = ["very easy","easy","medium","hard","very hard"];
  const lvl = levels[Math.min(levels.length - 1, Math.floor((step - 1) / 3))];
  const prompt = `
Generate a single crossword clue and answer in JSON.
Genre: ${genre}.
Difficulty: ${lvl}.
Reply only with JSON: { "word": "answer", "clue": "your clue" }.
`;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const qa = JSON.parse(response.choices[0].message.content);
    return { statusCode: 200, body: JSON.stringify(qa) };
  } catch (error) {
    console.error("OpenAI error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
