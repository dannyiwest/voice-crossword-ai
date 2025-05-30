import OpenAI from "openai";

export const handler = async (event) => {
  const { genre, step } = event.queryStringParameters || {};
  // Map step → difficulty bucket
  const levels = ["very easy","easy","medium","hard","very hard"];
  const level = levels[Math.min(levels.length - 1, Math.floor((step - 1) / 3))];

  // Build your prompt
  const prompt = `
Generate a single crossword clue and answer in JSON.
Genre: ${genre}.
Difficulty: ${level}.
Reply strictly with JSON:
{ "word": "answer", "clue": "the spoken clue" }
`;

  try {
    // Instantiate the client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Call the chat completions endpoint
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    // Parse and return
    const qa = JSON.parse(response.choices[0].message.content);
    return {
      statusCode: 200,
      body: JSON.stringify(qa)
    };

  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Generation failed" })
    };
  }
};
