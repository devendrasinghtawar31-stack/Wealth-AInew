import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const ProtectedRoute = () => { 
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token'); // Token check extra safety ke liye

    if (loading) { 
        return (
            <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', color: '#fff' }}>
                <h3> Just wait, We are verifying your secure session... 🔍</h3>
            </div>
        );
    } 

    // Agar token hai par user state null hai (kabhi refresh par hota hai), 
    // toh hume user ko block nahi karna chahiye, balki AuthContext ko fetch karne dena chahiye.
    // Par agar token hi nahi hai, toh seedha login par bhejo.
    
    return (user || token) ? <Outlet/> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;