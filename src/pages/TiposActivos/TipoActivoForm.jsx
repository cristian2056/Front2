// src/pages/TiposActivos/TipoActivoForm.jsx
import React, { useState } from "react";
import Overlay from "../../components/ui/Overlay";

const C = { primary: "#4c7318", primaryHover: "#3e5b19" };
const inputSt = {
  width: "100%", padding: "10px 12px", borderRadius: 9,
  border: "1.5px solid #d1d5db", fontSize: "0.97rem",
  boxSizing: "border-box", outline: "none", background: "#fff",
};
const labelSt = { display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" };

export default function TipoActivoForm({ initialData = {}, onSubmit, loading, onCancel }) {
  const [nombre, setNombre] = useState(initialData.nombre ?? "");

  return (
    <Overlay onCerrar={onCancel}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h3 style={{ margin: "0 0 24px", fontSize: "1.2rem", fontWeight: 800, color: "#232946", textAlign: "center" }}>
          {initialData.tipoActivoId ? "✏️ Editar tipo de activo" : "➕ Nuevo tipo de activo"}
        </h3>

        <form onSubmit={e => { e.preventDefault(); onSubmit({ nombre: nombre.trim() }); }}>
          <div style={{ marginBottom: 28 }}>
            <label style={labelSt}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="text" required
              placeholder="Ej: Laptop, Impresora, Monitor..."
              value={nombre} onChange={e => setNombre(e.target.value)}
              style={inputSt}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: "10px 0", borderRadius: 9,
              border: "1.5px solid #d1d5db", background: "#fff",
              fontWeight: 600, cursor: "pointer", color: "#374151",
            }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
              background: loading ? "#9ca3af" : C.primary,
              color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.primaryHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.primary; }}
            >{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
