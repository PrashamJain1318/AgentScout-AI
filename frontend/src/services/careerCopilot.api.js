import api from "./api";

export const getCareerCopilotPlan = async (params = {}) => {
  const response = await api.get("/career-copilot", { params });
  return response.data;
};
