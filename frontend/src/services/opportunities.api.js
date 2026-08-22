import api from "./api";

/**
 * Fetch paginated list of active opportunities with filter, search, location, and sort parameters.
 * @param {Object} params - { page, limit, search, type, remote, location, sort }
 */
export const getOpportunities = async (params = {}) => {
  const response = await api.get("/opportunities", { params });
  return response.data;
};

/**
 * Fetch personalized opportunity recommendations for the authenticated candidate user.
 * @param {Object} params - { page, limit }
 */
export const getRecommendedOpportunities = async (params = {}) => {
  const response = await api.get("/opportunities/recommended", { params });
  return response.data;
};

/**
 * AI-powered natural language opportunity search using backend Gemini engine.
 * @param {string} query - Natural language search prompt
 * @param {number} limit - Results limit (default 20)
 */
export const aiSearchOpportunities = async (query, limit = 20) => {
  const response = await api.post("/opportunities/ai-search", { query, limit });
  return response.data;
};

/**
 * Fetch details for a single opportunity by ID.
 * @param {string} id - Opportunity ObjectId
 */
export const getOpportunityById = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};
