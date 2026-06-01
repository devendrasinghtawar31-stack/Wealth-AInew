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

// 1. Protected Route Component: Ye ensure karega ki user load hone tak dashboard na khule
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; 

    // Agar user nahi hai, to redirect karo
    if (!user) return <Navigate to="/login" replace />;

    return children;
};
const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes (Dashboard & Nested) */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<FinancialDashboard />} />
                <Route path="crypto-market" element={<CryptoMarket />} />
                <Route path="goals" element={<GoalsDashboard />} />
                <Route path="ai-advisor" element={<AiChatDashboard />} />
            </Route>

            {/* Bank Onboarding bhi protected honi chahiye */}
            <Route 
                path="/bank-onboarding" 
                element={
                    <ProtectedRoute>
                        <BankOnboarding />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

export default App;