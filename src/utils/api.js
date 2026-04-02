import axios from 'axios';

const LOCAL_API = 'http://localhost:5000/api';
/** Production API (Vercel); override anytime with VITE_API_URL in `.env` or hosting env. */
const PRODUCTION_API = 'https://med-mate-lqkw.vercel.app/api';

const baseURL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? LOCAL_API : PRODUCTION_API);

const API = axios.create({
    baseURL,
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
