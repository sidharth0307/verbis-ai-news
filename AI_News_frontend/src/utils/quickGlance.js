export const getQuickGlanceData = (articles, activeCategory) => {
  if (!articles || articles.length === 0) return null;

  // 1. Latest Entry
  const latest = articles[0];

  // 2. Trending: Randomly selected from the 5 most recent articles
  const top5 = articles.slice(0, Math.min(5, articles.length));
  const trending = top5[Math.floor(Math.random() * top5.length)];

  // 3. Primary AI Pick: Article with the most comprehensive summary
  const pool = articles.slice(0, 15);
  const aiPick = pool.reduce((best, a) => {
    if (!best || (a.summary?.length > (best.summary?.length || 0))) return a;
    return best;
  }, null);

  // 4. Secondary AI Pick: A different high-quality pick (e.g., specific category or length)
  // We filter out the primary aiPick so we don't duplicate
  const secondaryAiPick = pool
    .filter(a => a._id !== aiPick?._id)
    .find(a => a.title.length > 40) || articles[1];

  return { latest, aiPick, trending, secondaryAiPick };
};