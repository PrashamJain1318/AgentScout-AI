import api from "./api";

/**
 * Fetch candidate applications list with filters & search.
 * @param {Object} params - { status, jobType, search, sort }
 */
export const getApplications = async (params = {}) => {
  const response = await api.get("/applications", { params });
  return response.data;
};

/**
 * Fetch application details by ID.
 * @param {string} id
 */
export const getApplication = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

/**
 * Create a new job application.
 * @param {Object} applicationData
 */
export const createApplication = async (applicationData) => {
  const response = await api.post("/applications", applicationData);
  return response.data;
};

/**
 * Update an existing application (status, notes, etc.).
 * @param {string} id
 * @param {Object} data
 */
export const updateApplication = async (id, data) => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};

/**
 * Delete an application by ID.
 * @param {string} id
 */
export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

/**
 * Fetch pipeline analytics statistics.
 */
export const getApplicationAnalytics = async () => {
  const response = await api.get("/applications/analytics");
  return response.data;
};
