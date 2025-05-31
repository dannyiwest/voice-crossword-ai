const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

exports.handler = async (event) => {
  const genre = event.queryStringParameters && event.queryStringParameters.genre;
  const validGenres = ["food","entertainment","science","investing","mystery","sports"];

  if (!validGenres.includes(genre)) {
    return { statusCode: 400, body: "Unsupported genre" };
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return { statusCode: 500, body: "Server misconfiguration" };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = `
    You are a quiz-master. Provide a JSON array of 20 quiz questions about ${genre}.
    Each element must be an object with exactly these keys: "question", "answer", "difficulty", "hint".
    "difficulty" should be one of ["easy", "medium", "hard", "very hard"].
    The "hint" field should be a single-sentence hint. Output ONLY valid JSON.
  `;
  const userPrompt = `Generate 20 ${genre} trivia questions, ordered from easiest to hardest.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const text = response.choices[0].message.content;
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (err) {
      throw new Error("OpenAI returned invalid JSON");
    }

    if (!Array.isArray(questions)) {
      throw new Error("Expected an array of questions");
    }
    questions = questions.filter(q => q.question && q.answer && q.hint && q.difficulty);

    if (questions.length > 20) questions = questions.slice(0, 20);
    if (questions.length < 20) console.warn("Fewer than 20 questions returned");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questions)
    };
  } catch (openaiError) {
    console.error("OpenAI error:", openaiError);
    try {
      const filePath = path.join(__dirname, "..", `${genre}-questions.json`);
      const raw = fs.readFileSync(filePath, "utf-8");
      const fallbackQuestions = JSON.parse(raw);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackQuestions)
      };
    } catch (fsError) {
      console.error("Local JSON fallback failed:", fsError);
      return { statusCode: 500, body: "No questions available." };
    }
  }
};
