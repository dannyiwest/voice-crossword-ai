import { Configuration, OpenAIApi } from "openai";

export const handler = async (event) => {
  const { genre, step } = event.queryStringParameters;
  const levels = ['very easy','easy','medium','hard','very hard'];
  const level = levels[Math.min(levels.length-1, Math.floor((step-1)/3))];
  const prompt = `
Generate one crossword clue and answer in JSON.
Genre: ${genre}.
Difficulty: ${level}.
Reply only with: { "word": "answer", "clue": "your clue" }.
`;
  try {
    const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(config);
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const qa = JSON.parse(completion.data.choices[0].message.content);
    return { statusCode: 200, body: JSON.stringify(qa) };
  } catch (error) {
    console.error("OpenAI error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Generation failed" }) };
  }
};
