import api from "./api";

/**
 * Fetch Overview Analytics metrics for candidate.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getAnalyticsOverview = async () => {
  const response = await api.get("/analytics/overview", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Application Pipeline & Funnel Analytics.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getApplicationAnalytics = async () => {
  const response = await api.get("/analytics/applications", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Match Intelligence & Score Distribution Analytics.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getMatchAnalytics = async () => {
  const response = await api.get("/analytics/matches", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Candidate Skill Strengths & Skill Gap Analytics.
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getSkillAnalytics = async () => {
  const response = await api.get("/analytics/skills", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Daily/Weekly Activity Timeline Analytics (last 30 days).
 * @returns {Promise<Object>} API response payload { data: {...} }
 */
export const getActivityAnalytics = async () => {
  const response = await api.get("/analytics/activity", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Actionable Data-Driven AI Career Insights.
 * @returns {Promise<Object>} API response payload { data: [...] }
 */
export const getCareerInsights = async () => {
  const response = await api.get("/analytics/insights", { withCredentials: true });
  return response.data;
};
