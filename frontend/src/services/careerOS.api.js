import api from "./api";

/**
 * Fetch complete Candidate Career OS Snapshot.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getSnapshot = async () => {
  const response = await api.get("/career-os", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Career Score and Breakdown.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getScore = async () => {
  const response = await api.get("/career-os/score", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Readiness Matrix.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getReadiness = async () => {
  const response = await api.get("/career-os/readiness", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Next Best Action.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getNextAction = async () => {
  const response = await api.get("/career-os/next-action", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Candidate Career Risks.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getRisks = async () => {
  const response = await api.get("/career-os/risks", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Career Momentum score and trend.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getMomentum = async () => {
  const response = await api.get("/career-os/momentum", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Recent Platform Changes.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getChanges = async () => {
  const response = await api.get("/career-os/changes", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Prioritized Opportunities.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getOpportunities = async () => {
  const response = await api.get("/career-os/opportunities", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Executive AI Career Briefing.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getBriefing = async () => {
  const response = await api.get("/career-os/briefing", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Career Milestones.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getMilestones = async () => {
  const response = await api.get("/career-os/milestones", { withCredentials: true });
  return response.data;
};

/**
 * Rebuild and refresh Candidate Career OS Snapshot.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const refresh = async () => {
  const response = await api.post("/career-os/refresh", {}, { withCredentials: true });
  return response.data;
};
