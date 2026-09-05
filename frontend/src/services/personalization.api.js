import api from "./api";

/**
 * Fetch full personalization data
 */
export const getPersonalization = async () => {
  const response = await api.get("/personalization", { withCredentials: true });
  return response.data;
};

/**
 * Fetch adaptive dashboard setup
 */
export const getAdaptiveDashboard = async () => {
  const response = await api.get("/personalization/dashboard", { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate career momentum details
 */
export const getMomentumScore = async () => {
  const response = await api.get("/personalization/momentum", { withCredentials: true });
  return response.data;
};

/**
 * Force recalculation of personalization state
 */
export const refreshPersonalization = async () => {
  const response = await api.post("/personalization/refresh", {}, { withCredentials: true });
  return response.data;
};

/**
 * Update layout or focus preferences
 */
export const updatePersonalizationPreferences = async (preferences) => {
  const response = await api.patch("/personalization/preferences", preferences, { withCredentials: true });
  return response.data;
};
