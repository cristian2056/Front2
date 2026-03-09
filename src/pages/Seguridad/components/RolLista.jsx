// src/pages/Seguridad/components/RolLista.jsx
import React from "react";
import { C, btnSt } from "../constants";

export default function RolLista({ roles, rolId, onSelect, onEditar, onEliminar }) {
  return (
    <div style={{
      width: 290, flexShrink: 0, background: C.white, borderRadius: 14,
      border: `1px solid ${C.gray200}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      {/* Cabecera */}
      <div style={{
        padding: "13px 18px", borderBottom: `1px solid ${C.gray200}`,
        background: C.gray50, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 700, color: C.gray700, fontSize: "0.9rem" }}>Roles del sistema</span>
        <span style={{
          background: C.primaryLight, color: C.primary,
          borderRadius: 20, padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700,
        }}>
          {roles.length}
        </span>
      </div>

      {roles.length === 0 && (
        <div style={{ padding: "32px 18px", textAlign: "center", color: C.gray400, fontSize: "0.87rem" }}>
          Sin roles. Creá el primero.
        </div>
      )}

      {roles.map(rol => {
        const activo = rolId === rol.rolId;
        return (
          <div
            key={rol.rolId}
            onClick={() => onSelect(rol.rolId)}
            style={{
              padding: "13px 18px", borderBottom: `1px solid ${C.gray100}`,
              cursor: "pointer", transition: "all 0.15s",
              background: activo ? C.primaryLight : C.white,
              borderLeft: activo ? `4px solid ${C.primary}` : "4px solid transparent",
            }}
            onMouseEnter={e => { if (!activo) e.currentTarget.style.background = C.gray50; }}
            onMouseLeave={e => { if (!activo) e.currentTarget.style.background = C.white; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: C.gray900, marginBottom: 2 }}>
                  {rol.nombre}
                </div>
                <div style={{ fontSize: "0.78rem", color: C.gray400, marginBottom: 6 }}>
                  {rol.descripcion || "Sin descripción"}
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                  background: rol.activo !== false ? C.primaryLight : C.gray100,
                  color:      rol.activo !== false ? C.primary      : C.gray400,
                }}>
                  {rol.activo !== false ? "● Activo" : "○ Inactivo"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={e => { e.stopPropagation(); onEditar(rol); }}
                  style={btnSt({ background: C.blueLight, color: C.blue, padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem" })}
                >✏️</button>
                <button
                  onClick={e => { e.stopPropagation(); onEliminar(rol.rolId); }}
                  style={btnSt({ background: C.dangerLight, color: C.danger, padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem" })}
                >🗑️</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
