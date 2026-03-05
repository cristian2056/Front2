// src/pages/Tickets/TicketTable.jsx
import React from "react";
import TicketBadge from "./TicketBadge";
import { estadoBadge, prioridadBadge } from "./ticketBadges";

export default function TicketTable({ items, onVer }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", background: "#f9fafb" }}>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>#ID</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Título</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Prioridad</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Creado el</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <tr
            key={t.ticketId ?? t.id}
            style={{ transition: "background 0.1s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", color: "#9ca3af", fontSize: "0.9rem" }}>
              #{t.ticketId ?? t.id}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", fontWeight: 600, color: "#232946" }}>
              {t.titulo ?? "-"}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
              <TicketBadge value={t.estado} map={estadoBadge} />
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
              <TicketBadge value={t.prioridad} map={prioridadBadge} />
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", color: "#374151", fontSize: "0.9rem" }}>
              {t.creadoEl ? new Date(t.creadoEl).toLocaleDateString("es-ES") : "—"}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
              <button
                onClick={() => onVer(t)}
                title="Ver detalle"
                style={{
                  background: "#eff6ff", border: "none",
                  borderRadius: 7, padding: "6px 11px",
                  cursor: "pointer", fontSize: "1rem",
                }}
              >
                👁️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
