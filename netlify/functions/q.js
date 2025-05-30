const OpenAI = require("openai");

exports.handler = async (event) => {
  console.log("Handler invoked, genre:", event.queryStringParameters?.genre);
  console.log("OpenAI API key present:", !!process.env.OPENAI_API_KEY);

  const { genre } = event.queryStringParameters || {};
  if (genre !== "food") {
    return { statusCode: 400, body: "Unsupported genre" };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Generate a compact JSON array of 25 unique trivia questions about food. Each item:
{"question":"...", "hint":"...", "difficulty":"easy|medium|hard|very hard"}
Order array from easiest to hardest. Return ONLY the JSON array.
`;

  try {
    console.log("Sending OpenAI request");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });
    console.log("OpenAI response received");
    const jsonText = completion.choices[0].message.content;
    console.log("Parsing JSON of length", jsonText.length);
    const questions = JSON.parse(jsonText);
    console.log("Parsed questions count", questions.length);
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
