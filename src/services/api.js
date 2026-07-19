import axios from "axios";

import {
  EVENTO_NAO_AUTORIZADO,
  obterToken,
  removerToken,
} from "./authStorage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = obterToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const token = obterToken();
    const url = error.config?.url || "";

    const chamadaDeLogin =
      url.includes("/auth/login");

    if (
      status === 401 &&
      token &&
      !chamadaDeLogin
    ) {
      removerToken();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new Event(EVENTO_NAO_AUTORIZADO)
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;