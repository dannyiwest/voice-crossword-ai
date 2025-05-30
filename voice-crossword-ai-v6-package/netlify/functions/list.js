import OpenAI from "openai";

export const handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  const prompt = `
Generate 50 unique crossword clues and their answers for the genre "${genre}", with increasing difficulty. 
Return a JSON array of objects: { "word": "<answer>", "clue": "<clue>" } only.
`;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const arr = JSON.parse(resp.choices[0].message.content);
    return { statusCode: 200, body: JSON.stringify(arr) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "List generation failed" }) };
  }
};