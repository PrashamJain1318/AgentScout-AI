import api from "./api";

/**
 * Fetch complete Career Intelligence Overview (Health, Highlights, Feed, Events)
 */
export const getOverview = async () => {
  const response = await api.get("/career-intelligence/overview", { withCredentials: true });
  return response.data;
};

export const getIntelligenceOverview = getOverview;

/**
 * Fetch 7-Category Career Health Score & Breakdown
 */
export const getCareerHealth = async () => {
  const response = await api.get("/career-intelligence/health", { withCredentials: true });
  return response.data;
};

/**
 * Fetch ranked AI Intelligence Feed items
 */
export const getIntelligenceFeed = async (params = {}) => {
  const response = await api.get("/career-intelligence/feed", {
    params,
    withCredentials: true
  });
  return response.data;
};

/**
 * Fetch candidate timeline events
 */
export const getCareerEvents = async (params = {}) => {
  const response = await api.get("/career-intelligence/events", {
    params,
    withCredentials: true
  });
  return response.data;
};

/**
 * Mark a timeline event as read
 */
export const markEventRead = async (eventId) => {
  const response = await api.patch(`/career-intelligence/events/${eventId}/read`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Archive a timeline event
 */
export const archiveEvent = async (eventId) => {
  const response = await api.patch(`/career-intelligence/events/${eventId}/archive`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Force manual recalculation of Career Intelligence
 */
export const refreshIntelligence = async () => {
  const response = await api.post("/career-intelligence/refresh", {}, { withCredentials: true });
  return response.data;
};

export const runIntelligenceAnalysis = refreshIntelligence;
