// src/pages/Marcas/MarcaList.jsx
import React from "react";

export default function MarcaList({ items = [], onDelete }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left" }}>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Nombre</th>
          <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={3} style={{ padding: 10, textAlign: "center" }}>
              No hay marcas.
            </td>
          </tr>
        ) : (
          items.map((m) => (
            <tr key={m.marcaId ?? m.id}>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                {m.marcaId ?? m.id}
              </td>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                {m.nombre ?? m.name ?? "-"}
              </td>
              <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                <button onClick={() => onDelete(m.marcaId ?? m.id)}>Eliminar</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
