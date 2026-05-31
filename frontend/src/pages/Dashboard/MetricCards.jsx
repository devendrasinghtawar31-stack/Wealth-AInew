import { theme } from "../../theme";

const MetricCards = ({ stats }) => {
    const cardData = [
        {
            title: "TOTAL REAL INCOME",
            value: `₹${(stats?.totalIncome || 0).toLocaleString("en-IN")}`,
            icon: "📥",
            color: theme.colors.success, // #2EC4B6 - Mint Teal
            shadowGlow: "rgba(46, 196, 182, 0.08)",
        },
        {
            title: "SMS MONITORED EXPENSE",
            value: `₹${(stats?.totalExpense || 0).toLocaleString("en-IN")}`,
            icon: "💸",
            color: theme.colors.primary, // #FF6B35 - Vibrant Amber Orange
            shadowGlow: "rgba(255, 107, 53, 0.08)",
        },
        {
            title: "NET CURRENT SAVINGS",
            value: `₹${(stats?.netBalance || 0).toLocaleString("en-IN")}`,
            icon: "🪙",
            color: "#FFD700", // Gold Glow for Wallet
            shadowGlow: "rgba(255, 215, 0, 0.08)",
        }
    ];

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            width: "100%"
        }}>
            {cardData.map((card, idx) => (
                <div key={idx} style={{
                    background: theme.colors.surface, // STRICTLY USING THEME SURFACE (#1C232B)
                    border: `1px solid ${theme.colors.border}`, //USING THEME MUTED BORDER (#2C353F)
                    borderRadius: "12px",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: `0 10px 30px -10px ${card.shadowGlow}`,
                    transition: theme.transitions.smooth
                }}>
                    <div>
                        <span style={{ 
                            fontSize: "11px", 
                            fontWeight: "700", 
                            color: theme.colors.textMuted, //  USING THEME MUTED TEXT (#8F9CA7)
                            letterSpacing: "1.5px" 
                        }}>
                            {card.title}
                        </span>
                        <h2 style={{ 
                            margin: "6px 0 0 0", 
                            fontSize: "26px", 
                            fontWeight: "800", 
                            color: card.color,
                            letterSpacing: "0.5px"
                        }}>
                            {card.value}
                        </h2>
                    </div>
                    <div style={{
                        width: "46px", height: "46px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.02)", display: "flex",
                        justifyContent: "center", alignItems: "center", fontSize: "20px",
                        border: `1px solid ${theme.colors.border}`
                    }}>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetricCards;