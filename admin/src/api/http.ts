import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE;


export const http = axios.create({ baseURL, withCredentials: true });


http.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

const authHttp = axios.create({ baseURL, withCredentials: true });

let isRefreshing = false
let pending: Array<(token: string) => void> = [];
const isAuthUrl = (url?: string) =>
  !!url &&
  (url.includes("/api/auth/login") ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/logout"));

async function refreshAccessToken(): Promise<string> {
	const res = await authHttp.post('/api/auth/refresh')
	const newToken = res.data?.access_token as string
	if (!newToken) throw new Error("No access_token in refresh response");
  localStorage.setItem("accessToken", newToken);
  return newToken;
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const response = error.response;
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      response?.status === 401 &&
      !original?._retry &&
      !isAuthUrl(original?.url) &&
      localStorage.getItem("access_token")
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pending.push((newToken: string) => {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        http.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        pending.forEach((resume) => resume(newToken));
        pending = [];
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        pending = [];
        localStorage.removeItem("access_token");
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);