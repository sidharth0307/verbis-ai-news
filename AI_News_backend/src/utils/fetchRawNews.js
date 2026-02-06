const axios = require("axios");

// 1. Define the mapping for standard GNews "Top Headlines" topics
const GNEWS_TOPICS = [
  "general", "world", "nation", "business", "technology", 
  "entertainment", "sports", "science", "health"
];

exports.fetchRawNews = async (category) => {
  try {
    const normalizedCategory = category.toLowerCase();
    let url = "https://gnews.io/api/v4/top-headlines";
    let params = {
      token: process.env.GNEWS_API_KEY,
      lang: "en",
      max: 10
    };

    // 2. Logic: Use Headlines for broad topics, Search for specific ones
    if (GNEWS_TOPICS.includes(normalizedCategory)) {
      params.category = normalizedCategory;
    } else {
      // Switch to Search endpoint for categories GNews doesn't have in 'Headlines'
      url = "https://gnews.io/api/v4/search";
      params.q = category; // Search for "Politics", "Lifestyle", etc.
      params.sortBy = "publishedAt"; // Get the freshest news
    }

    const response = await axios.get(url, { params });
    
    console.log(` Fetching from GNews: ${url} | Topic/Query: ${params.category || params.q}`);
    
    return response.data.articles || [];
  } catch (err) {
    console.error(` GNews Fetch Error (${category}):`, err.response?.data?.errors || err.message);
    return [];
  }
};