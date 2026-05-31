import { useState } from "react";
import { theme } from "../../theme";

const TransactionLedger = ({ transactions, refreshDataPool }) => {
    const [updatingId, setUpdatingId] = useState(null);

    const executeManualVerification = async (txId, txObj) => {
        setUpdatingId(txId);
        try {
            const savedToken = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
            const cleanToken = savedToken.startsWith("Bearer ") ? savedToken.split(" ")[1] : savedToken;

            const response = await fetch(`http://localhost:3000/api/transactions/update/${txId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${cleanToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...txObj,
                    type: txObj.type === "pending" ? "expense" : txObj.type
                })
            });

            const resData = await response.json();
            if (response.ok && resData.success) {
                await refreshDataPool();
            } else {
                alert(resData.message || "Verification sync error.");
            }
        } catch (err) {
            console.error("Critical Manual Transaction Mutator Stream Offline:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div style={{
            background: theme.colors.surface, //  THEME SURFACE (#1C232B)
            border: `1px solid ${theme.colors.border}`, //  THEME BORDER (#2C353F)
            borderRadius: "14px",
            padding: "25px"
        }}>
            <h3 style={{ margin: "0 0 5px 0", color: theme.colors.textMain, fontSize: "18px", fontWeight: "700" }}>
                Real-Time Money Stream Ledger Feed 📜
            </h3>
            <p style={{ margin: "0 0 25px 0", color: theme.colors.textMuted, fontSize: "13px" }}>
                Automatic parser matrix mapping live parsing logs from authenticated SMS terminals.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
                {transactions.length === 0 ? (
                    <div style={{ color: theme.colors.textMuted, fontSize: "14px", padding: "30px", textAlign: "center" }}>
                        Bhai, inbox clean hai! Abhi tak koi bank transaction SMS node records nahi mile hain.
                    </div>
                ) : (
                    transactions.map((tx) => {
                        const isUnverified = tx.status === "unverified" || tx.type === "pending";
                        
                        return (
                            <div key={tx._id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                background: isUnverified ? "rgba(255, 107, 53, 0.03)" : "rgba(255,255,255,0.01)",
                                border: isUnverified ? `1px dashed ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                                transition: theme.transitions.smooth
                            }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontWeight: "600", fontSize: "15px", color: theme.colors.textMain }}>
                                            {tx.title || "Transactional Record Feed"}
                                        </span>
                                        {isUnverified && (
                                            <span style={{
                                                fontSize: "9px", fontWeight: "bold", background: "rgba(255, 107, 53, 0.15)",
                                                color: theme.colors.primary, padding: "2px 6px", borderRadius: "4px"
                                            }}>
                                                 UNVERIFIED
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                                        Merchant: <strong style={{ color: theme.colors.textMain }}>{tx.merchant || tx.sender || "Unknown"}</strong> | Category: {tx.category || "General"}
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: 'center', gap: "15px" }}>
                                    <span style={{
                                        fontWeight: "700", fontSize: "16px",
                                        color: tx.type === "income" ? theme.colors.success : theme.colors.primary
                                    }}>
                                        {tx.type === "income" ? "+" : "-"} ₹{tx.amount}
                                    </span>

                                    {isUnverified && (
                                        <button
                                            onClick={() => executeManualVerification(tx._id, tx)}
                                            disabled={updatingId === tx._id}
                                            style={{
                                                padding: "5px 10px", background: "transparent",
                                                border: `1px solid ${theme.colors.primary}`, color: theme.colors.primary,
                                                borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                                cursor: updatingId === tx._id ? "not-allowed" : "pointer",
                                                transition: theme.transitions.smooth
                                            }}
                                        >
                                            {updatingId === tx._id ? "..." : "Verify ✅"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransactionLedger;