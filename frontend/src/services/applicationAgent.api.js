import api from './api';

export const getApplicationAgentState = async () => {
  const response = await api.get('/application-agent');
  return response.data.data;
};

export const analyzeOpportunity = async (opportunityId) => {
  const response = await api.post('/application-agent/analyze', { opportunityId });
  return response.data.data;
};

export const getApplicationAgentContext = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/context/${opportunityId}` : '/application-agent/context';
  const response = await api.get(url);
  return response.data.data;
};

export const getNextAction = async () => {
  const response = await api.get('/application-agent/next-action');
  return response.data.data;
};

export const runApplicationAgent = async (opportunityId = null) => {
  const response = await api.post('/application-agent/run', { opportunityId });
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

export const getApplicationAgentTasks = async () => {
  const response = await api.get('/application-agent/tasks');
  return response.data.data;
};

export const getApplicationAgentMemory = async () => {
  const response = await api.get('/application-agent/memory');
  return response.data.data;
};

export const deleteApplicationAgentMemory = async (memoryId) => {
  const response = await api.delete(`/application-agent/memory/${memoryId}`);
  return response.data;
};

export const getApplicationAgentDrafts = async (opportunityId = null) => {
  const url = opportunityId ? `/application-agent/drafts?opportunityId=${opportunityId}` : '/application-agent/drafts';
  const response = await api.get(url);
  return response.data.data;
};
