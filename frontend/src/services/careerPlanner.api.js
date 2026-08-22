import api from "./api";

/**
 * Fetch today's candidate action plan.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getTodayPlan = async () => {
  const response = await api.get("/career-planner/today", { withCredentials: true });
  return response.data;
};

/**
 * Fetch 7-day weekly candidate action plan.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getWeeklyPlan = async () => {
  const response = await api.get("/career-planner/week", { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate planner overview metrics.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getPlannerOverview = async () => {
  const response = await api.get("/career-planner/overview", { withCredentials: true });
  return response.data;
};

/**
 * Generate or force re-generation of candidate career action plan.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const generatePlan = async () => {
  const response = await api.post("/career-planner/generate", {}, { withCredentials: true });
  return response.data;
};

/**
 * Update state of a specific action item.
 * @param {string} actionId
 * @param {string} status - 'pending' | 'in_progress' | 'completed' | 'skipped'
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const updateAction = async (actionId, status = "completed") => {
  const response = await api.patch(`/career-planner/actions/${actionId}`, { status }, { withCredentials: true });
  return response.data;
};

/**
 * Mark a specific action item as completed.
 * @param {string} actionId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const completeAction = async (actionId) => {
  const response = await api.post(`/career-planner/actions/${actionId}/complete`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Mark a specific action item as skipped.
 * @param {string} actionId
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const skipAction = async (actionId) => {
  const response = await api.post(`/career-planner/actions/${actionId}/skip`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate milestone metrics.
 * @returns {Promise<Object>} API response payload { milestones: [...] }
 */
export const getMilestones = async () => {
  const response = await api.get("/career-planner/milestones", { withCredentials: true });
  return response.data;
};

/**
 * Refresh and recalculate active candidate action plan.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const refreshPlan = async () => {
  const response = await api.post("/career-planner/refresh", {}, { withCredentials: true });
  return response.data;
};
