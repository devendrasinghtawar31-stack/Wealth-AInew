import axios from 'axios';

// 1. Storage helper (Ye wahi hai jo tumne pehle banaya tha)
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

// 2. Base instance (Refresh ke liye - bina interceptor ke)
const axiosInstance = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

// 3. Main API instance (Interceptor ke saath)
export const API = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

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
    const token = tokenStorage.getAccess();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return API(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = tokenStorage.getRefresh();
                const res = await axiosInstance.post('/users/refresh-token', { refreshToken });
                const newAccessToken = res.data.accessToken || res.data.token;

                tokenStorage.setAccess(newAccessToken);
                isRefreshing = false;
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                tokenStorage.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default API