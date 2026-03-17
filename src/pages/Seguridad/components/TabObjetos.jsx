// src/pages/Seguridad/components/TabObjetos.jsx
import React, { useState } from "react";
import { C, ACCIONES, thSt, tdSt, inputSt, btnSt } from "../constants";
import CheckboxUI from "../../../components/ui/CheckboxUI";

export default function TabObjetos({ objetos, getRO, onTogglePerm, onToggleFila }) {
  const [busq,     setBusq]     = useState("");
  const [editando, setEditando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const filtrados = objetos.filter(o =>
    (o.nombre ?? "").toLowerCase().includes(busq.toLowerCase())
  );

  // Acceso = tiene al menos un permiso activado
  const tieneAcceso = (o) => {
    const ro = getRO(o.objetoId);
    return !!(ro && (ro.leer || ro.crear || ro.modificar || ro.eliminar));
  };

  const todosAcceso  = filtrados.length > 0 && filtrados.every(tieneAcceso);
  const algunoAcceso = filtrados.some(tieneAcceso);

  const handleGuardar = () => {
    setEditando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  return (
    <div>
      {/* Barra */}
      <div style={{ padding: "14px 24px 0", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text" value={busq} onChange={e => setBusq(e.target.value)}
          placeholder="🔍 Buscar objeto..."
          style={{ ...inputSt, maxWidth: 220, padding: "7px 12px", fontSize: "0.85rem" }}
        />
        <div style={{ display: "flex", gap: 5 }}>
          {ACCIONES.map(a => (
            <span key={a.key} style={{
              padding: "2px 10px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 700,
              background: a.bg, color: a.color, border: `1px solid ${a.border}`,
            }}>{a.label}</span>
          ))}
        </div>
        <span style={{ fontSize: "0.73rem", color: C.gray400, flex: 1 }}>
          {editando ? "· Acceso activa / desactiva todo" : "· Solo lectura"}
        </span>

        {!editando ? (
          <button
            onClick={() => setEditando(true)}
            style={btnSt({ background: C.primary, color: C.white, padding: "6px 16px", fontSize: "0.82rem" })}
          >
            ✏️ Editar permisos
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setEditando(false)}
              style={btnSt({ background: C.white, color: C.gray600, padding: "6px 14px", fontSize: "0.82rem", border: `1px solid ${C.gray200}` })}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              style={btnSt({ background: "#16a34a", color: C.white, padding: "6px 16px", fontSize: "0.82rem" })}
            >
              ✓ Guardar cambios
            </button>
          </div>
        )}

        {guardado && (
          <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>✓ Guardado</span>
        )}
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto", padding: "12px 24px 24px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={thSt({ textAlign: "left", minWidth: 180, borderRadius: "8px 0 0 0", position: "sticky", left: 0 })}>
                Objeto / Entidad
              </th>

              {/* Columna Acceso (master) */}
              <th style={thSt({ textAlign: "center", minWidth: 70 })}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <CheckboxUI
                    checked={todosAcceso} indeterminate={!todosAcceso && algunoAcceso}
                    onClick={editando ? async () => {
                      for (const obj of filtrados) {
                        const acceso = tieneAcceso(obj);
                        if (todosAcceso ? acceso : !acceso) await onToggleFila(obj.objetoId);
                      }
                    } : undefined}
                  />
                  <span style={{ fontSize: "0.79rem", color: C.gray600 }}>Acceso</span>
                </div>
              </th>

              {/* Columnas individuales */}
              {ACCIONES.map((a, i) => (
                <th key={a.key}
                  style={thSt({
                    textAlign: "center", minWidth: 80, color: a.color,
                    borderRadius: i === ACCIONES.length - 1 ? "0 8px 0 0" : 0,
                  })}
                >
                  <span style={{ fontSize: "0.79rem" }}>{a.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: C.gray400 }}>
                  Sin resultados.
                </td>
              </tr>
            ) : filtrados.map((obj, idx) => {
              const ro     = getRO(obj.objetoId);
              const acceso = tieneAcceso(obj);
              const par    = idx % 2 === 0;
              return (
                <tr
                  key={obj.objetoId}
                  style={{ background: par ? C.white : C.gray50 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = par ? C.white : C.gray50}
                >
                  {/* Nombre */}
                  <td style={tdSt({ fontWeight: acceso ? 700 : 400, position: "sticky", left: 0, background: "inherit" })}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {acceso && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, display: "inline-block", flexShrink: 0 }} />
                      )}
                      {obj.nombre}
                    </span>
                  </td>

                  {/* Acceso (master toggle) */}
                  <td style={tdSt({ textAlign: "center" })}>
                    <CheckboxUI
                      checked={acceso}
                      onClick={editando ? () => onToggleFila(obj.objetoId) : undefined}
                    />
                  </td>

                  {/* Leer / Crear / Modificar / Eliminar */}
                  {ACCIONES.map(a => (
                    <td key={a.key} style={tdSt({ textAlign: "center" })}>
                      <CheckboxUI
                        checked={!!(ro && ro[a.key])}
                        color={a.color}
                        onClick={(editando && acceso) ? () => onTogglePerm(obj.objetoId, a.key) : undefined}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div style={{
        borderTop: `1px solid ${C.gray200}`, padding: "12px 24px",
        display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: C.gray600 }}>Resumen:</span>
        {ACCIONES.map(a => {
          const n = objetos.filter(o => { const ro = getRO(o.objetoId); return ro && ro[a.key]; }).length;
          return (
            <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 700, background: a.bg, color: a.color, border: `1px solid ${a.border}` }}>
                {a.label}
              </span>
              <span style={{ fontSize: "0.8rem", color: C.gray600, fontWeight: 600 }}>{n}/{objetos.length}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
