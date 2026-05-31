import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 


const ProtectedRoute = () => { 
    const { user, loading } = useAuth(); //context se pata kia ki user login hai ya nahi

    //jab tkcheck ho raha hai ki login hai ya nahi ,
    //tab tak loading dikhao ,jaldibazi me redirect nahi karna hai

    if (loading) { 
        return (
            <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
                <h3> Just wait , We are Searching... 🔍</h3>
            </div>
        );
    } 

    //agar user login hai to use andr jane do (outlet render karo);
    //agar logged in nahi hai , toh use direct '/login par bhj do or purani history replace kar do'
    return user ? <Outlet/>:<Navigate to= "/login"/>
    

}

export default ProtectedRoute;