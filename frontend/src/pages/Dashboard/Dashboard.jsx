import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { theme } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import SpinWheelModal from "./SpinWheelModal";
import PremiumModal from "../../hooks/PremiumModal";
import Sidebar from "../../components/shared/Sidebar";
import API from "../../config/api";


const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [walletCoins, setWalletCoins] = useState(0);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    userBanks: [],
    isPremium: user?.isPremium || false,
    lastSpunAt:null
  });
// 1. Pata karo ki abhi konsi theme chal rahi hai
const [isDarkMode, setIsDarkMode] = useState(() => {
  return localStorage.getItem("appTheme") !== "light";
});

// 2. Button dabne par ye function chalega
const toggleTheme = () => {
  // Naya mode kya hoga wo decide karo
  const newMode = isDarkMode ? "light" : "dark";
  
  // Naye mode ko local storage me save kar do
  localStorage.setItem("appTheme", newMode);
  
  // Page ko ek turant chota sa reload de do, taaki theme.js naye rang utha le
  window.location.reload(); 
};

useEffect(() => {
    const verifyUserOnboardingStatus = async () => {
      try {
        // Sirf API.get use karo, header ki tension mat lo, interceptor sambhal lega
        const response = await API.get('/users/profile'); 
        const resData = response.data;

        if (resData && resData.success) {
          const banksArray = resData.user?.associatedBanks || [];
          if (banksArray.length === 0) return navigate("/bank-onboarding");

          setWalletCoins(resData.user?.walletCoins || 0);
          setDashboardMetrics({
            userBanks: banksArray,
            isPremium: resData.user?.isPremium || false,
            lastSpunAt: resData.user?.spinReward?.lastSpunAt || null
          });
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        if (error.response?.status === 401) {
            logoutUser(); // Token expire ho gaya toh force logout
        }
      } finally {
        setPageLoading(false);
      }
    };
    verifyUserOnboardingStatus();
  }, [navigate]); // navigate stable hai, koi dikkat nahi

  const handleLogout = () => {
    if (window.confirm("Bhai, kya aap sach me logout karna chahte hain?")) {
      logoutUser();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };
  

  if (pageLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.meshGradient,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.colors.meshGradient,
        color: theme.colors.textMain,
      }}
    >
     <Sidebar setShowSpinWheel={setShowSpinWheel} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px",
            background: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
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
          <button
              onClick={toggleTheme}
              style={{
                background: "transparent",
                border: `1px solid ${theme.colors.border}`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                // Abhi ke liye text color white rakha hai
                color: "#fff" 
              }}
              title="Toggle Theme"
            >
              {isDarkMode ? " 🔆 Light" : " 🌕 Dark"}
            </button>


          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {!dashboardMetrics.isPremium && (
              <button
                onClick={() => setShowPremiumModal(true)}
                style={{
                  background: "linear-gradient(90deg, #E5A93B, #FFD700)",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  color: "#000",
                  cursor: "pointer",
                }}
              >
                Upgrade To Elite 
              </button>
            )}
            
             {dashboardMetrics.isPremium && (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(229, 169, 59, 0.2), rgba(255, 215, 0, 0.2))",
        border: "1px solid #FFD700",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "700",
        color: "#FFD700", // Sunehra rang
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 0 10px rgba(255, 215, 0, 0.1)",
      }}
    >
      <span>ELITE MEMBER</span>
    </div>
  )}

            <div
              style={{
                background: "rgba(250, 255, 0, 0.08)",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(250, 255, 0, 0.3)",
              }}
            >
              🪙 Wallet: ₹
              {Number(parseFloat(walletCoins || 0).toFixed(2)).toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 },
              )}{" "}
              Coins
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${theme.colors.border}`,
                color: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main
          style={{
            padding: "40px 20px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              padding: "20px 30px",
              borderRadius: "12px",
              border: `1px solid ${theme.colors.border}`,
              marginBottom: "20px",
            }}
          >
            <h1>Welcome back, {user?.name || "Devendra"}! 👋</h1>
          </div>
          
          <Outlet
            context={{
              dashboardMetrics,
              walletCoins,
              setWalletCoins,
              setShowSpinWheel,
              isDarkMode// <--- YE ADD KAR DIYA
            }}
          />
        </main>
      </div>

      {showSpinWheel && (
        <SpinWheelModal
          onClose={() => setShowSpinWheel(false)}
          updateWalletCoins={setWalletCoins}
            lastSpunAt={dashboardMetrics.lastSpunAt}
        />
      )}
      {showPremiumModal && (
        <PremiumModal
          user={user || {}}
          onClose={() => setShowPremiumModal(false)}
          lastSpunAt={dashboardMetrics.lastSpunAt}
        />
      )}
    </div>
  );
};

export default Dashboard;
