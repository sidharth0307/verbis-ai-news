export const getSEOImageUrl = (article) => {
  // If no slug exists (old article), return the original URL directly
  if (!article?.slug) return article?.bannerImage;
  
  // If slug exists, use the professional SEO proxy path
  return `/api/articles/image-proxy/${article.slug}/${article.slug}.jpg`;
};