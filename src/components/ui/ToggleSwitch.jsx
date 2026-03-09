// src/components/ui/ToggleSwitch.jsx
import React from "react";

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: "pointer",
        background: checked ? "#4c7318" : "#e5e7eb",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: checked ? 20 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}
