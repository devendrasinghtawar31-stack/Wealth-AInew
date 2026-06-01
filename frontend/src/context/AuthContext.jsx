import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = tokenStorage.getAccess();
            if (token) {
                try {
                    // Token header mein interceptor khud add kar dega
                    const { data } = await API.get('/users/profile');
                    setUser(data.user);
                } catch (error) {
                    console.error("Auth session expired, logging out...");
                    logoutUser();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const loginUser = async (identifier, password) => {
        try {
            const res = await API.post('/users/login', { identifier, password });

            if (res.data) {
                // TOKEN STORAGE KA NAAYA API USE KARO
                tokenStorage.setAccess(res.data.token);
                tokenStorage.setRefresh(res.data.refreshToken); // Fixed: setRefresh ka istemal
                
                setUser(res.data.user || res.data); 
                return res.data;
            }
        } catch (error) {
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