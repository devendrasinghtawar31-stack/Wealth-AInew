import { theme } from "../../theme"; // Syncing with your theme configs

const AnalyticsChart = ({ transactions }) => {
    //  REAL MONEY DATA PARSING ENGINE
    // Sirf verified expenses ko filter karke unka category-wise total nikalna
    const expenseTransactions = transactions.filter(tx => tx.type === "expense" && tx.status !== "unverified");
    
    const totalExpenseSum = expenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Initializing object keys mapping
    const categoryTotals = {};
    expenseTransactions.forEach(tx => {
        const cat = tx.category || "General";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (tx.amount || 0);
    });

    // Formatting data into an array with percentages distribution
    const chartData = Object.keys(categoryTotals).map(cat => {
        const amount = categoryTotals[cat];
        const percentage = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
        return { name: cat, amount, percentage };
    }).sort((a, b) => b.amount - a.amount); // Higher expense tags on top standard

    return (
        <div style={{
            background: theme.colors.surface, // #1C232B Slate Surface
            border: `1px solid ${theme.colors.border}`, // #2C353F Muted Border
            borderRadius: "14px",
            padding: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            boxSizing: "border-box"
        }}>
            <div>
                <h3 style={{ margin: "0 0 5px 0", color: theme.colors.textMain, fontSize: "18px", fontWeight: "700" }}>
                    Expense Distribution Matrix 📊
                </h3>
                <p style={{ margin: "0", color: theme.colors.textMuted, fontSize: "13px" }}>
                    Real-time visual distribution breakdown parsed across structural verified outflow data.
                </p>
            </div>

            {totalExpenseSum === 0 ? (
                <div style={{ color: theme.colors.textMuted, fontSize: "14px", padding: "40px", textAlign: "center" }}>
                   "Expense charts are currently unavailable as there is no verified data to display. Please ensure your financial records are updated to view these insights." 📉
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {chartData.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {/* METADATA ROWS */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                <span style={{ fontWeight: "600", color: theme.colors.textMain }}>
                                    {item.name} <span style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "normal" }}>({item.percentage}%)</span>
                                </span>
                                <span style={{ fontWeight: "700", color: theme.colors.primary }}>
                                    ₹{item.amount.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* DYNAMIC PROGRESS INDICATOR GLOW LINE */}
                            <div style={{ 
                                width: "100%", height: "8px", background: "rgba(0, 0, 0, 0.2)", 
                                borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.02)" 
                            }}>
                                <div style={{
                                    width: `${item.percentage}%`,
                                    height: "100%",
                                    background: `linear-gradient(90deg, ${theme.colors.primary} 0%, #FFA26B 100%)`, // Sleek vibrant orange gradient
                                    borderRadius: "4px",
                                    boxShadow: "0 0 10px rgba(255, 107, 53, 0.3)",
                                    transition: "width 0.5s ease-in-out"
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnalyticsChart;