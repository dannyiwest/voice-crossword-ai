import OpenAI from "openai";

export const handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  const prompt = `
provide 25 unique questions with increasing difficulty and be sure not to include any question that leads to the same answer for any of the 25 questions.
Genre: ${genre}.
Return strictly a JSON array of objects: { "word": "<answer>", "clue": "<clue>" }.
`;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-high",
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
