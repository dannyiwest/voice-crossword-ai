const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  if (genre !== "food") {
    return { statusCode: 400, body: "Unsupported genre" };
  }

  const owner  = process.env.GITHUB_OWNER;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const path   = "food-questions.json";
  const url    = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  let allQs;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    allQs = await res.json();
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }

  // Group by difficulty
  const groups = { easy: [], medium: [], hard: [], "very hard": [] };
  allQs.forEach(q => {
    const diff = q.difficulty.toLowerCase();
    if (groups[diff]) groups[diff].push(q);
  });

  // Shuffle each group
  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };
  Object.values(groups).forEach(shuffle);

  // Concatenate in difficulty order
  const ordered = [
    ...groups.easy,
    ...groups.medium,
    ...groups.hard,
    ...groups["very hard"]
  ];

  // Take first 25
  const questions = ordered.slice(0, 25);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questions)
  };
};
