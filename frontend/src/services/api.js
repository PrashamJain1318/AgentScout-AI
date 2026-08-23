import axios from "axios";

// In-memory stale-while-revalidate API cache
const apiCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh TTL

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000, // 10s default request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ [API RESPONSE ${response.status}] ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`⚠️ [API CANCELLED] ${error.message}`);
      }
      return Promise.reject(error);
    }

    if (error.response) {
      if (process.env.NODE_ENV === "development") {
        console.error(`❌ [API ERROR ${error.response.status}]`, error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      console.warn(`⏳ [API TIMEOUT] Request timed out: ${error.config?.url}`);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ [API NETWORK ERROR]", error.message);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Cache Helper for Stale-While-Revalidate GET requests
 */
export const getCachedData = (key) => {
  const cached = apiCache.get(key);
  if (!cached) return null;
  const isStale = Date.now() - cached.timestamp > CACHE_TTL_MS;
  return { data: cached.data, isStale };
};

export const setCachedData = (key, data) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

export const clearApiCache = (keyPattern = null) => {
  if (!keyPattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(keyPattern)) {
      apiCache.delete(key);
    }
  }
};

export default api;
