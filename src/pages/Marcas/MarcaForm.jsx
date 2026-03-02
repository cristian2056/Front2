// src/pages/Marcas/MarcaForm.jsx
import React, { useState } from "react";

// ─── Colores Lima ────────────────────────────────────────────────────────────
const COLOR = {
  primary: "#4c7318",       // lima-700: botón guardar
  primaryHover: "#3e5b19",  // lima-800: hover guardar
  disabled: "#9ca3af",      // gris: cuando está cargando
};

export default function MarcaForm({ initialData = {}, onSubmit, loading, onCancel }) {
  const [nombre, setNombre] = useState(initialData.nombre || "");
  const [modelo, setModelo] = useState(initialData.modelo || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ nombre, modelo: modelo.trim() || null });
  };

  // Estilo base compartido para los inputs
  const inputStyle = {
    width: "100%", padding: "10px 12px",
    borderRadius: 9, border: "1.5px solid #d1d5db",
    fontSize: "0.97rem", boxSizing: "border-box",
    outline: "none", background: "#fff", color: "#111",
  };

  return (
    // ── Overlay oscuro ──────────────────────────────────────────────────────
    // Cubre toda la pantalla y centra la tarjeta del formulario
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 3000,
    }}>

      {/* ── Tarjeta del formulario ───────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "36px 40px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
        border: "2px solid #e5e7eb",
      }}>

        {/* Título: cambia según si es nueva o edición */}
        <h3 style={{
          margin: "0 0 24px",
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#232946",
          textAlign: "center",
        }}>
          {initialData.marcaId ? "✏️ Editar marca" : "➕ Nueva marca"}
        </h3>

        <form onSubmit={handleSubmit}>

          {/* ── Campo Nombre ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>
              Nombre <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Samsung"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* ── Campo Modelo ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>
              Modelo <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Galaxy S23"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* ── Botones ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 10 }}>

            {/* Cancelar: borde gris, fondo blanco */}
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 9,
                border: "1.5px solid #d1d5db", background: "#fff",
                fontWeight: 600, fontSize: "0.97rem",
                cursor: "pointer", color: "#374151",
              }}
            >
              Cancelar
            </button>

            {/* Guardar: lima-700, se oscurece con hover */}
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 9,
                border: "none",
                background: loading ? COLOR.disabled : COLOR.primary,
                color: "#fff", fontWeight: 700,
                fontSize: "0.97rem",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = COLOR.primaryHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = COLOR.primary; }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
