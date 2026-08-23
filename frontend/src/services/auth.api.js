import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getConnectedAccounts = async () => {
  const response = await api.get("/auth/connected-accounts");
  return response.data;
};

export const disconnectProvider = async (provider) => {
  const response = await api.post(`/auth/disconnect/${provider}`);
  return response.data;
};
