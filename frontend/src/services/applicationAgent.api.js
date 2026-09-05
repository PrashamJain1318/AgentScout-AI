import api from './api';

export const getApplicationAgent = async () => {
  const response = await api.get('/application-agent');
  return response.data.data;
};

export const analyzeOpportunity = async (opportunityId) => {
  const url = opportunityId ? `/application-agent/analyze/${opportunityId}` : '/application-agent/analyze';
  const response = await api.post(url, { opportunityId });
  return response.data.data;
};

export const getApplicationContext = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/context/${opportunityId}` : '/application-agent/context';
  const response = await api.get(url);
  return response.data.data;
};

export const getNextAction = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/next-action/${opportunityId}` : '/application-agent/next-action';
  const response = await api.get(url);
  return response.data.data;
};

export const runApplicationAgent = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/run/${opportunityId}` : '/application-agent/run';
  const response = await api.post(url, { opportunityId });
  return response.data.data;
};

export const enableApplicationAgent = async (mode = 'ASSISTED') => {
  const response = await api.post('/application-agent/enable', { mode });
  return response.data.data;
};

export const disableApplicationAgent = async () => {
  const response = await api.post('/application-agent/disable');
  return response.data.data;
};

export const getApplicationTasks = async (params = {}) => {
  const response = await api.get('/application-agent/tasks', { params });
  return response.data.data;
};

export const getApplicationMemory = async () => {
  const response = await api.get('/application-agent/memory');
  return response.data.data;
};

export const deleteApplicationMemory = async (memoryId) => {
  const response = await api.delete(`/application-agent/memory/${memoryId}`);
  return response.data;
};

export const getApplicationDrafts = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/drafts?opportunityId=${opportunityId}` : '/application-agent/drafts';
  const response = await api.get(url);
  return response.data.data;
};
