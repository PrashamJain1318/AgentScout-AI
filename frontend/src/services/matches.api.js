import api from "./api";

/**
 * Fetch all candidate opportunity match results with filters.
 * @param {Object} params - { search, location, jobType, workMode, minScore, sort, page, limit }
 */
export const getMatches = async (params = {}) => {
  const response = await api.get("/matches", { params });
  return response.data;
};

/**
 * Fetch single match by ID.
 * @param {string} id
 */
export const getMatch = async (id) => {
  const response = await api.get(`/matches/${id}`);
  return response.data;
};

/**
 * Fetch match analytics and KPI statistics.
 */
export const getMatchAnalytics = async () => {
  const response = await api.get("/matches/analytics");
  return response.data;
};

/**
 * Trigger automatic match generation engine for current candidate.
 * @param {Object} payload - { limit }
 */
export const generateMatches = async (payload = {}) => {
  const response = await api.post("/matches/generate", payload);
  return response.data;
};

/**
 * Generate or fetch AI match explanation for a specific match result using Gemini.
 * @param {string} matchId - Match ObjectId
 * @param {boolean} refresh - Force fresh Gemini generation
 */
export const explainMatch = async (matchId, refresh = false) => {
  const url = `/matches/${matchId}/explain${refresh ? "?refresh=true" : ""}`;
  const response = await api.post(url);
  return response.data;
};
