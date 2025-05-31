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

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

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

    let questions = [];
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`Attempt ${attempt} to fetch questions`);
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 1500
      });
      const jsonText = completion.choices[0].message.content.trim();
      console.log("Raw OpenAI response (first 200 chars):", jsonText.substring(0, 200));
      try {
        questions = JSON.parse(jsonText);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr, "Content:", jsonText);
        questions = [];
      }
      if (questions.length >= 20) {
        break;
      }
      console.log(`Only parsed ${questions.length} questions, retrying...`);
      if (attempt === 2) {
        console.warn("Final attempt yielded fewer than 20 questions");
      }
    }
    console.log("Final parsed questions count:", questions.length);
    // Safety: ensure at most 20
    if (questions.length > 20) {
      questions = questions.slice(0, 20);
      console.log("Sliced questions to 20 items");
    }
    if (questions.length < 20) {
      console.warn("WARNING: returned fewer than 20 questions");
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questions)
    };
