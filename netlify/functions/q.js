const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { genre } = event.queryStringParameters || {};
  if (genre === "food") {
    const owner = process.env.GITHUB_OWNER;
    const repo  = process.env.GITHUB_REPO;
    const branches = process.env.GITHUB_BRANCH
      ? [process.env.GITHUB_BRANCH]
      : ['main', 'master'];
    let allQs;
    let lastStatus;
    let triedUrl;
    for (const branch of branches) {
      triedUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/food-questions.json`;
      console.log('Trying URL:', triedUrl);
      try {
        const res = await fetch(triedUrl);
        console.log('Response status from', branch, res.status);
        lastStatus = res.status;
        if (res.ok) {
          allQs = await res.json();
          console.log('Successfully fetched questions from branch', branch);
          break;
        }
      } catch (err) {
        console.log('Error fetching from', branch, err.message);
      }
    }
    if (!allQs) {
      console.error('Failed to fetch questions. Last status:', lastStatus, 'Tried URL:', triedUrl);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to fetch questions',
          lastStatus,
          triedUrl
        })
      };
    }
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
  }
  return { statusCode: 400, body: "Unsupported genre" };
};