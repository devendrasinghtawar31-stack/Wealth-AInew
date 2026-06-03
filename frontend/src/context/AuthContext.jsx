import { createContext, useContext, useState, useEffect } from "react";
import API, { tokenStorage } from "../config/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

// AuthContext.jsx
    const fetchUser = async () => {
        setLoading(true);
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
        setLoading(false);
        return;
    }
    try {
        const { data } = await API.get('/users/profile');
        if (data.success) setUser(data.user);
    } catch (error) {
        // Sirf tab clear karo jab token expired/invalid ho
        if (error.response?.status === 401) {
            localStorage.clear();
            setUser(null);
        }
    } finally {
        setLoading(false); // Ye finally mein hona chahiye
    }
    };
    
    useEffect(() => {
        fetchUser();
    }, []);

// AuthContext.jsx - Update this function
    const loginUser = async (identifier, password) => {
        setLoading(true);
    console.log("Login function called with:", identifier); // 1. Check if it triggers
    
    try {
        const res = await API.post('/users/login', { identifier, password });
        console.log("API Response received:", res.data); // 2. Check if API returns data

        const { token, refreshToken, user } = res.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        
        setUser(user); 
        console.log("User state updated successfully"); // 3. Check if this logs
        await fetchUser();
        return res;
    } catch (err) {
        console.error("Login Error in Context:", err.response?.data || err.message); // 4. Check if error is swallowed
        throw err;
    }finally {
        setLoading(false); // Process end
    }
};

    const logoutUser = () => {
        localStorage.clear();
        tokenStorage.clearAuth();
        setUser(null);
        window.location.replace('/login');
    };

const refreshUser = async () => {
    try {
        // Tumhara backend ka endpoint jo user ka current profile/data deta hai
        const response = await API.get('/users/profile');
        console.log("--> Refreshing User State from API:", response.data.user.associatedBanks);
        if(response.data.success) {
            setUser(response.data.user); // Yahan naya data set ho jayega
        }
    } catch (error) {
        console.error("Failed to refresh user state", error);
    }
};


    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, fetchUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Yahan export ka tarika ekdum clear rakho
export const useAuth = () => useContext(AuthContext);