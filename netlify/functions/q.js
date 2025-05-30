const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event) => {
  console.log("Handler invoked, genre:", event.queryStringParameters.genre);
  console.log("OpenAI API key present:", !!process.env.OPENAI_API_KEY);
  const { genre } = event.queryStringParameters || {};
  if (genre !== "food") {
    return { statusCode: 400, body: "Unsupported genre" };
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

  // Prompt to generate 25 tiered food questions with hints and difficulty
  const prompt = `
Generate a JSON array of 25 unique trivia questions about food. Each item should have:
- "question": the question text
- "hint": a helpful hint for the question
- "difficulty": one of "easy", "medium", "hard", or "very hard"
Ensure the array is ordered from easiest to hardest.
Return only the JSON array.
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    const jsonText = completion.data.choices[0].message.content;
    const questions = JSON.parse(jsonText);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questions)
    };
  } catch (err) {
    console.error("OpenAI error:", err);

    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
