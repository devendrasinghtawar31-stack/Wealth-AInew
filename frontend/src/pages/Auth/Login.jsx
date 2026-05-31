import { useState } from "react";
import { theme } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Global Context Bridge Connect Kiya

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // Global state dispatcher hook se nikala

  const [formData, setFormData] = useState({
    identifier: "", // Single flexible string container for Email/Phone
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //  Converted to async function for handling real-time network latency
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: formData.identifier.trim(),// Frontend state placeholder text variable
                password: formData.password
            })
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
            // Save tokens cleanly inside window nodes
            localStorage.setItem('accessToken', resData.token);
            localStorage.setItem('token', resData.token);
            localStorage.setItem('refreshToken', resData.refreshToken);
            
            alert(` Welcome back, ${resData.name || 'User'}!`);
            window.location.href = '/dashboard';
        } else {
            //Server ka actual message user ko dikhao na ki generic network crash!
            setError(resData.message || "Bhai, Credentials galat hain, dubara check karo!");
        }
    } catch (err) {
        console.error("Login Interface Crash Trace:", err);
        setError(" Secure login gateway server link unreachable!");
    } finally {
        setLoading(false);
    }
};
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: '40px 20px',
        fontFamily: "sans-serif",
        background: theme.colors.meshGradient,
        boxSizing: 'border-box'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "380px",
          padding: "35px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
          borderRadius: "16px",
          background: theme.colors.surface, 
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <span style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#FAFAF9', 
              letterSpacing: '0.5px',
              textShadow: '0 0 20px rgba(250, 255, 0, 0.4)' 
          }}>
              Wealth
          </span>
          
          <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              fontFamily: 'monospace', 
              background: 'rgba(46, 196, 182, 0.15)', 
              color: theme.colors.success, 
              padding: '4px 10px', 
              borderRadius: '6px', 
              border: `1px solid rgba(46, 196, 182, 0.3)`,
              letterSpacing: '0.5px'
          }}>
              AI
          </span>
        </div>
        
        <p
          style={{
            textAlign: "center",
            color: theme.colors.textMuted, 
            fontSize: "14px",
            marginBottom: "30px",
          }}
        >
          Login To Your Account
        </p>

        {error && (
          <div
            style={{
              color: "#fff",
              backgroundColor: theme.colors.danger, 
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Flexible Input (Email or Phone) */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.textMuted,
            }}
          >
            Email Address / Phone Number
          </label>
          <input
            type="text"
            name="identifier" 
            value={formData.identifier}
            autoComplete="new-password"
            onChange={handleChange}
            placeholder="Enter Your Email / Phone Number"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              boxSizing: "border-box",
              background: theme.colors.background,
              color: theme.colors.textMain,
              outline: "none",
              fontSize: "15px",
            }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.textMuted,
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            autoComplete="new-password"
            onChange={handleChange}
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              boxSizing: "border-box",
              background: theme.colors.background,
              color: theme.colors.textMain,
              outline: "none",
              fontSize: "15px",
            }}
          />
        </div>

        {/* Forgot Password Link */}
        <div style={{ textAlign: "right", marginBottom: "25px" }}>
          <span
            onClick={() => navigate('/forgot-password')}
            style={{
              color: theme.colors.primary,
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Forgot Password?
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: theme.colors.primary, 
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
            transition: theme.transitions.smooth,
            marginBottom: "20px",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Authenticating Session..." : "Sign In 🔑"}
        </button>

        {/* REGISTER BUTTON SECTION */}
        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: theme.colors.textMuted,
          }}
        >
          New to Wealth AI?{" "}
          <span
            onClick={() => navigate('/register')}
            style={{
              color: theme.colors.success, 
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Register Here
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;