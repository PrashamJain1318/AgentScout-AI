import api from "./api";

/**
 * Send conversational user message to Career Copilot AI.
 * @param {string} message - User query or prompt
 * @returns {Promise<Object>} API response payload
 */
export const chatWithCopilot = async (message) => {
  const response = await api.post("/copilot/chat", { message }, { withCredentials: true });
  return response.data;
};

/**
 * Fetch candidate Skill Gap Analysis.
 * @returns {Promise<Object>} API response payload { skillGaps: [...] }
 */
export const getSkillGaps = async () => {
  const response = await api.get("/copilot/skill-gaps", { withCredentials: true });
  return response.data;
};

/**
 * Generate 30-Day Learning & Career Acceleration Roadmap.
 * @param {number} duration - Days count (default 30)
 * @returns {Promise<Object>} API response payload { roadmap: {...} }
 */
export const generateCareerRoadmap = async (duration = 30) => {
  const response = await api.post("/copilot/roadmap", { duration }, { withCredentials: true });
  return response.data;
};

/**
 * Generate Tailored Technical & Behavioral Interview Preparation Guide.
 * @param {string} opportunityId - Optional target opportunity ObjectId
 * @returns {Promise<Object>} API response payload { interviewPrep: {...} }
 */
export const generateInterviewPrep = async (opportunityId = null) => {
  const response = await api.post("/copilot/interview-prep", { opportunityId }, { withCredentials: true });
  return response.data;
};

/**
 * Fetch Candidate Profile Improvement Recommendations.
 * @returns {Promise<Object>} API response payload { improvement: {...} }
 */
export const getProfileImprovement = async () => {
  const response = await api.get("/copilot/profile-improvement", { withCredentials: true });
  return response.data;
};
