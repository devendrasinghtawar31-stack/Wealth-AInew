import { useState, useEffect } from "react";
import { theme } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

 useEffect(() => {
    console.log("User state check:", user); // YE LOG BHI CHECK KAR
    if (user) navigate('/dashboard', { replace: true });
 }, [user, navigate]);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await loginUser(formData.identifier, formData.password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
      setLocalLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: theme.colors.meshGradient }}>
      <form onSubmit={handleSubmit} style={{ width: "380px", padding: "35px", background: theme.colors.surface, borderRadius: "16px", border: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ textAlign: "center", color: "#fff" }}>Wealth AI</h2>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}
        
        <input type="text" name="identifier" onChange={(e) => setFormData({...formData, identifier: e.target.value})} placeholder="Email / Phone" style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px" }} />
        <input type="password" name="password" onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Password" style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px" }} />
        
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
            <span onClick={() => navigate('/forgot-password')} style={{ color: theme.colors.primary, cursor: "pointer", fontSize: "12px" }}>Forgot Password?</span>
        </div>

        <button type="submit" disabled={localLoading} style={{ width: "100%", padding: "14px", background: theme.colors.primary, color: "#fff", border: "none", borderRadius: "8px" }}>
          {localLoading ? "Authenticating..." : "Sign In 🔑"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", color: theme.colors.textMuted }}>
            New here? <span onClick={() => navigate('/register')} style={{ color: theme.colors.success, cursor: "pointer", fontWeight: "bold" }}>Register Here</span>
        </p>
      </form>
    </div>
  );
};
export default Login;