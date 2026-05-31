import { useState } from "react";
import { theme } from "../../theme";
import API from "../../config/api";

const GoalCreateForm = ({ onGoalCreated }) => {
  const [isOpen, setIsOpen] = useState(false); // Modal toggle status
  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    currentSaved: "", //  1. INITIAL SAVINGS KEY REGISTERED HERE
    targetDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  DISPATCH MATRIX TO BACKEND GOALS API
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.goalName || !formData.targetAmount) {
      alert("Bhai, Goal ka Naam aur Target Amount likhna zaroori hai! ⚠️");
      return;
    }

    setLoading(true);
    try {
      // Backend Controller model compatibility mappings
      const response = await API.post("/goals/create", {
        goalName: formData.goalName,
        targetAmount: Number(formData.targetAmount),
        //  2. PASSING INITIAL SAVINGS TO PROGRESS ENGINE (Default is 0 if empty)
        currentSaved: Number(formData.currentSaved) || 0, 
        targetDate: formData.targetDate || undefined,
      });

      if (response.data.success) {
        alert(` ${response.data.message}`);
        // Reset all values including currentSaved
        setFormData({ goalName: "", targetAmount: "", currentSaved: "", targetDate: "" }); 
        setIsOpen(false); // Close container
        if (onGoalCreated) await onGoalCreated(); // Parent component refresh trigger
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Unable to process your goal. Please allow a moment for our systems to sync your data.";
      console.error("Critical Goals Target Entry Interrupted:", err);
      alert(`❌ Entry Blocked: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%",
          padding: "14px",
          background: "rgba(46, 196, 182, 0.05)",
          border: `1px dashed ${theme.colors.success || "#2EC4B6"}`,
          color: theme.colors.success || "#2EC4B6",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
          transition: theme.transitions.smooth,
          letterSpacing: "0.5px",
        }}
      >
         Set New Financial Target Goal
      </button>
    );
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "14px",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            margin: 0,
            color: theme.colors.textMain,
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          Target Milestone Settings 
        </h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: theme.colors.textMuted,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Cancel ❌
        </button>
      </div>

      {/*  GRID LAYOUT UPGRADED: Expanded to 4 columns on larger grids dynamically */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
        }}
      >
        {/* GOAL NAME INPUT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "11px",
              color: theme.colors.textMuted,
              fontWeight: "600",
            }}
          >
            WHAT ARE YOU SAVING FOR?
          </label>
          <input
            type="text"
            name="goalName"
            value={formData.goalName}
            onChange={handleInputChange}
            placeholder="e.g., Laptop, Bullet Bike"
            style={{
              padding: "10px 12px",
              background: "rgba(0,0,0,0.15)",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              color: "#FFF",
              fontSize: "13px",
            }}
          />
        </div>

        {/* TARGET AMOUNT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "11px",
              color: theme.colors.textMuted,
              fontWeight: "600",
            }}
          >
            TARGET AMOUNT (INR)
          </label>
          <input
            type="number"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleInputChange}
            placeholder="₹ Target Amount"
            style={{
              padding: "10px 12px",
              background: "rgba(0,0,0,0.15)",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              color: "#FFF",
              fontSize: "13px",
            }}
          />
        </div>

        {/* 🆕 3. NEW ELEMENT: INITIAL/CURRENT SAVINGS FIELD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "11px",
              color: theme.colors.textMuted,
              fontWeight: "600",
            }}
          >
            Current Savings for this Goal? (INR)
          </label>
          <input
            type="number"
            name="currentSaved"
            value={formData.currentSaved}
            onChange={handleInputChange}
            placeholder="₹ Current Money Saved for this Goal (Optional)"
            style={{
              padding: "10px 12px",
              background: "rgba(0,0,0,0.15)",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              color: "#FFF",
              fontSize: "13px",
            }}
          />
        </div>

        {/* TARGET DATE PICKER */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "11px",
              color: theme.colors.textMuted,
              fontWeight: "600",
            }}
          >
            TARGET DEADLINE DATE
          </label>
          <input
            type="date"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleInputChange}
            style={{
              padding: "9px 12px",
              background: "rgba(0,0,0,0.15)",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              color: "#FFF",
              fontSize: "13px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          background: "linear-gradient(135deg, #2EC4B6 0%, #1B9AAA 100%)",
          border: "none",
          color: "#FFF",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "700",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 15px rgba(46, 196, 182, 0.2)",
          transition: theme.transitions.smooth,
        }}
      >
        {loading
          ? "Locking Milestone Target..."
          : "Activate Financial Target Node "}
      </button>
    </form>
  );
};

export default GoalCreateForm;