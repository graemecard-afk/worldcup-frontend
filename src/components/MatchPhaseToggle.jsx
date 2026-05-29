import React from "react";

export default function MatchPhaseToggle({
  matchPhase,
  onLoadGroup,
  onLoadKnockout,
  onLoadAdmin,
}) {
  const baseButton = {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "none",
    color: "#f9fafb",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(37,99,235,0.45)",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "16px",
      }}
    >
      <button
        onClick={onLoadGroup}
        style={{
          ...baseButton,
          background:
            matchPhase === "group"
              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 40%, #3b82f6 100%)"
              : "rgba(71,85,105,0.9)",
        }}
      >
        Load Group Stage matches
      </button>

      <button
        onClick={onLoadKnockout}
        style={{
          ...baseButton,
          background:
            matchPhase === "knockout"
              ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #7c3aed 100%)"
              : "rgba(71,85,105,0.9)",
        }}
      >
        Load Knockout Phase matches
      </button>
      <button
  onClick={onLoadAdmin}
  style={{
    ...baseButton,
    background:
      matchPhase === "admin"
        ? "linear-gradient(135deg, #059669 0%, #047857 40%, #059669 100%)"
        : "rgba(71,85,105,0.9)",
  }}
>
  Admin
</button>
    </div>
  );
}