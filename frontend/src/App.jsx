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
import ProtectedRoute from './middleware/ProtectedRoute';


const App = () => {
    return (
        <Routes>
            {/* Public Routes - Ye alag rahenge */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes - Nesting yahan zaruri hai */}
            <Route element={<ProtectedRoute />}>
                {/* Parent Dashboard Route */}
                <Route path="/dashboard" element={<Dashboard />}>
                    {/* Index matlab /dashboard pe ye dikhega */}
                    <Route index element={<FinancialDashboard />} />
                    <Route path="overview" element={<FinancialDashboard />} />
                    <Route path="goals" element={<GoalsDashboard />} />
                    <Route path="crypto" element={<CryptoMarket />} /> {/* Path 'crypto' hai */}
                    <Route path="ai-advisor" element={<AiChatDashboard />} />
                </Route>
                
                {/* Dashboard ke bahar wale protected routes */}
                <Route path="/bank-onboarding" element={<BankOnboarding />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};
export default App;