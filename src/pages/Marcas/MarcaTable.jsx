// src/pages/Marcas/MarcaTable.jsx
import React from "react";

export default function MarcaTable({ items, onEdit, onDelete }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", background: "#f9fafb" }}>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Nombre</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Modelo</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((m) => (
          <tr key={m.marcaId ?? m.id} style={{ transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", color: "#9ca3af", fontSize: "0.9rem" }}>
              #{m.marcaId ?? m.id}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", fontWeight: 600 }}>
              {m.nombre ?? "-"}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", color: m.modelo ? "#374151" : "#c4c4c4" }}>
              {m.modelo ?? "—"}
            </td>
            <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onEdit(m)}
                  title="Editar"
                  style={{
                    background: "#eff6ff", border: "none",
                    borderRadius: 7, padding: "6px 11px",
                    cursor: "pointer", fontSize: "1rem",
                  }}
                >✏️</button>
                <button
                  onClick={() => onDelete(m.marcaId ?? m.id)}
                  title="Eliminar"
                  style={{
                    background: "#fff1f2", border: "none",
                    borderRadius: 7, padding: "6px 11px",
                    cursor: "pointer", fontSize: "1rem",
                  }}
                >🗑️</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}