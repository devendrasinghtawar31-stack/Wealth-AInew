import { NavLink } from "react-router-dom";
// theme ko import karne ki zaroorat nahi hai, sab 'currentColors' se aayega
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ setShowSpinWheel, currentColors }) => {
  
  // Helper function: Ab ye 'currentColors' ka use karega
  const getLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: isActive ? currentColors.primary : currentColors.textMuted,
    // Active background mein currentColors.primary ka halka tint (rgba) use karo
    background: isActive ? `${currentColors.primary}20` : "transparent",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
  });

  return (
    <div
      style={{
        width: "260px",
        minHeight: "100vh",
        background: currentColors.surface, // Dynamic
        borderRight: `1px solid ${currentColors.border}`, // Dynamic
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "0 12px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: currentColors.textMain, fontSize: "20px", fontWeight: "750" }}>
          Control Center 🕹️
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <NavLink to="/dashboard" style={getLinkStyle}>📊 Wealth Dashboard</NavLink>
        <NavLink to="/dashboard/goals" style={getLinkStyle}>🎯 Financial Goals</NavLink>
        <NavLink to="/dashboard/crypto" style={getLinkStyle}>🪙 Crypto Market</NavLink>
        <NavLink to="/dashboard/ai-advisor" style={getLinkStyle}>🤖 AI Advisor</NavLink>

        <button 
          onClick={() => setShowSpinWheel(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            color: currentColors.primary,
            background: "transparent",
            border: `1px solid ${currentColors.primary}`,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            marginTop: "20px",
            transition: "all 0.3s ease"
          }}
          // Hover effect mein bhi dynamic color use karo
          onMouseEnter={(e) => {
             e.target.style.background = `${currentColors.primary}20`;
          }}
          onMouseLeave={(e) => {
             e.target.style.background = "transparent";
          }}
        >
          🎡 Daily Fortune Spin
        </button>
      </div>
    </div>
  );
};

export default Sidebar;