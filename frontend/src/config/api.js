import axios from 'axios';

const BASE_URL = "/api"; 

export const API = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

export const tokenStorage = {
    getAccess: () => localStorage.getItem('token') || localStorage.getItem('accessToken'),
    getRefresh: () => localStorage.getItem('refreshToken'),
    setAccess: (token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
    },
    // YE LINE ADD KI HAI:
    setRefresh: (token) => localStorage.setItem('refreshToken', token),
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

// Request Interceptor: Her request mein header chipka do
API.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccess();
        console.log("DEBUG: Interceptor calling...", config.url);
        console.log("DEBUG: Token found:", token); // YE LINE DEKHO
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("DEBUG: Header set!");
        } else {
            console.log("DEBUG: NO TOKEN FOUND!");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: 401 aaya toh refresh token se naya access token maango
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

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

            // Yahan 'axios' use kiya hai taaki 'API' interceptor loop mein na phase
            const res = await axios.post(`${BASE_URL}/users/refresh-token`, { refreshToken });
            const newAccessToken = res.data?.accessToken || res.data?.token;

            tokenStorage.setAccess(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            processQueue(null, newAccessToken);
            return API(originalRequest);
      } catch (refreshError) {
    console.log("REFRESH FAILED:", refreshError.response?.data || refreshError.message);
    processQueue(refreshError, null);
    tokenStorage.clearAuth();
    // window.location.href = '/login'; // <--- ISKO COMMENT KARKE CHECK KARO
    return Promise.reject(refreshError);
} finally {
            isRefreshing = false;
        }
    }
);

export default API;