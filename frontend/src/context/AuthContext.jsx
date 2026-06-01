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
                const { data } = await API.get('/users/profile');
                if (data.success) setUser(data.user);
            } catch (error) {
                console.error("Session expired");
                tokenStorage.clearAuth();
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const loginUser = async (identifier, password) => {
        const res = await API.post('/users/login', { identifier, password });
        const { accessToken, refreshToken, user } = res.data;
        tokenStorage.setAccess(accessToken);
        tokenStorage.setRefresh(refreshToken);
        setUser(user);
        return res;
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