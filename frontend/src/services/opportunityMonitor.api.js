import api from "./api";

/**
 * Fetch candidate Opportunity Monitor configuration.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getMonitor = async () => {
  const response = await api.get("/opportunity-monitor", { withCredentials: true });
  return response.data;
};

/**
 * Update candidate Opportunity Monitor preferences.
 * @param {Object} payload
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const updateMonitor = async (payload = {}) => {
  const response = await api.put("/opportunity-monitor", payload, { withCredentials: true });
  return response.data;
};

/**
 * Enable candidate Opportunity Monitor.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const startMonitor = async () => {
  const response = await api.post("/opportunity-monitor/start", {}, { withCredentials: true });
  return response.data;
};

/**
 * Pause candidate Opportunity Monitor.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const pauseMonitor = async () => {
  const response = await api.post("/opportunity-monitor/pause", {}, { withCredentials: true });
  return response.data;
};

/**
 * Manually trigger Opportunity Monitoring engine.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const runMonitor = async () => {
  const response = await api.post("/opportunity-monitor/run", {}, { withCredentials: true });
  return response.data;
};

/**
 * Fetch Opportunity Monitor status summary.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getStatus = async () => {
  const response = await api.get("/opportunity-monitor/status", { withCredentials: true });
  return response.data;
};

/**
 * Fetch ranked candidate opportunity recommendations.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getRecommendations = async () => {
  const response = await api.get("/opportunity-monitor/recommendations", { withCredentials: true });
  return response.data;
};

/**
 * Fetch newly detected candidate opportunities.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getNewOpportunities = async () => {
  const response = await api.get("/opportunity-monitor/new", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Opportunity Monitor digest.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getDigest = async () => {
  const response = await api.get("/opportunity-monitor/digest", { withCredentials: true });
  return response.data;
};

/**
 * Add opportunity to candidate watchlist.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload
 */
export const watchOpportunity = async (opportunityId) => {
  const response = await api.post(`/opportunity-monitor/${opportunityId}/watch`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Remove opportunity from candidate watchlist.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload
 */
export const unwatchOpportunity = async (opportunityId) => {
  const response = await api.delete(`/opportunity-monitor/${opportunityId}/watch`, { withCredentials: true });
  return response.data;
};

/**
 * Dismiss opportunity from candidate recommendations.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload
 */
export const dismissOpportunity = async (opportunityId) => {
  const response = await api.post(`/opportunity-monitor/${opportunityId}/dismiss`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Mark opportunity as viewed.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload
 */
export const markOpportunityViewed = async (opportunityId) => {
  const response = await api.post(`/opportunity-monitor/${opportunityId}/view`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Fetch data-driven AI fit explanation for opportunity.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const explainOpportunity = async (opportunityId) => {
  const response = await api.get(`/opportunity-monitor/${opportunityId}/explain`, { withCredentials: true });
  return response.data;
};
