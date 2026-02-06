import api from "./axios";

export const loginUser = (data) => api.post("/users/login", data);

export const logoutUser = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
};

export const registerUser = (data) => api.post("/users/register", data);

export const getMe = async () => {
  const { data } = await api.get("/profile/me");
  return data;
};

export const getSavedArticles = async () => {
  const { data } = await api.get("/users/saved-articles");
  return data.articles;
};

export const getUserInteractions = async () => {
  const { data } = await api.get("/users/interactions");
  return data; // { likedArticleIds: [], savedArticleIds: [] }
}