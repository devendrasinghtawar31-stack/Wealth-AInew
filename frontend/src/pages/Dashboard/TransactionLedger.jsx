import { useState } from "react";
import { theme } from "../../theme";
import API from "../../config/api";

const TransactionLedger = ({ transactions, refreshDataPool }) => {
    const [updatingId, setUpdatingId] = useState(null);

    const executeManualVerification = async (txId, txObj) => {
        setUpdatingId(txId);
        try {
            // Token interceptor automatically header mein add kar dega
            const response = await API.put(`/transactions/update/${txId}`, {
                ...txObj,
                type: txObj.type === "pending" ? "expense" : txObj.type
            });

            if (response.data && response.data.success) {
                await refreshDataPool();
            } else {
                alert(response.data.message || "Verification sync error.");
            }
        } catch (err) {
            console.error("Critical Manual Transaction Mutator Error:", err);
            alert("Failed to verify. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: "14px", padding: "25px" }}>
            <h3>Real-Time Money Stream Ledger Feed 📜</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                {transactions.map((tx) => (
                    <div key={tx._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", border: `1px solid ${theme.colors.border}` }}>
                        <div>
                            <strong>{tx.title || "Transaction"}</strong><br/>
                            <small>Merchant: {tx.merchant || "Unknown"}</small>
                        </div>
                        <div>
                            <span style={{ color: tx.type === "income" ? theme.colors.success : theme.colors.primary }}>
                                {tx.type === "income" ? "+" : "-"} ₹{tx.amount}
                            </span>
                            {(tx.status === "unverified" || tx.type === "pending") && (
                                <button 
                                    onClick={() => executeManualVerification(tx._id, tx)}
                                    disabled={updatingId === tx._id}
                                >
                                    {updatingId === tx._id ? "..." : "Verify ✅"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionLedger;