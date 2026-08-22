import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log("🚀 API REQUEST");
    console.log("Method:", config.method);
    console.log("URL:", config.baseURL + config.url);
    console.log("Body:", config.data);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE");
    console.log("Status:", response.status);
    console.log("Data:", response.data);

    return response;
  },
  (error) => {
    console.error("❌ API ERROR");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
