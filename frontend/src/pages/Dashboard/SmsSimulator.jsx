import { useState } from "react";
import { theme } from "../../theme"; //  Theme configurations backup sync
import API from "../../config/api.js"; // Hamara bawal refresh token core interceptor

const SmsSimulator = ({ onSmsProcessed }) => {
    const [isOpen, setIsOpen] = useState(false); // Developer toggle window
    const [smsInput, setSmsInput] = useState({
        smsText: "",
        sender: "ICICIBK" // 🔥 FIXED DEFAULT: BOI hata kar user ke DB se sync 'ICICIBK' kiya!
    });
    const [simulating, setSimulating] = useState(false);

    // 💡 QUICK PRESET TESTING TEMPLATES (User DB ke associatedBanks ['ICIC', 'UTIB'] se 100% sync)
    const testTemplates = [
        {
            label: " ICICI Expense SMS",
            sender: "ICICIBK",
            text: "Dear Customer, Rs.1500.00 debited from AC XXXXXX on 30-05-2026 to Amazon. Info: UPI-Swipe."
        },
        {
            label: " Axis Credit SMS",
            sender: "UTIBNK",
            text: "Money Received! Rs.5000.00 credited to account XX991 via UPI from Devendra on 30-05-2026. Avbl Bal Rs.99800."
        },
        {
            label: " Fraud/10-Digit Mobile Block",
            sender: "9876543210",
            text: "Dear user, your bank account is blocked. Click here to update KYC instantly and save money: http://fake-link.com"
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSmsInput(prev => ({ ...prev, [name]: value }));
    };

    const applyTemplate = (tpl) => {
        setSmsInput({ smsText: tpl.text, sender: tpl.sender });
    };

    //  DISPATCH GATEWAY TO BACKEND SMS PARSER API VIA AXIOS INTERCEPTOR
    const handleSmsSimulationSubmit = async (e) => {
        e.preventDefault();

        if (!smsInput.smsText || !smsInput.sender) {
            alert("Bhai, SMS Text aur Sender ID dono daalna zaroori hai! ⚠️");
            return;
        }

        setSimulating(true);
        try {
            // AXIOS UPGRADE: Purana manual fetch aur token strings ka jhanjhat permanently khatam!
            // Agar token expire hua, toh ye endpoint peeche se chupke se refresh token chala dega!
            const response = await API.post("/transactions/process-sms", {
                smsText: smsInput.smsText,
                sender: smsInput.sender,
                senderId: smsInput.sender,    // Backend data model compatibility checks
                senderName: smsInput.sender
            });

            // Axios mein data direct response.data mein milta hai, .json() nahi karna padta
            const resData = response.data;

            if (resData.success) {
                if (resData.duplicateDetected) {
                    alert(`🚨 Duplicate Entry Guard: ${resData.message}`);
                } else {
                    alert(`🚀 SMS Parsed successfully!\nStatus: ${resData.currentTransaction?.status?.toUpperCase()}\nMessage: ${resData.message}`);
                    setSmsInput(prev => ({ ...prev, smsText: "" })); // Textarea clear kiya
                    
                    // Parent dashboard ko trigger bhejna taaki charts instant reload ho jayein
                    if (onSmsProcessed) await onSmsProcessed();
                }
            }
        } catch (err) {
            // Hamare interceptor se nikla hua global response error catch check
            const errorMsg = err.response?.data?.message || "Security filter block ya network pipeline failure.";
            alert(`❌ Simulation Blocked: ${errorMsg}`);
            console.error("SMS Terminal communication engine status:", err);
        } finally {
            setSimulating(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    width: "100%", padding: "12px", background: "rgba(143, 156, 167, 0.03)",
                    border: `1px dashed ${theme.colors.border}`, color: theme.colors.textMuted,
                    borderRadius: "12px", fontSize: "13px", fontWeight: "600",
                    cursor: "pointer", transition: theme.transitions.smooth, letterSpacing: "0.5px"
                }}
            >
                🛠️ Open Developer SMS Live Terminal Simulator
            </button>
        );
    }

    return (
        <form onSubmit={handleSmsSimulationSubmit} style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            borderRadius: "14px", padding: "25px", display: "flex", flexDirection: "column", gap: "20px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h4 style={{ margin: 0, color: theme.colors.textMain, fontSize: "15px", fontWeight: "700" }}>
                        SMS Terminal Node Simulator
                    </h4>
                    <p style={{ margin: "4px 0 0 0", color: theme.colors.textMuted, fontSize: "12px" }}>
                        Mock incoming bank text packets frontend se hi direct trigger karo bhai.
                    </p>
                </div>
                <button 
                    type="button" onClick={() => setIsOpen(false)}
                    style={{ background: "transparent", border: "none", color: theme.colors.textMuted, cursor: "pointer", fontSize: "13px" }}
                >
                    Hide Terminal ❌
                </button>
            </div>

            {/* PRESET BLUEPRINT TEMPLATES BUTTONS */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {testTemplates.map((tpl, index) => (
                    <button
                        key={index} type="button" onClick={() => applyTemplate(tpl)}
                        style={{
                            padding: "6px 12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textMain, borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer"
                        }}
                    >
                        {tpl.label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {/* SENDER INPUT HEADER */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>SMS SENDER HEADER (ID / PHONE)</label>
                    <input 
                        type="text" name="sender" value={smsInput.sender} onChange={handleInputChange} placeholder="e.g., ICICIBK or UTIBNK"
                        style={{ padding: "10px 12px", background: "rgba(0,0,0,0.15)", border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px" }}
                    />
                </div>

                {/* RAW MESSAGES STREAM TEXTAREA */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: theme.colors.textMuted, fontWeight: "600" }}>RAW TEXT BODY PACKET</label>
                    <textarea 
                        name="smsText" value={smsInput.smsText} onChange={handleInputChange} rows="3" placeholder="Yahan bank format transaction message paste karo bhai..."
                        style={{ padding: "10px 12px", background: "rgba(0,0,0,0.15)", border: `1px solid ${theme.colors.border}`, borderRadius: "8px", color: "#FFF", fontSize: "13px", resize: "none", fontFamily: "monospace" }}
                    />
                </div>
            </div>

            <button 
                type="submit" disabled={simulating}
                style={{
                    padding: "12px", background: "#1F2937", border: `1px solid ${theme.colors.border}`, color: theme.colors.textMain,
                    borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: simulating ? "not-allowed" : "pointer",
                    transition: theme.transitions.smooth
                }}
            >
                {simulating ? "Injecting Message Node..." : "Broadcast Fake SMS Packet 📡"}
            </button>
        </form>
    );
};

export default SmsSimulator;