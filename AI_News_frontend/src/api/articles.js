import api from "./axios";

// --- ADMIN & MANAGEMENT ---

export const createArticleAI = async (articleData, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await api.post("/articles/admin/create", articleData, { headers });
  return data;
};

export const updateArticle = async (id, articleData, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await api.put(`/articles/admin/update/${id}`, articleData, { headers });
  return data;
};

export const deleteArticle = async (id, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await api.delete(`/articles/admin/delete/${id}`, { headers });
  return data;
};

// --- PUBLIC FEEDS ---

export const getArticles = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/articles?page=${page}&limit=${limit}`);
  return data;
};

/**
 * NEW: Fetches articles for a specific Silo
 * Matches: /api/articles/:category
 */
export const getArticlesByCategory = async (categorySlug, page = 1, limit = 10) => {
  const { data } = await api.get(`/articles/${categorySlug}?page=${page}&limit=${limit}`);
  return data;
};

/**
 * NEW: Fetches a single article using the Nested Silo path
 * Matches: /api/articles/:category/:slug
 */
export const getArticleBySlug = (category, slug) => {
  return api.get(`/articles/${category}/${slug}`);
};

/**
 * UPDATED: Hybrid lookup (ID or Slug) via specific path
 * Matches: /api/articles/v/id/:id
 */
export const getArticleById = (id) => {
  return api.get(`/articles/v/id/${id}`);
};

/**
 * Fetches silos from the Category module
 */
export const getCategories = async() => {
  const { data } = await api.get(`/categories/active`);
  return data;
}

// --- SEARCH & INTERACTIONS ---

export const searchArticles = async (query, page = 1, limit = 10) => {
  const response = await api.get(`/articles/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return response.data;
};

export const likeArticle = (id) => api.post(`/articles/${id}/like`);

// Accept parentId as an optional second argument
export const commentArticle = (id, text, parentId = null) => 
  api.post(`/articles/${id}/comment`, { 
    comment: text, 
    parentId: parentId // This tells the backend if it's a reply
  });

// Toggle like on a specific comment
export const likeComment = (articleId, commentId) => 
api.patch(`/articles/${articleId}/comments/${commentId}/like`);

// Delete a specific comment
export const deleteComment = (articleId, commentId) => 
  api.delete(`/articles/${articleId}/comments/${commentId}`);

// Utility for saving to user profile (ensure this matches your user/article controller)
export const saveArticle = (id) => api.post(`/users/save/${id}`);

//track article view count
export const trackArticleView = (slug) => 
  api.patch(`/articles/track-view/${slug}`);