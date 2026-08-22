import api from "./api";

/**
 * Fetch candidate resume metadata and latest analysis.
 * @returns {Promise<Object>} API response payload { success: true, resume: {...} }
 */
export const getResume = async () => {
  const response = await api.get("/resume", { withCredentials: true });
  return response.data;
};

/**
 * Upload resume file (PDF or DOCX).
 * @param {FormData} formData - FormData containing 'resume' file
 * @returns {Promise<Object>} API response payload
 */
export const uploadResume = async (formData) => {
  const response = await api.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Trigger resume analysis.
 * @returns {Promise<Object>} API response payload
 */
export const analyzeResume = async () => {
  const response = await api.post("/resume/analyze", {}, { withCredentials: true });
  return response.data;
};

/**
 * Get latest resume analysis output.
 * @returns {Promise<Object>} API response payload { analysis: {...} }
 */
export const getResumeAnalysis = async () => {
  const response = await api.get("/resume/analysis", { withCredentials: true });
  return response.data;
};

/**
 * Trigger fresh reanalysis of uploaded resume.
 * @returns {Promise<Object>} API response payload
 */
export const reanalyzeResume = async () => {
  const response = await api.post("/resume/reanalyze", {}, { withCredentials: true });
  return response.data;
};

/**
 * Delete uploaded resume and metadata.
 * @returns {Promise<Object>} API response payload
 */
export const deleteResume = async () => {
  const response = await api.delete("/resume", { withCredentials: true });
  return response.data;
};

/**
 * Download uploaded resume file as Blob.
 * @returns {Promise<Blob>} File blob for download/viewing
 */
export const downloadResume = async () => {
  const response = await api.get("/resume/download", {
    responseType: "blob",
    withCredentials: true,
  });
  return response.data;
};

/**
 * Match resume fit against target opportunity.
 * @param {string} opportunityId - Target opportunity ObjectId
 * @returns {Promise<Object>} API response payload { analysis: {...} }
 */
export const matchResumeToOpportunity = async (opportunityId) => {
  const response = await api.post(`/resume/match/${opportunityId}`, {}, { withCredentials: true });
  return response.data;
};

/**
 * Update portfolio intelligence URLs.
 * @param {Object} data - { portfolioUrl, githubUrl, linkedinUrl, projectUrls }
 * @returns {Promise<Object>} API response payload
 */
export const updatePortfolio = async (data) => {
  const response = await api.put("/resume/portfolio", data, { withCredentials: true });
  return response.data;
};
