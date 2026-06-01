import { useState, useEffect } from "react";
import { theme } from "../../theme"; //  Theme properties config sync
import MetricCards from "./MetricCards.jsx"; //  Summary cards connector
import TransactionLedger from "./TransactionLedger.jsx"; //  Live ledger list
import AddTransactionForm from "./AddTransactionForm.jsx"; //  Manual data insertion form
import SmsSimulator from "./SmsSimulator.jsx"; // Connected device simulator
import API from "../../config/api.js"; //  AXIOS INTERCEPTOR UPGRADE: Silent refresh integration link
import AnalyticsChart from "./AnalyticsChart.jsx";
import { useOutletContext } from "react-router-dom";


const FinancialDashboard = () => {
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [componentLoading, setComponentLoading] = useState(true);
    const { isDarkMode } = useOutletContext();
    
    // 👑 THE GATEKEEPER STATE: Iski wajah se normal user ko terminal nahi dikhega
    const [showDevTools, setShowDevTools] = useState(false);

    // 🛰️ UNIFIED FINANCIAL PIPELINE STREAM FETCH
    const fetchFinancialDataMatrix = async () => {
        try {
            //  AXIOS UPGRADE: Purana localStorage se manual token nikalne aur Bearer headers chipkane ka loop permanently khatam!
            // `api.js` ab har request par fresh token khud laga dega.
            const [statsRes, listRes] = await Promise.all([
                API.get("/transactions"),
                API.get("/transactions/all")
            ]);

            // Axios khud JSON ko object mein parse kar deta hai, isiliye `.json()` karne ki bhee zarurat nahi hai!
            const statsData = statsRes.data;
            const listData = listRes.data;

            if (statsData.success) {
                setStats({
                    totalIncome: statsData.data.totalIncome,
                    totalExpense: statsData.data.totalExpense,
                    netBalance: statsData.data.netBalance
                });
            }

            if (listData.success) {
                setTransactions(listData.data);
            }

        } catch (err) {
            console.error("❌ Critical FinTech Node Data Retrieval Interrupted:", err);
            // Global custom token redirection interceptor already hooks authentication failures
        } finally {
            setComponentLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialDataMatrix();
    }, []);

    if (componentLoading) {
        return (
            <div style={{ color: theme.colors.textMuted, fontSize: "14px", padding: "20px", textAlign: "center" }}>
                Syncing real-time ledger records and transaction matrices...
            </div>
        );
    }

    return (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* TOP BAR WITH PROFESSIONAL HIDDEN DEV TOGGLE BUTTON */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ color: theme.colors.textMuted, fontSize: "12px" }}>
                    Securely monitoring financial analytical node feeds and transaction models.
                </div>
                
                {/* PROFESSIONAL INLINE DEV LIGHT BUTTON */}
                <button 
                    onClick={() => setShowDevTools(!showDevTools)}
                    style={{
                        padding: "6px 12px",
                        background: showDevTools ? "rgba(255, 107, 53, 0.1)" : "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${showDevTools ? theme.colors.primary : theme.colors.border}`,
                        color: showDevTools ? theme.colors.primary : theme.colors.textMuted,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: theme.transitions.smooth
                    }}
                >
                    {showDevTools ? "🔒 Disable Dev Mode" : "🛠️ Enable Dev Mode"}
                </button>
            </div>

            {/*  1. LIVE SUMMARY CARDS */}
            <MetricCards stats={stats} />

            {/*  2. MANUAL ADD FORM CONTROLLER */}
            <AddTransactionForm onTransactionAdded={fetchFinancialDataMatrix} />

            {/*  3. DYNAMIC GRAPH INDICATORS MODULE PLACEHOLDER */}
            {/* Yahan aapka analytics graph automatic safe integration pe baddha rahega */}

            <AnalyticsChart transactions={transactions} />

            {/*  4. DEVELOPER TESTING DOCK: Conditional render gate mapping */}
            {showDevTools && (
                <SmsSimulator onSmsProcessed={fetchFinancialDataMatrix} />
            )}

            {/*  5. INTERACTIVE REAL MONEY LIVE LEDGER FEED */}
            <TransactionLedger 
                transactions={transactions}
                refreshDataPool={fetchFinancialDataMatrix}
            />
        </div>
    );
};

export default FinancialDashboard;