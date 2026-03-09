// src/components/ui/Overlay.jsx
import React from "react";

export default function Overlay({ children, onCerrar }) {
  return (
    <div
      onClick={onCerrar}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 5000, padding: "24px 16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: "32px 36px",
          boxShadow: "0 16px 56px rgba(0,0,0,0.25)",
          border: "1.5px solid #e5e7eb", width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
