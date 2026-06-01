import axios from 'axios';

// 1. Ek base instance banao bina interceptor ke (Refresh ke liye)
const axiosInstance = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

// 2. Main API instance
export const API = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// ... tokenStorage tumhara bilkul sahi hai, wo wahi rehne do ...

API.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Agar 401 hai aur retry nahi kiya hai abhi tak
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
                // Yahan axiosInstance use karo (jo interceptor-free hai)
                const res = await axiosInstance.post('/users/refresh-token', { refreshToken });
                const newAccessToken = res.data.accessToken;

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

export { API, tokenStorage };
export default API;