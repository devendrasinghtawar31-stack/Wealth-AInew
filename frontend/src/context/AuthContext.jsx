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

// AuthContext.js
const loginUser = async (identifier, password) => {
    try {
        const res = await API.post('/users/login', { identifier, password });
        
        // Log karke dekho response kya aa raha hai
        console.log("Full Login Response:", res.data);

        if (res.data && (res.data.token || res.data.accessToken)) {
            const token = res.data.token || res.data.accessToken;
            tokenStorage.setAccess(token);
            tokenStorage.setRefresh(res.data.refreshToken);
            setUser(res.data.user);
        } else {
            throw new Error("Token missing in response");
        }
    } catch (error) {
        console.error("Context Login Error:", error.response?.data || error.message);
        throw error; // Isse Login.jsx ka catch block chalega
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