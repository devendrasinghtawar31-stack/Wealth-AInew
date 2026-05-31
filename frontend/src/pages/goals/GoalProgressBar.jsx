import { useState } from "react";
import { theme } from "../../theme";
import API from "../../config/api.js";

const GoalProgressBar = ({ goal, onProgressUpdated }) => {
    const [updating, setUpdating] = useState(false);
    const [savedInput, setSavedInput] = useState(goal.currentSaved || 0);

    const calcPercentage = goal.targetAmount > 0 ? Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100) : 0;

    const handleProgressChangeSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await API.put(`/goals/update-progress/${goal._id}`, {
                currentSaved: Number(savedInput)
            });

            if (response.data.success) {
                alert(` Progress Matrix Updated: ${response.data.message}`);
                if (onProgressUpdated) await onProgressUpdated();
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Progress sync failed.";
            alert(`❌ Sync Interrupted: ${msg}`);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h4 style={{ margin: "0 0 4px 0", color: theme.colors.textMain, fontSize: "15px", fontWeight: "700" }}>
                        {goal.goalName}
                    </h4>
                    <span style={{
                        fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px",
                        background: goal.status === "achieved" ? "rgba(46, 196, 182, 0.15)" : "rgba(255, 159, 28, 0.15)",
                        color: goal.status === "achieved" ? theme.colors.success : "#FF9F1C", textTransform: "uppercase"
                    }}>
                        {goal.status}
                    </span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: theme.colors.primary }}>
                        ₹{goal.currentSaved?.toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                        {" "} / ₹{goal.targetAmount?.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>

            {/* DYNAMIC PROGRESS LINE MATRIX */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                        width: `${calcPercentage}%`, height: "100%",
                        background: goal.status === "achieved" ? "linear-gradient(90deg, #2EC4B6 0%, #1B9AAA 100%)" : `linear-gradient(90deg, ${theme.colors.primary} 0%, #FF9F1C 100%)`,
                        borderRadius: "4px", boxShadow: "0 0 10px rgba(255,107,53,0.2)", transition: "width 0.4s ease-out"
                    }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.colors.textMuted }}>
                    <span>Progress Hub</span>
                    <span style={{ fontWeight: "700", color: theme.colors.textMain }}>{calcPercentage}%</span>
                </div>
            </div>

            {/* INLINE QUICK UPDATER DRAWER */}
            <form onSubmit={handleProgressChangeSubmit} style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "5px" }}>
                <input 
                    type="number" value={savedInput} onChange={(e) => setSavedInput(e.target.value)} placeholder="Update savings"
                    style={{ flex: 1, padding: "6px 10px", background: "rgba(0,0,0,0.1)", border: `1px solid ${theme.colors.border}`, borderRadius: "6px", color: "#FFF", fontSize: "12px" }}
                />
                <button 
                    type="submit" disabled={updating}
                    style={{
                        padding: "7px 12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textMain, borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer"
                    }}
                >
                    {updating ? "Syncing..." : "Update Progress "}
                </button>
            </form>
        </div>
    );
};

export default GoalProgressBar;