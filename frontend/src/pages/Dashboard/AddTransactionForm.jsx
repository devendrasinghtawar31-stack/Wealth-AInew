import { useState } from "react";
import { theme } from "../../theme"; //  Theme properties sync link
import API from "../../config/api.js"; //  AXIOS INTERCEPTOR UPGRADE: Silent refresh token mechanism link

const AddTransactionForm = ({ onTransactionAdded }) => {
    const [isOpen, setIsOpen] = useState(false); // Toggle layout state
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "expense", // Default fields
        category: "General"
    });
    const [loading, setLoading] = useState(false);

    const categories = ["General", "Food", "Shopping", "Salary", "Investment", "Bills", "Medical"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    //  SUBMIT DATA STREAM TO REAL MONEY API NODE VIA AXIOS INTERCEPTOR
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.amount) {
            alert("Title & Amount Has To Be Filled ⚠️");
            return;
        }

        setLoading(true);
        try {
            //  AXIOS UPGRADE: Token split, manual headers aur localstorage ka jhanjhat permanently khatam!
            const response = await API.post("/transactions", {
                title: formData.title,
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category
            });

            // Axios me response data seedhe 'response.data' me milta hai, response.json() nahi karna padta
            const resData = response.data;

            if (resData.success) {
                setFormData({ title: "", amount: "", type: "expense", category: "General" });
                setIsOpen(false);
                if (onTransactionAdded) await onTransactionAdded();
            }
        } catch (err) {
            // Hamare central api.js interceptor se nikla hua error message filter check
            const errorMsg = err.response?.data?.message || "Data record nahi ho paya. Internal pipeline query fail.";
            console.error("Critical Manual Transaction Insertion Pipeline Error:", err);
            alert(`❌ Entry Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    width: "100%", padding: "14px", background: "rgba(255, 107, 53, 0.04)",
                    border: `1px dashed ${theme.colors.primary}`, color: theme.colors.primary,
                    borderRadius: "12px", fontSize: "14px", fontWeight: "700",
                    cursor: "pointer", transition: theme.transitions.smooth, letterSpacing: "0.5px"
                }}
            >
                ➕ Add Manual Real Money Transaction
            </button>
        );
    }

    return (
        <form onSubmit={handleFormSubmit} style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "20px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, color: theme.colors.textMain, fontSize: "15px", fontWeight: "700" }}>
                    New Real Money Ledger Entry 📝
                </h4>
                <button 
                    type="button" onClick={() => setIsOpen(false)}
                    style={{ background: "transparent", border: "none", color: theme.colors.textMuted, cursor: "pointer", fontSize: "13px" }}
                >
                    Cancel ❌
                </button>
            </div>

            {/* INPUT ELEMENT MATRIX FIELDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>TRANSACTION TITLE</label>
                    <input 
                        type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Chai aur Samosa"
                        style={{ padding: "10px 12px", background: "rgba(0,0,0,0.15)", border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>AMOUNT (INR)</label>
                    <input 
                        type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="₹ Amount"
                        style={{ padding: "10px 12px", background: "rgba(0,0,0,0.15)", border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>FLOW TYPE</label>
                    <select 
                        name="type" value={formData.type} onChange={handleInputChange}
                        style={{ padding: "10px 12px", background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px", cursor: "pointer" }}
                    >
                        <option value="expense"> Expense </option>
                        <option value="income"> Income</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>CATEGORY TAG</label>
                    <select 
                        name="category" value={formData.category} onChange={handleInputChange}
                        style={{ padding: "10px 12px", background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px", cursor: "pointer" }}
                    >
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                type="submit" disabled={loading}
                style={{
                    padding: "12px", background: theme.colors.primary, border: "none", color: "#FFF",
                    borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(255, 107, 53, 0.25)", transition: theme.transitions.smooth
                }}
            >
                {loading ? "Recording Matrix..." : "Add Entry "}
            </button>
        </form>
    );
};

export default AddTransactionForm;