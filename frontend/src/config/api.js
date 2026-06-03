import axios from 'axios';

// 1. Storage helper
export const tokenStorage = {
    getAccess: () => localStorage.getItem('token'),
    getRefresh: () => localStorage.getItem('refreshToken'),
    setAccess: (token) => localStorage.setItem('token', token),
    setRefresh: (token) => localStorage.setItem('refreshToken', token),
    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
};

// 2. Base URL Helper (Safe for Node & Browser)
const getBaseUrl = () => {
    // Vite mein 'import.meta.env' hota hai
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Default fallback
    return 'http://localhost:3000/api'; 
};

// 3. API Instances
const axiosInstance = axios.create({
    baseURL: getBaseUrl(), // Yahan getBaseUrl() use karo
    headers: { 'Content-Type': 'application/json' }
});

export const API = axios.create({
    baseURL: getBaseUrl(), // Yahan bhi getBaseUrl() use karo
    withCredentials: true
});

// ... (Baaki Interceptor ka code bilkul sahi hai, use waisa hi rehne do)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Request Interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // Sirf tabhi Authorization header lagao agar token valid ho
    if (token && token !== "undefined" && token !== "null" && token.length > 10) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
// api.js mein ye logic add karo
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Agar pehle se refresh ho raha hai, toh is request ko queue mein daalo
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return API(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // YEH HAI WO ZAROORI LINE:
                const { data } = await API.post('/users/refresh-token', { refreshToken });
                
                const newToken = data.token; // Ya jo tumhare response mein key hai
                localStorage.setItem('token', newToken);
                
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return API(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default API