import api from "./api";

/**
 * Start a new AI Mock Interview session.
 * @param {Object} payload - { opportunityId, interviewType, difficulty, questionCount }
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const startInterview = async (payload = {}) => {
  const response = await api.post("/interviews/start", payload, { withCredentials: true });
  return response.data;
};

/**
 * Submit candidate answer for current interview question.
 * @param {string} sessionId
 * @param {string} answer
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const submitAnswer = async (sessionId, answer = "") => {
  const response = await api.post(`/interviews/${sessionId}/answer`, { answer }, { withCredentials: true });
  return response.data;
};

/**
 * Complete mock interview session and compute overall scores.
 * @param {string} sessionId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const completeInterview = async (sessionId) => {
  const response = await api.post(`/interviews/${sessionId}/complete`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate mock interview history.
 * @returns {Promise<Object>} API response payload { history: [...] }
 */
export const getInterviewHistory = async () => {
  const response = await api.get("/interviews/history", { withCredentials: true });
  return response.data;
};

/**
 * Fetch single interview session details.
 * @param {string} sessionId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getInterviewSession = async (sessionId) => {
  const response = await api.get(`/interviews/${sessionId}`, { withCredentials: true });
  return response.data;
};

/**
 * Delete an interview session.
 * @param {string} sessionId
 * @returns {Promise<Object>} API response payload
 */
export const deleteInterview = async (sessionId) => {
  const response = await api.delete(`/interviews/${sessionId}`, { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate interview readiness metrics.
 * @param {string} [opportunityId]
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getInterviewReadiness = async (opportunityId = "") => {
  const url = opportunityId ? `/interviews/readiness/${opportunityId}` : "/interviews/readiness";
  const response = await api.get(url, { withCredentials: true });
  return response.data;
};
