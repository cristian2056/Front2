// src/pages/Tickets/TicketBadge.jsx
import React from "react";

export default function TicketBadge({ value, map, fontSize = "0.82rem", padding = "3px 10px" }) {
  const style = map[value] ?? { background: "#f3f4f6", color: "#374151" };
  return (
    <span style={{
      ...style,
      borderRadius: 6,
      padding,
      fontSize,
      fontWeight: 600,
      display: "inline-block",
    }}>
      {value ?? "—"}
    </span>
  );
}
