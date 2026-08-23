import api from './api';

export const getAgentState = async () => {
  const response = await api.get('/career-agent', { withCredentials: true });
  return response.data;
};

export const getAgentContext = async () => {
  const response = await api.get('/career-agent/context', { withCredentials: true });
  return response.data;
};

export const getNextAction = async () => {
  const response = await api.get('/career-agent/next-action', { withCredentials: true });
  return response.data;
};

export const runAgent = async () => {
  const response = await api.post('/career-agent/run', {}, { withCredentials: true });
  return response.data;
};

export const refreshAgent = async () => {
  const response = await api.post('/career-agent/refresh', {}, { withCredentials: true });
  return response.data;
};

export const getAgentActivity = async () => {
  const response = await api.get('/career-agent/activity', { withCredentials: true });
  return response.data;
};

export const getAgentMemory = async () => {
  const response = await api.get('/career-agent/memory', { withCredentials: true });
  return response.data;
};

export const deleteAgentMemory = async (memoryId) => {
  const response = await api.delete(`/career-agent/memory/${memoryId}`, { withCredentials: true });
  return response.data;
};

export const approveAction = async (actionId) => {
  const response = await api.post(`/career-agent/actions/${actionId}/approve`, {}, { withCredentials: true });
  return response.data;
};

export const rejectAction = async (actionId) => {
  const response = await api.post(`/career-agent/actions/${actionId}/reject`, {}, { withCredentials: true });
  return response.data;
};

export const executeAction = async (actionId) => {
  const response = await api.post(`/career-agent/actions/${actionId}/execute`, {}, { withCredentials: true });
  return response.data;
};

export const enableAgent = async () => {
  const response = await api.post('/career-agent/enable', {}, { withCredentials: true });
  return response.data;
};

export const disableAgent = async () => {
  const response = await api.post('/career-agent/disable', {}, { withCredentials: true });
  return response.data;
};

export const getAgentStatistics = async () => {
  const response = await api.get('/career-agent/statistics', { withCredentials: true });
  return response.data;
};
