const OpenAI = require("openai");

exports.handler = async (event) => {
  const genre = event.queryStringParameters && event.queryStringParameters.genre;
  console.log("Handler invoked, genre:", genre);
  if (genre !== "food") {
    return { statusCode: 400, body: "Unsupported genre" };
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return { statusCode: 500, body: "Server misconfiguration" };
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
Generate a JSON array of 25 unique trivia questions about ${genre}. 
Each item should have:
- "question": the question
- "hint": a helpful hint
- "difficulty": one of "easy", "medium", "hard", or "very hard"
Order the array from easiest to hardest. Return only the JSON array.
`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });
    const jsonText = completion.choices[0].message.content.trim();
    console.log("OpenAI response:", jsonText.substring(0,100));
    const questions = JSON.parse(jsonText);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questions)
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
