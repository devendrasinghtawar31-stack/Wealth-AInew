import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPssword'; 
import Dashboard from './pages/Dashboard/Dashboard'; // 🚀 MASTER LAYOUT SHELL
import BankOnboarding from './pages/Dashboard/BankOnBoarding';
import GoalsDashboard from './pages/goals/GoalsDashboard';
import FinancialDashboard from './pages/Dashboard/FinancialDashboard'; // 🚨 IMPORT FIXED HERE
import AiChatDashboard from './pages/AI/components/AiChatDashboard';
import CryptoMarket from './pages/crypto/CryptoMarket';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/bank-onboarding" element={<BankOnboarding />} />

            {/* 🚀 SAHI NESTED ROUTING MATRIX */}
            <Route path="/dashboard" element={<Dashboard />}>
                {/* Jab /dashboard/ par jaoge, ye load hoga */}
                <Route index element={<FinancialDashboard />} /> 
                <Route path="crypto-market" element={<CryptoMarket />} />
                <Route path="goals" element={<GoalsDashboard />} />
                <Route path="ai-advisor" element={<AiChatDashboard />} />
            </Route>
        </Routes>
    );
};

export default App;