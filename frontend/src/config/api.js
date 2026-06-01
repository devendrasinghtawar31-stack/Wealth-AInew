import axios from 'axios';

const BASE_URL = "/api"; 

export const API = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

export const tokenStorage = {
    getAccess: () => localStorage.getItem('token'), // Sirf 'token' use karo
    getRefresh: () => localStorage.getItem('refreshToken'),
    setAccess: (token) => {
        localStorage.setItem('token', token); // Hamesha 'token' key update karo
        console.log("DEBUG: New Token saved:", token);
    },
    setRefresh: (token) => localStorage.setItem('refreshToken', token),
    clearAuth: () => {
        localStorage.removeItem('token');
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
     if (config.url.includes('/login') || config.url.includes('/register')) {
        return config;
    }
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

           
console.log("Sending Refresh Token:", refreshToken);
const res = await axios.post('/api/users/refresh-token', { refreshToken });
console.log("New Token Received from Server:", res.data); // YE DEKHO KYA AA RAHA HAI
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