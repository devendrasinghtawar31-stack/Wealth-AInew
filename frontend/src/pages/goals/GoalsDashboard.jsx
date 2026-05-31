import { useState, useEffect } from "react";
import { theme } from "../../theme";
import API from "../../config/api.js";
import GoalProgressBar from "./GoalProgressBar";
import GoalCreateForm from "./GoalCreateForm";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

const GoalsDashboard = () => {
  const [goalsList, setGoalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [netSavings, setNetSavings] = useState(0);

  // 1. UPDATED: Sirf goals fetch honge (AI call remove kardi)
  const fetchUserGoalsStream = async () => {
    try {
      setLoading(true);
      const goalsResponse = await API.get("/goals/all-goals");
      setGoalsList(goalsResponse.data?.data || []);
    } catch (err) {
      console.error("Goals extraction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. AI Advice (Sirf button click par chalega)
  const fetchAiAdvice = async () => {
    try {
      const res = await API.post("/ai/advice", { context: "manual_refresh" });
      const income = res.data?.totalIncomeCalculated || 0;
      const expense = res.data?.totalExpenseCalculated || 0;
      setNetSavings(income - expense);
      alert("AI Insights Updated!");
    } catch (err) {
      alert("AI limit reached or Server error. Try later.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await API.delete(`/goals/delete/${goalId}`);
      fetchUserGoalsStream();
    } catch (err) {
      alert("Server issue while deleting.");
    }
  };

  useEffect(() => {
    fetchUserGoalsStream();
  }, []);

  return (
    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      <div>
        <h2 style={{ margin: "0", color: "#FFF", fontSize: "22px" }}>Milestone Target Trackers</h2>
        <button onClick={fetchAiAdvice} style={{ marginTop: "10px", background: "#FF6B35", color: "#FFF", border: "none", padding: "5px 15px", borderRadius: "5px", cursor: "pointer" }}>
          Refresh AI Insights
        </button>
      </div>

      <GoalCreateForm onGoalCreated={fetchUserGoalsStream} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
        {loading ? (
          <div>Loading goals...</div>
        ) : goalsList.length === 0 ? (
          <div>No goals found. Create one to start!</div>
        ) : (
          goalsList.map((goal) => {
            const remaining = goal.targetAmount - goal.currentSaved;
            const chartData = [
              { name: "Start", bachat: 0 },
              { name: "Current", bachat: goal.currentSaved },
              { name: "Target", bachat: goal.targetAmount },
            ];

            return (
              <div key={goal._id} style={{ background: theme.colors.surface, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#FF9F1C", fontSize: "12px" }}>{remaining > 0 ? `Remaining: ₹${remaining}` : "🎉 Target Achieved!"}</span>
                  <button onClick={() => handleDeleteGoal(goal._id)} style={{ color: "#FF4B4B", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                </div>

                <GoalProgressBar goal={goal} onProgressUpdated={fetchUserGoalsStream} />

                {/* Fixed height and position for Recharts */}
                <div style={{ width: "100%", height: "120px", position: "relative", marginTop: "15px" }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name" stroke={theme.colors.textMuted} fontSize={9} />
                      <Tooltip />
                      <Area type="monotone" dataKey="bachat" stroke="#FF6B35" fill="rgba(255, 107, 53, 0.12)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalsDashboard;