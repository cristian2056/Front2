// src/pages/Seguridad/constants.js
// Colores, acciones y helpers de estilo compartidos en el módulo de Seguridad

export const C = {
  primary:       "#4c7318",
  primaryHover:  "#3e5b19",
  primaryLight:  "#f0f7e6",
  primaryBorder: "#c3dfa0",
  danger:        "#dc2626",
  dangerLight:   "#fee2e2",
  blue:          "#2563eb",
  blueLight:     "#eff6ff",
  gray50:        "#f9fafb",
  gray100:       "#f3f4f6",
  gray200:       "#e5e7eb",
  gray400:       "#9ca3af",
  gray600:       "#4b5563",
  gray700:       "#374151",
  gray900:       "#111827",
  white:         "#ffffff",
};

export const ACCIONES = [
  { key: "leer",      label: "Leer",      color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "crear",     label: "Crear",     color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "modificar", label: "Modificar", color: "#ca8a04", bg: "#fefce8", border: "#fde68a" },
  { key: "eliminar",  label: "Eliminar",  color: "#dc2626", bg: "#fff1f2", border: "#fecaca" },
];

export const btnSt = (extra = {}) => ({
  border: "none", borderRadius: 8, cursor: "pointer",
  fontWeight: 700, fontSize: "0.88rem", padding: "8px 16px",
  display: "inline-flex", alignItems: "center", gap: 6,
  transition: "background 0.15s",
  ...extra,
});

export const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${C.gray200}`, fontSize: "0.93rem",
  boxSizing: "border-box", outline: "none", color: C.gray900, background: C.white,
};

export const thSt = (extra = {}) => ({
  padding: "10px 14px", background: C.gray50,
  borderBottom: `2px solid ${C.gray200}`,
  fontWeight: 700, fontSize: "0.82rem", color: C.gray600,
  whiteSpace: "nowrap", ...extra,
});

export const tdSt = (extra = {}) => ({
  padding: "11px 14px", borderBottom: `1px solid ${C.gray100}`,
  fontSize: "0.9rem", color: C.gray900, ...extra,
});

export const labelSt = {
  display: "block", fontWeight: 600, marginBottom: 6,
  fontSize: "0.88rem", color: C.gray700,
};
