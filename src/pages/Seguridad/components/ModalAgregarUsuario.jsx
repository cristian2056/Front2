// src/pages/Seguridad/components/ModalAgregarUsuario.jsx
import React, { useEffect, useState } from "react";
import { C, btnSt, inputSt } from "../constants";
import Overlay from "../../../components/ui/Overlay";
import Spinner from "../../../components/ui/Spinner";
import { rolUsuariosApi } from "../../../api/roles.api";

export default function ModalAgregarUsuario({ usuariosActuales, onAgregar, onCerrar }) {
  const [todos,    setTodos]    = useState([]);
  const [busq,     setBusq]     = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    rolUsuariosApi.listarTodos()
      .then(r => setTodos(r.datos ?? []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const idsActuales = new Set(usuariosActuales.map(u => u.usuarioId));
  const disponibles = todos.filter(u =>
    !idsActuales.has(u.usuarioId) &&
    `${u.nombreCompleto ?? ""} ${u.userName ?? ""}`.toLowerCase().includes(busq.toLowerCase())
  );

  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: C.gray900 }}>
          👤 Agregar usuario al rol
        </h3>
        <input
          value={busq} onChange={e => setBusq(e.target.value)}
          placeholder="🔍 Buscar por nombre o usuario..."
          style={{ ...inputSt, marginBottom: 12 }}
        />

        {cargando ? <Spinner /> : (
          <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {disponibles.length === 0 ? (
              <div style={{ textAlign: "center", color: C.gray400, padding: "32px 0", fontSize: "0.88rem" }}>
                Sin usuarios disponibles
              </div>
            ) : disponibles.map(u => (
              <div
                key={u.usuarioId}
                onClick={() => onAgregar(u.usuarioId)}
                style={{
                  padding: "10px 14px", borderRadius: 9, cursor: "pointer",
                  border: `1.5px solid ${C.gray200}`, background: C.white,
                  display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
                onMouseLeave={e => e.currentTarget.style.background = C.white}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: C.primaryLight, color: C.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.85rem", flexShrink: 0,
                }}>
                  {(u.userName ?? u.nombreCompleto ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: C.gray900 }}>
                    {u.nombreCompleto ?? u.userName}
                  </div>
                  {u.userName && (
                    <div style={{ fontSize: "0.75rem", color: C.gray400 }}>@{u.userName}</div>
                  )}
                </div>
                <span style={{ marginLeft: "auto", color: C.primary, fontWeight: 700, fontSize: "0.8rem" }}>
                  Agregar →
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onCerrar}
          style={btnSt({ width: "100%", marginTop: 12, background: C.gray100, color: C.gray700, justifyContent: "center" })}
        >
          Cerrar
        </button>
      </div>
    </Overlay>
  );
}
