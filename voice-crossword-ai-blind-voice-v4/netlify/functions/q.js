import fetch from 'node-fetch';
export const handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  if (genre === "food") {
    const owner = process.env.GITHUB_OWNER;
    const repo  = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const path  = "food-questions.json";
    const url   = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3.raw",
        "Authorization": `token ${process.env.GITHUB_TOKEN}`
      }
    });
    if (!res.ok) {
      return { statusCode: res.status, body: `GitHub API error: ${await res.text()}` };
    }
    const allQs = await res.json();
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
  }
  // Fallback to other genres or error
  return { statusCode: 400, body: "Unsupported genre" };
};
