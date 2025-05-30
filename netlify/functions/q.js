const fetch = require('node-fetch');

// Fetch questions from public GitHub raw URL (no auth needed)
exports.handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  if (genre === "food") {
    const owner = process.env.GITHUB_OWNER;
    const repo  = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const path  = "food-questions.json";
    const url   = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        return { statusCode: res.status, body: `Error fetching questions: ${res.statusText}` };
      }
      const allQs = await res.json();
      // Shuffle questions
      for (let i = allQs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQs[i], allQs[j]] = [allQs[j], allQs[i]];
      }
      const questions = allQs.slice(0, 25);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questions)
      };
    } catch (err) {
      return { statusCode: 500, body: `Function error: ${err.message}` };
    }
  }
  return { statusCode: 400, body: "Unsupported genre" };
};
