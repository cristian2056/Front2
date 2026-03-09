// src/components/ui/Spinner.jsx
import React from "react";

export default function Spinner({ color = "#4c7318" }) {
  return (
    <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px",
        border: "3px solid #e5e7eb", borderTop: `3px solid ${color}`,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Cargando...
    </div>
  );
}
