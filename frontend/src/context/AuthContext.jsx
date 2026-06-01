import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

// AuthContext.jsx mein fetchUser ko aise update karo
useEffect(() => {
    const fetchUser = async () => {
        const token = tokenStorage.getAccess();
        
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await API.get('/users/profile');
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            // Agar token expired hai, toh Interceptor automatically refresh kar dega
            // Agar refresh bhi fail ho jaye, tabhi hum user ko null karenge
            console.log("Auth check in progress or refresh needed...");
        } finally {
            setLoading(false); 
        }
    };
    fetchUser();
}, []);

    // Login Function
    const loginUser = async (identifier, password) => {
        try {
            const res = await API.post('/users/login', { identifier, password });
            
            // Backend se token keys check karo
            const token = res.data.accessToken || res.data.token;
            const refreshToken = res.data.refreshToken;

            if (token) {
                tokenStorage.setAccess(token);
                tokenStorage.setRefresh(refreshToken);
                setUser(res.data.user);
            }
            return res;
        } catch (error) {
            console.error("Context Login Error:", error.response?.data || error.message);
            throw error; 
        }
    };

    const logoutUser = () => {
        tokenStorage.clearAuth();
        setUser(null);
        window.location.href = '/login'; // Redirect on logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);