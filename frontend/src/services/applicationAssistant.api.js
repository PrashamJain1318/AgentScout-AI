import api from "./api";

/**
 * Trigger analysis of candidate readiness for an opportunity.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const analyzeOpportunityReadiness = async (opportunityId) => {
  const response = await api.post(`/application-assistant/analyze/${opportunityId}`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Get Application Assistant state for an opportunity.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getAssistantByOpportunity = async (opportunityId) => {
  const response = await api.get(`/application-assistant/${opportunityId}`, { withCredentials: true });
  return response.data;
};

/**
 * Generate tailored cover letter.
 * @param {string} opportunityId
 * @param {Object} data - { tone, length }
 * @returns {Promise<Object>} API response payload { coverLetter: {...} }
 */
export const generateCoverLetter = async (opportunityId, data = {}) => {
  const response = await api.post(`/application-assistant/${opportunityId}/cover-letter`, data, { withCredentials: true });
  return response.data;
};

/**
 * Generate job-specific application answers.
 * @param {string} opportunityId
 * @param {Object} data - { questions }
 * @returns {Promise<Object>} API response payload { applicationAnswers: [...] }
 */
export const generateApplicationAnswers = async (opportunityId, data = {}) => {
  const response = await api.post(`/application-assistant/${opportunityId}/answers`, data, { withCredentials: true });
  return response.data;
};

/**
 * Generate data-driven application strategy.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload { applicationStrategy: {...} }
 */
export const generateApplicationStrategy = async (opportunityId) => {
  const response = await api.post(`/application-assistant/${opportunityId}/strategy`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Update candidate preparation checklist.
 * @param {string} opportunityId
 * @param {Array} checklist
 * @returns {Promise<Object>} API response payload { checklist: [...] }
 */
export const updateChecklist = async (opportunityId, checklist) => {
  const response = await api.patch(`/application-assistant/${opportunityId}/checklist`, { checklist }, { withCredentials: true });
  return response.data;
};

/**
 * Reset Application Assistant state for an opportunity.
 * @param {string} opportunityId
 * @returns {Promise<Object>} API response payload
 */
export const deleteAssistant = async (opportunityId) => {
  const response = await api.delete(`/application-assistant/${opportunityId}`, { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate asset preparation history.
 * @returns {Promise<Object>} API response payload { history: [...] }
 */
export const getAssetHistory = async () => {
  const response = await api.get("/application-assistant/history", { withCredentials: true });
  return response.data;
};
