import { useState, useRef, useEffect } from "react";
import { theme } from "../../../theme";
import API from "../../../config/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Devendra bhai, Welcome to Wealth AI Advisor Terminal. Kya gyan chahiye aaj? 🧠",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  GOAL UPDATE & DEDUCTION ACTION DISPATCHER
  const executeGoalAction = async (goalName, operator, amount) => {
    setLoading(true);
    try {
      const goalsRes = await API.get("/goals/all-goals");
      const activeGoals = goalsRes.data?.data || [];

      // Safe match ignoring extra spaces and case
      const cleanGoalName = goalName.trim().toLowerCase();
      const matchedGoal = activeGoals.find(
        (g) =>
          g.goalName.toLowerCase().includes(cleanGoalName) ||
          cleanGoalName.includes(g.goalName.toLowerCase()),
      );

      if (!matchedGoal) {
        alert(
          `Bhai, "${goalName}" naam ka koi active goal nahi mila platform par! ⚠️`,
        );
        return;
      }

      // DYNAMIC OPERATOR PROCESSING MATRIX
      let newTotal = matchedGoal.currentSaved;
      if (operator === "-") {
        newTotal = matchedGoal.currentSaved - Number(amount);
        if (newTotal < 0) newTotal = 0; // Negative guard lock
      } else {
        newTotal = matchedGoal.currentSaved + Number(amount);
      }

      const response = await API.put(
        `/goals/update-progress/${matchedGoal._id}`,
        {
          currentSaved: newTotal,
        },
      );

      if (response.data?.success) {
        const actionMsg = operator === "-" ? "minus" : "add";
        alert(
          `Success! ₹${amount} has been ${actionMsg} towards your ${matchedGoal.goalName} goal.`,
        );

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `✅ System Node Synced: ${matchedGoal.goalName} progress set to ₹${newTotal}!`,
            isBot: true,
            isSystemLog: true,
          },
        ]);
      }
    } catch (err) {
      console.error("AI Action Executer Crash:", err);
      // alert("❌ Action block failed! Check console nodes.");
    } finally { 
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userPrompt, isBot: false },
    ]);
    setLoading(true);

    try {
      const response = await API.post(
        `/ai/advice?prompt=${encodeURIComponent(userPrompt)}`,
      );
      const botReply = response.data?.reply || response.data?.analysis;

      if (botReply) {
        //  IRON-CLAD REGEX ESCAPING MATRIX
        const actionRegex =
          /\[ACTION:UPDATE_GOAL\|name:(.*?)\|operator:(.*?)\|amount:(.*?)\]/;
        const match = botReply.match(actionRegex);

        let cleanText = botReply;
        let actionData = null;

        // CRASH GUARD LOCK: Checking if match structure is 100% valid before trimming
        if (match && match[1] && match[2] && match[3]) {
          cleanText = botReply.replace(actionRegex, "").trim(); // Clear meta logs from UI text
          actionData = {
            goalName: match[1].trim(),
            operator: match[2].trim(), // + ya -
            amount: match[3].trim(),
          };
        } else {
          // Agar full tag match nahi hua toh safe clean up (just in case incomplete tag aaye)
          cleanText = botReply.replace(actionRegex, "").trim();
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: cleanText,
            isBot: true,
            action: actionData,
          },
        ]);
      }
    } catch (err) {
      console.error("AI Terminal Network Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "❌ Connection timeout! System mesh.",
          isBot: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "16px",
        height: "550px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* TERMINAL HEADER */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${theme.colors.border}`,
          background: "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            background: "#2EC4B6",
            borderRadius: "50%",
            boxShadow: "0 0 10px #2EC4B6",
          }}
        />
        <h4
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "700",
            color: "#FFF",
            fontFamily: "monospace",
          }}
        >
          WEALTH_AI_ACTION_CORE_v2.5 🤖
        </h4>
      </div>

      {/* MESSAGES VIEWPORT */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.isBot ? "flex-start" : "flex-end",
              maxWidth: "75%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* TEXT BUBBLE */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "13px",
                lineHeight: "1.5",
                fontWeight: "500",
                background: msg.isSystemLog
                  ? "rgba(46, 196, 182, 0.1)"
                  : msg.isBot
                    ? "rgba(255,255,255,0.03)"
                    : "linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)",
                border: msg.isSystemLog
                  ? "1px solid rgba(46, 196, 182, 0.3)"
                  : msg.isBot
                    ? `1px solid ${theme.colors.border}`
                    : "none",
                color: msg.isSystemLog ? "#2EC4B6" : "#FFF",
              }}
            >
              {msg.text}
            </div>

            {/* 🎯 2. UPGRADED DYNAMIC ACTION CARD RENDER DOCK (Deduct = Red, Add = Green) */}
            {msg.isBot && msg.action && (
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border:
                    msg.action.operator === "-"
                      ? "1px dashed #FF4B4B"
                      : "1px dashed #2EC4B6",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: theme.colors.textMuted,
                    fontWeight: "600",
                    fontFamily: "monospace",
                  }}
                >
                  🧠 SUGGESTED PLATFORM ACTION:
                </span>
                <div
                  style={{ fontSize: "12px", color: "#FFF", fontWeight: "600" }}
                >
                  {msg.action.operator === "-" ? "Remove" : "Add"}{" "}
                  <span
                    style={{
                      color:
                        msg.action.operator === "-" ? "#FF4B4B" : "#2EC4B6",
                    }}
                  >
                    ₹{msg.action.amount}
                  </span>{" "}
                  {msg.action.operator === "-" ? "from" : "into"}{" "}
                  <span style={{ color: "#FF9F1C" }}>
                    {msg.action.goalName}
                  </span>{" "}
                  milestone?
                </div>
                <button
                  onClick={() =>
                    executeGoalAction(
                      msg.action.goalName,
                      msg.action.operator,
                      msg.action.amount,
                    )
                  }
                  style={{
                    padding: "8px 12px",
                    background:
                      msg.action.operator === "-" ? "#FF4B4B" : "#2EC4B6", // Red for minus, green for plus
                    border: "none",
                    color: "#FFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Confirm {msg.action.operator === "-" ? "Deduct" : "Update"}{" "}
                  Node ✅
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              color: theme.colors.textMuted,
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
             Parsing syntax rules & fetching intent logs...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT TERMINAL */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "16px",
          borderTop: `1px solid ${theme.colors.border}`,
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="e.g., 'bhai bullet bike me 5000 jodo' ya 'bullet se 2000 kam kardo'"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "rgba(0,0,0,0.2)",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "10px",
            color: "#FFF",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0 24px",
            background: "#2EC4B6",
            border: "none",
            color: "#FFF",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Send 🚀
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
