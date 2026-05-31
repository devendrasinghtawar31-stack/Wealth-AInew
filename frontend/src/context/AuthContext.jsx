import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js"; // API aur tokenStorage dono import kiye

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = tokenStorage.getAccess();
            if (token) {
                try {
                    const { data } = await API.get('/users/profile');
                    setUser(data.user); // Pura user object (spinReward ke saath)
                } catch (error) {
                    logoutUser();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const loginUser = async (email, password) => {
        try {
            const res = await API.post('/users/login', { identifier: email, password });
            console.log("LOGIN FULL RESPONSE:", res.data);

            if (res.data) {
                // tokens set karo
                tokenStorage.setAccess(res.data.token);
                localStorage.setItem('refreshToken', res.data.refreshToken);
                
                // Pura user profile state mein set karo
                setUser(res.data); 
                return res.data;
            }
        } catch (error) {
            throw error;
        }
    };

    const logoutUser = () => {
        tokenStorage.clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);