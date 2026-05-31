import { useState, useEffect } from "react";
import { theme } from "../../theme";
import API from "../../config/api";
import GoalProgressBar from "./GoalProgressBar";
import GoalCreateForm from "./GoalCreateForm";

//  RECHARTS KE MODULES IMPORT LINK MATRIX
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

const GoalsDashboard = () => {
  const [goalsList, setGoalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [netSavings, setNetSavings] = useState(0);

  //  1. STREAM DATA PIPELINE FETCH
  const fetchUserGoalsStream = async () => {
    try {
      const [goalsResponse, financeResponse] = await Promise.all([
        API.get("/goals/all-goals").catch(() => ({ data: { data: [] } })),
        API.get("/ai/advice").catch(() => ({
          data: { totalIncomeCalculated: 0, totalExpenseCalculated: 0 },
        })),
      ]);

      setGoalsList(goalsResponse.data?.data || []);

      const income = financeResponse.data?.totalIncomeCalculated || 0;
      const expense = financeResponse.data?.totalExpenseCalculated || 0;
      setNetSavings(income - expense);
    } catch (err) {
      console.error("Goals extraction network pipe failure:", err);
    } finally {
      setLoading(false);
    }
  };

  //  2. CORRECTED SCOPE: HANDLE DELETE GOAL IS NOW MAIN MATRIX NODE
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are You Sure , Want To Delete The Goal? ⚠️")) return;

    try {
      const response = await API.delete(`/goals/delete/${goalId}`);
      if (response.data?.success) {
        alert(response.data.message);
        fetchUserGoalsStream(); // List automatic refresh engine dispatch
      }
    } catch (err) {
      console.error("Goal deletion pipeline blocked:", err);
      alert("❌ Goal can't be deleted ,server issue.");
    }
  };

  useEffect(() => {
    fetchUserGoalsStream();
  }, []);

  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        width: "100%",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 5px 0",
            color: "#FFF",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Milestone Target Trackers
        </h2>
        <p
          style={{ margin: 0, color: theme.colors.textMuted, fontSize: "13px" }}
        >
          Set your financial targets and track how closely your real-time
          balance aligns with your goals.
        </p>
      </div>

      {/* FORM MATRIX MODAL DOCK */}
      <GoalCreateForm onGoalCreated={fetchUserGoalsStream} />

      {/* ACTIVE GOALS PROGRESS MONITOR TRACK GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
        }}
      >
        {loading ? (
          <div style={{ color: theme.colors.textMuted, fontSize: "13px" }}>
            Assembling target tracking blocks...
          </div>
        ) : goalsList.length === 0 ? (
          <div
            style={{
              color: theme.colors.textMuted,
              fontSize: "13px",
              padding: "20px",
              gridColumn: "1/-1",
            }}
          >
            You haven't set any financial goals yet. Create a new target
            milestone to get started!
          </div>
        ) : (
          goalsList.map((goal) => {
            const remaining = goal.targetAmount - goal.currentSaved;

            let timelineMessage = "";
            if (remaining <= 0) {
              timelineMessage = "🎉 Target Achieved!";
            } else if (netSavings <= 0) {
              timelineMessage =
                "Budget Alert: Current spending levels may delay your progress. Consider increasing your savings to stay on target.";
            } else {
              const months = Math.ceil(remaining / netSavings);
              timelineMessage = `At your current savings rate, you will reach this goal in ${months} months.`;
            }

            const chartData = [
              { name: "Start", bachat: 0 },
              { name: "Current", bachat: goal.currentSaved },
              { name: "Target", bachat: goal.targetAmount },
            ];

            return (
              <div
                key={goal._id}
                style={{
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative", // For design flexibility
                }}
              >
                {/* TOP CONTROLLER ROW WITH INTEGRATED TRASH ROUTE */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#FF9F1C",
                      fontFamily: "monospace",
                    }}
                  >
                    {timelineMessage}
                  </div>

                  {/*  THE TRASH ACTUATOR BUTTON MOUNTED HERE */}
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    style={{
                      background: "rgba(255, 75, 75, 0.08)",
                      border: "1px solid rgba(255, 75, 75, 0.25)",
                      color: "#FF4B4B",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "rgba(255, 75, 75, 0.18)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "rgba(255, 75, 75, 0.08)")
                    }
                  >
                    Delete
                  </button>
                </div>

                {/*  YOUR CURRENT PROGRESS BAR INJECTION */}
                <GoalProgressBar
                  goal={goal}
                  onProgressUpdated={fetchUserGoalsStream}
                />

                {/*  FUTURISTIC AREA WAVE CHART DOCK */}
                <div
                  style={{
                    width: "100%",
                    height: "100px",
                    background: "rgba(0,0,0,0.15)",
                    borderRadius: "10px",
                    padding: "8px",
                    marginTop: "5px",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        stroke={theme.colors.textMuted}
                        fontSize={9}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: theme.colors.surface,
                          border: `1px solid ${theme.colors.border}`,
                          color: "#FFF",
                          fontSize: "11px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="bachat"
                        stroke="#FF6B35"
                        fill="rgba(255, 107, 53, 0.12)"
                        strokeWidth={2}
                      />
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
