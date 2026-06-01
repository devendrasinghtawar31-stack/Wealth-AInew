import { useState, useEffect } from "react";
import { theme } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, user , loading } = useAuth(); // Context se 'user' state bhi le li

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 FIX: Jab user state update ho jaye, tabhi navigate karo.
  // Isse form submission ke beech mein koi interruption nahi aayega.
 useEffect(() => {
    // Agar user logged in hai, to wapas login page mat dikhao
    if (!loading && user) {
        navigate('/dashboard', { replace: true });
    }
}, [user, loading, navigate]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🛡️ Ye page refresh hone se rokega
    setError('');
    setLoading(true);

    try {
      await loginUser(formData.identifier, formData.password);
      // Yahan se navigate hata diya, useEffect sambhal lega
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid credentials.");
      setLoading(false); // Sirf error aane par loading off karo
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: '40px 20px', background: theme.colors.meshGradient, boxSizing: 'border-box' }}>
      <form onSubmit={handleSubmit} style={{ width: "380px", padding: "35px", boxShadow: "0 8px 32px rgba(0,0,0,0.24)", borderRadius: "16px", background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FAFAF9' }}>Wealth</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', background: 'rgba(46, 196, 182, 0.15)', color: theme.colors.success, padding: '4px 10px', borderRadius: '6px' }}>AI</span>
        </div>

        {error && <div style={{ color: "#fff", backgroundColor: theme.colors.danger, padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>⚠️ {error}</div>}

        {/* Input Fields */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: theme.colors.textMuted }}>Email Address / Phone Number</label>
          <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} placeholder="Enter Your Email / Phone" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textMain }} />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: theme.colors.textMuted }}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textMain }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: theme.colors.primary, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "Authenticating..." : "Sign In 🔑"}
        </button>
      </form>
    </div>
  );
};

export default Login;