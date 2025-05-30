const fetch = require('node-fetch');

exports.handler = async (event) => {
  const genre = event.queryStringParameters && event.queryStringParameters.genre;
  if (genre !== 'food') {
    return { statusCode: 400, body: 'Unsupported genre' };
  }

  const owner  = process.env.GITHUB_OWNER;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const path   = 'food-questions.json';
  const url    = 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/' + path;

  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      return {
        statusCode: res.status,
        body: 'Error fetching questions: ' + res.status
      };
    }
    const allQs = await res.json();

    // Group by difficulty
    const groups = { easy: [], medium: [], hard: [], 'very hard': [] };
    allQs.forEach(q => {
      const d = q.difficulty.toLowerCase();
      if (groups[d]) groups[d].push(q);
    });

    // Shuffle each group
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    shuffle(groups.easy);
    shuffle(groups.medium);
    shuffle(groups.hard);
    shuffle(groups['very hard']);

    // Concatenate in difficulty order
    const ordered = groups.easy.concat(groups.medium, groups.hard, groups['very hard']);

    // Take first 25
    const questions = ordered.slice(0, 25);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: 'Function error: ' + error.message
    };
  }
};
