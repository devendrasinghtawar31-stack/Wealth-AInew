import { NavLink } from "react-router-dom";
import { theme } from "../../theme";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ setShowSpinWheel }) => { // <--- Ye prop accept kiya
  // Helper function for consistent link styling
  const getLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: isActive
      ? theme.colors.primary || "#FF6B35"
      : theme.colors.textMuted || "#8A99AD",
    background: isActive ? "rgba(255, 107, 53, 0.08)" : "transparent",
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
        background: theme.colors.surface || "#1C232B",
        borderRight: `1px solid ${theme.colors.border || "#2C353F"}`,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "0 12px", marginBottom: "10px" }}>
        <h3
          style={{
            margin: 0,
            color: "#FFF",
            fontSize: "20px",
            fontWeight: "750",
          }}
        >
          Control Center 🕹️
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <NavLink to="/dashboard" style={getLinkStyle}>
          📊 Wealth Dashboard
        </NavLink>

        <NavLink to="/dashboard/goals" style={getLinkStyle}>
          🎯 Financial Goals
        </NavLink>

        <NavLink to="/dashboard/crypto-market" style={getLinkStyle}>
          🪙 Crypto Market
        </NavLink>

        <NavLink to="/dashboard/ai-advisor" style={getLinkStyle}>
          🤖 AI Advisor
        </NavLink>

       {/* Sidebar.jsx mein ye replace karo */}
<button 
  onClick={() => setShowSpinWheel(true)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "#FF6B35", // Primary color
    background: "transparent",
    border: `1px solid #FF6B35`, // Button jaisa border
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "20px", // Baki links se thoda niche
    transition: "all 0.3s ease"
  }}
  onMouseEnter={(e) => e.target.style.background = "rgba(255, 107, 53, 0.1)"}
  onMouseLeave={(e) => e.target.style.background = "transparent"}
>
  🎡 Daily Fortune Spin
</button>
      </div>
    </div>
  );
};

export default Sidebar;