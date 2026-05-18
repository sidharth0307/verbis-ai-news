import api from "./axios";

export const loginUser = (data) => api.post("/users/login", data);

export const logoutUser = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
};

export const forgotPassword = async (email) => {
  const response = await api.post("/users/forgot-password", { email });
  return response.data;
}

export const verifyResetCode = async (email, otp) => {
  const response = await api.post("/users/verify-reset-code", { email, otp });
  return response.data;
}

export const resetPassword = async (email, newPassword) => {
  const response = await api.post("/users/reset-password", { email, newPassword });
  return response.data;
}

export const registerUser = (data) => api.post("/users/register", data);

export const verifyOTP = (data) => api.post("/users/verify-otp", data);

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