import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // TODO: change to your backend URL
  withCredentials: true, // if backend uses cookies; otherwise you can remove
});

// Safe getter for auth token. Guards against SSR and throws from localStorage.
export const getAuthToken = (): string | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return localStorage.getItem("authToken");
  } catch (e) {
    return null;
  }
};

apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (e) {
      // swallow errors to avoid breaking requests if storage access fails
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
