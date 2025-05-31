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
  const userPrompt = "Generate exactly 25 unique trivia questions about " + genre + 
    ". Each item should be an object with keys: \"question\", \"hint\", \"difficulty\" (easy, medium, hard, very hard). " +
    "Order the array from easiest to hardest. Return only the JSON array with exactly 25 objects, no extra text.";

  try {
    console.log("Sending OpenAI request");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 1500
    });
    console.log("OpenAI response received");
    const jsonText = completion.choices[0].message.content.trim();
    console.log("Parsing JSON of length", jsonText.length);
    let questions;
    try {
      questions = JSON.parse(jsonText);
      console.log("Parsed questions count", questions.length);
    } catch (e) {
      console.error("JSON parse error:", e, "Content:", jsonText);
      return {
        statusCode: 500,
        body: "Invalid JSON"
      };
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
