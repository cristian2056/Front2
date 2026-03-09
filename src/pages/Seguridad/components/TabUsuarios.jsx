// src/pages/Seguridad/components/TabUsuarios.jsx
import React from "react";
import { C, btnSt } from "../constants";

export default function TabUsuarios({ usuarios, onQuitar, onAbrirModal }) {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: "0.88rem", color: C.gray600 }}>
          {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} asignado{usuarios.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onAbrirModal}
          style={btnSt({ background: C.primary, color: C.white, padding: "7px 14px", fontSize: "0.84rem" })}
          onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = C.primary}
        >
          ＋ Agregar usuario
        </button>
      </div>

      {usuarios.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: C.gray400, fontSize: "0.88rem" }}>
          👤 Sin usuarios asignados. Agregá el primero.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {usuarios.map(u => (
            <div key={u.usuarioId} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
              borderRadius: 10, border: `1.5px solid ${C.gray200}`, background: C.white,
            }}>
              {/* Avatar inicial */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: C.primaryLight, color: C.primary,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
              }}>
                {(u.userName ?? u.nombreCompleto ?? "?")[0].toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.93rem", color: C.gray900 }}>
                  {u.nombreCompleto ?? u.userName ?? `Usuario #${u.usuarioId}`}
                </div>
                {u.userName && u.nombreCompleto && (
                  <div style={{ fontSize: "0.78rem", color: C.gray400 }}>@{u.userName}</div>
                )}
              </div>

              {u.tipoUsuario && (
                <span style={{
                  padding: "2px 8px", borderRadius: 20, fontSize: "0.73rem",
                  fontWeight: 700, background: C.gray100, color: C.gray600,
                }}>
                  {u.tipoUsuario}
                </span>
              )}

              <button
                onClick={() => onQuitar(u.usuarioId)}
                style={btnSt({ background: C.dangerLight, color: C.danger, padding: "5px 10px", fontSize: "0.8rem", borderRadius: 6 })}
              >
                × Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
