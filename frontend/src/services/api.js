import axios from "axios";

// =========================
// BASE URL: usa la IP del servidor en red local
// =========================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/";

const api = axios.create({
  baseURL: BASE_URL,
});

// =========================
// REQUEST: siempre leer token
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE: refresh automático
// =========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        const res = await axios.post(
          BASE_URL + "token/refresh/", // usar la misma baseURL
          { refresh }
        );

        localStorage.setItem("access", res.data.access);

        originalRequest.headers.Authorization =
          "Bearer " + res.data.access;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
