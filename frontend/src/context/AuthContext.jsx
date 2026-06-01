import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = tokenStorage.getAccess();
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Interceptor automatically token header mein add kar dega
                const { data } = await API.get('/users/profile');
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Auth session expired or invalid, cleaning up...");
                tokenStorage.clearAuth();
                setUser(null);
            } finally {
                setLoading(false); // Ye line crucial hai, white screen hatane ke liye
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