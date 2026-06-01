import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // AuthContext.jsx mein fetchUser function ko update karo
const fetchUser = async () => {
    const token = tokenStorage.getAccess();
    
    // Yahan condition lagao: agar token nahi hai, to direct return ho jao
    if (!token) {
        setLoading(false);
        return;
    }

    try {
        const { data } = await API.get('/users/profile');
        if (data.success) setUser(data.user);
    } catch (error) {
        // Sirf tabhi clean karo agar error 401/403 hai
        tokenStorage.clearAuth();
    } finally {
        setLoading(false);
    }
};
        fetchUser();
    }, []);

   const loginUser = async (identifier, password) => {
    const res = await API.post('/users/login', { identifier, password });
    console.log("Response aaya:", res.data); // YE CHECK KAR
    const { accessToken, refreshToken, user } = res.data;
    tokenStorage.setAccess(accessToken);
    tokenStorage.setRefresh(refreshToken);
    setUser(user); // Agar ye line chalne ke baad bhi kuch nahi hua...
    console.log("User state set ho gayi"); 
    return res;
};

// AuthContext.jsx
const logoutUser = () => {
    // 1. Sabse aggressive tareeke se cleanup
    localStorage.clear();
    sessionStorage.clear();
    tokenStorage.clearAuth();
    
    // 2. State reset
    setUser(null);
    
    // 3. Force replace (History saaf ho jayegi, back button se dashboard nahi khulega)
    window.location.replace('/login');
};
    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);