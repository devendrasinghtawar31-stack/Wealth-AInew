import axios from 'axios';

// Kyunki ab sab ek hi domain pe hai, hum seedha relative path '/api' use karenge.
// Isse tumhe kabhi koi 'VITE_API_BASE_URL' ki tension nahi hogi.
const BASE_URL = "/api"; 

console.log("Current API BASE_URL:", BASE_URL);

export const API = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Token management (Ye part sahi hai)
export const tokenStorage = {
    getAccess: () => localStorage.getItem('token') || localStorage.getItem('accessToken'),
    getRefresh: () => localStorage.getItem('refreshToken'),
    setAccess: (token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
    },
    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

API.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccess();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!error.response) return Promise.reject(error);

        const { status } = error.response;

        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
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
                const refreshToken = tokenStorage.getRefresh();
                if (!refreshToken) throw new Error("No refresh token");

                // Note: BASE_URL yahan use ho raha hai
                const res = await axios.post(`${BASE_URL}/users/refresh-token`, { refreshToken });
                const newAccessToken = res.data?.accessToken || res.data?.token;

                if (newAccessToken) {
                    tokenStorage.setAccess(newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    return API(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                tokenStorage.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default API;