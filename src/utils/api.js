import axios from 'axios';

/** Backend base URL — set VITE_API_URL in root `.env` (e.g. production API). Default matches `backend/server.js` (PORT 5000). */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
