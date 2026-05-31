import { theme } from "../../../theme";
import ChatWindow from "./ChatWindow";


const AiChatDashboard = () => {
    return (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            <div>
                <h2 style={{ margin: "0 0 5px 0", color: "#FFF", fontSize: "22px", fontWeight: "700" }}>
                    AI Financial Advisor Terminal 🤖
                </h2>
                <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "13px" }}>
                    "Our AI automatically analyzes your real-time cash balance, linked bank accounts, and active financial goals. For any insights or guidance, feel free to ask!"
                </p>
            </div>

            {/* MOUNTING THE CHAT COMPONENT ENGINE */}
            <ChatWindow />
        </div>
    );
};

export default AiChatDashboard;