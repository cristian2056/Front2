// src/components/ui/CheckboxUI.jsx
import React from "react";

export default function CheckboxUI({ checked, indeterminate, onClick, color = "#4c7318" }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 20, height: 20, borderRadius: 5,
        cursor: onClick ? "pointer" : "default",
        border: `2px solid ${checked || indeterminate ? color : "#e5e7eb"}`,
        background: checked ? color : indeterminate ? `${color}22` : "#fff",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", flexShrink: 0, margin: "0 auto",
      }}
    >
      {checked && (
        <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 900, lineHeight: 1 }}>✓</span>
      )}
      {!checked && indeterminate && (
        <span style={{ color, fontSize: "0.85rem", fontWeight: 900, lineHeight: 1 }}>−</span>
      )}
    </div>
  );
}
