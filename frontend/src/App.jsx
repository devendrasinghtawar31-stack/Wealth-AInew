import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPssword';
import Dashboard from './pages/Dashboard/Dashboard';
import BankOnboarding from './pages/Dashboard/BankOnBoarding';
import GoalsDashboard from './pages/goals/GoalsDashboard';
import FinancialDashboard from './pages/Dashboard/FinancialDashboard';
import AiChatDashboard from './pages/AI/components/AiChatDashboard';
import CryptoMarket from './pages/crypto/CryptoMarket';
import { useAuth } from './context/AuthContext';



const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Wrapper */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bank-onboarding" element={<BankOnboarding />} />
                {/* Yahan baaki sub-routes add kar lo */}
            </Route>
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};
export default App;