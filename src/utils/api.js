import axios from 'axios';

/** Same-origin `/api` in dev — Vite proxies to backend (see vite.config.js) so the browser never hits CORS. */
const DEV_RELATIVE_API = '/api';
const LOCAL_DIRECT_API = 'http://localhost:5000/api';
/** Production API (Vercel); override with VITE_API_URL on your host. */
const PRODUCTION_API = 'https://med-mate-lqkw.vercel.app/api';

function resolveBaseURL() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.DEV) {
        // VITE_DEV_USE_LOCAL_API=1 → talk to local Express (no proxy path)
        if (import.meta.env.VITE_DEV_USE_LOCAL_API === '1') {
            return LOCAL_DIRECT_API;
        }
        return DEV_RELATIVE_API;
    }
    return PRODUCTION_API;
}

const baseURL = resolveBaseURL();

const API = axios.create({
    baseURL,
    withCredentials: false,
});

// Add a request interceptor to include the auth token in every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('med_mate_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
