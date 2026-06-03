import { useState, useEffect } from "react";
import { theme,darkColors, lightColors } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLocalLoading] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("appTheme") || "dark");
  const currentColors = themeMode === "neon" ? neonPinkColors : darkColors;

 useEffect(() => {
    console.log("User state check:", user); // YE LOG BHI CHECK KAR
    if (user) navigate('/dashboard', { replace: true });
 }, [user, navigate]);
  
  
const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
        // yahan se promise return ho raha hai
        await loginUser(formData.identifier, formData.password);
        
        // Success hone par sidha dashboard bhejo, user state update ka intezar mat karo
        navigate('/dashboard', { replace: true });
    } catch (err) {
        setError(err.response?.data?.message || "Login failed");
        setLocalLoading(false);
    }
};

  return (
<div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    padding: '40px 20px', 
    background: currentColors.meshGradient, // currentColors use kiya hai
    boxSizing: 'border-box' 
}}>
    <form onSubmit={handleSubmit} style={{ 
        width: '380px', 
        padding: '35px', 
        background: currentColors.surface, 
        borderRadius: '16px', 
        border: `1px solid ${currentColors.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.24)'
    }}>
        {/* Title Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#FAFAF9', letterSpacing: '0.5px' }}>Wealth</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', background: `${currentColors.success}20`, color: currentColors.success, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${currentColors.success}40` }}>AI</span>
        </div>

        {error && (
            <div style={{ color: '#fff', backgroundColor: currentColors.danger, padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                ⚠️ {error}
            </div>
        )}

        {/* Input Fields - Forgot Password jaise */}
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: currentColors.textMuted }}>Email / Phone</label>
            <input 
                type="text" 
            name="identifier" 
            autoComplete="off"
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                placeholder="Enter your email or phone"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${currentColors.border}`, background: currentColors.background, color: currentColors.textMain, outline: 'none', boxSizing: 'border-box' }} 
            />
        </div>

        <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: currentColors.textMuted }}>Password</label>
            <input 
                type="password" 
            name="password" 
            autoComplete="new-password"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${currentColors.border}`, background: currentColors.background, color: currentColors.textMain, outline: 'none', boxSizing: 'border-box' }} 
            />
        </div>

        <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <span onClick={() => navigate('/forgot-password')} style={{ color: currentColors.primary, cursor: "pointer", fontSize: '13px', fontWeight: '600' }}>Forgot Password?</span>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: currentColors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }}>
            {loading ? 'Authenticating...' : 'Sign In 🔑'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: currentColors.textMuted, fontSize: '14px' }}>
            New here? <span onClick={() => navigate('/register')} style={{ color: currentColors.success, cursor: 'pointer', fontWeight: 'bold' }}>Register Here</span>
        </p>
    </form>
</div>
  );
};
export default Login;


