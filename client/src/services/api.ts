import axios from 'axios';

/**
 * Always use `/api` (relative path).
 *
 * In production (hunar-hub-ten.vercel.app) the client's vercel.json rewrites
 * `/api/:path*` → `https://hunar-hub-fwp5.vercel.app/api/:path*`
 * so all requests stay same-origin from the browser's perspective (no CORS).
 *
 * In local development, vite.config.ts proxies `/api` → `http://localhost:5000`.
 *
 * If VITE_API_URL is explicitly set (e.g., for testing a different backend), honour it.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: false,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hunarhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // Only auto-logout on 401 when NOT on an auth route (login/register calls
    // legitimately return 401 for bad credentials and must NOT trigger logout).
    const requestUrl: string = error.config?.url ?? '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('hunarhub_token');
      localStorage.removeItem('hunarhub_user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }

    // Attach display-friendly message and re-throw
    const enrichedError = Object.assign(error, { displayMessage: message });
    return Promise.reject(enrichedError);
  }
);

export default api;
