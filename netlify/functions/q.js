const { Configuration, OpenAIApi } = require("openai");

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

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  // PROMPT: ask for exactly 20 items, compact JSON, no extra text
  const userPrompt = `
Generate exactly 20 unique trivia questions about ${genre}. Each item should be an object with the keys:
- "question": (the question text)
- "hint": (a one‐sentence hint)
- "difficulty": (one of "easy", "medium", "hard", or "very hard")

Return only the JSON array of exactly 20 objects, in ascending order of difficulty (all "easy" first, then "medium", etc.). Do NOT include any additional commentary or markdown—just the raw array.
`.trim();

  try {
    console.log("Sending OpenAI request");
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    const jsonText = completion.data.choices[0].message.content.trim();
    console.log("Raw OpenAI response (first 200 chars):", jsonText.substring(0, 200));

    let questions;
    try {
      questions = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Content:", jsonText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid JSON from OpenAI", detail: jsonText })
      };
    }

    console.log("Parsed questions count:", questions.length);

    // Safety: if GPT returns more than 20, slice down to 20
    if (questions.length > 20) {
      questions = questions.slice(0, 20);
      console.log("Sliced questions to 20 items");
    }

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
