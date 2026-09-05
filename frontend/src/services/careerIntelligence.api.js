import api from "./api";

/**
 * Fetch complete Predictive Career Intelligence Overview
 */
export const getIntelligenceOverview = async () => {
  const response = await api.get("/career-intelligence", { withCredentials: true });
  return response.data;
};

/**
 * Fetch 7-Dimension Career Health Score
 */
export const getCareerHealth = async () => {
  const response = await api.get("/career-intelligence/health", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Skill Gap Intelligence
 */
export const getSkillIntelligence = async () => {
  const response = await api.get("/career-intelligence/skills", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Career Bottlenecks
 */
export const getCareerBottlenecks = async () => {
  const response = await api.get("/career-intelligence/bottlenecks", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Trajectory Forecasts
 */
export const getCareerForecasts = async () => {
  const response = await api.get("/career-intelligence/forecast", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Actionable AI Insights
 */
export const getCareerInsights = async () => {
  const response = await api.get("/career-intelligence/insights", { withCredentials: true });
  return response.data;
};

/**
 * Fetch Highest ROI Actions
 */
export const getActionROI = async () => {
  const response = await api.get("/career-intelligence/actions", { withCredentials: true });
  return response.data;
};

/**
 * Force recalculation of Predictive Intelligence Engine
 */
export const runIntelligenceAnalysis = async () => {
  const response = await api.post("/career-intelligence/analyze", {}, { withCredentials: true });
  return response.data;
};
