// src/pages/Seguridad/components/TabObjetos.jsx
import React, { useState } from "react";
import { C, ACCIONES, thSt, tdSt, inputSt } from "../constants";
import CheckboxUI from "../../../components/ui/CheckboxUI";

export default function TabObjetos({ objetos, getRO, onTogglePerm, onToggleFila }) {
  const [busq, setBusq] = useState("");
  const filtrados = objetos.filter(o =>
    (o.nombre ?? "").toLowerCase().includes(busq.toLowerCase())
  );

  const colStats = (accion) => ({
    todos:  filtrados.every(o => { const ro = getRO(o.objetoId); return ro && ro[accion]; }),
    alguno: filtrados.some(o  => { const ro = getRO(o.objetoId); return ro && ro[accion]; }),
  });

  return (
    <div>
      {/* Barra de búsqueda */}
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
        <span style={{ fontSize: "0.73rem", color: C.gray400 }}>· Clic en encabezado para seleccionar columna</span>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto", padding: "12px 24px 24px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={thSt({ textAlign: "left", minWidth: 200, borderRadius: "8px 0 0 0", position: "sticky", left: 0 })}>
                Objeto / Entidad
              </th>
              <th style={thSt({ textAlign: "center", minWidth: 60 })}>Todo</th>
              {ACCIONES.map((a, i) => {
                const { todos, alguno } = colStats(a.key);
                return (
                  <th key={a.key}
                    style={thSt({
                      textAlign: "center", cursor: "pointer", color: a.color, minWidth: 80,
                      borderRadius: i === ACCIONES.length - 1 ? "0 8px 0 0" : 0,
                    })}
                    title={`Marcar/desmarcar todo "${a.label}"`}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <CheckboxUI
                        checked={todos} indeterminate={!todos && alguno} color={a.color}
                        onClick={async () => {
                          for (const obj of filtrados) {
                            const ro = getRO(obj.objetoId);
                            const yaOn = ro && ro[a.key];
                            if (todos ? yaOn : !yaOn) await onTogglePerm(obj.objetoId, a.key);
                          }
                        }}
                      />
                      <span style={{ fontSize: "0.79rem" }}>{a.label}</span>
                    </div>
                  </th>
                );
              })}
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
              const ro       = getRO(obj.objetoId);
              const tieneAlgo = ro && ACCIONES.some(a => ro[a.key]);
              const todosOn   = ro && ACCIONES.every(a => ro[a.key]);
              const algunoOn  = ro && ACCIONES.some(a => ro[a.key]);
              const par = idx % 2 === 0;
              return (
                <tr
                  key={obj.objetoId}
                  style={{ background: par ? C.white : C.gray50 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = par ? C.white : C.gray50}
                >
                  <td style={tdSt({ fontWeight: tieneAlgo ? 700 : 400, position: "sticky", left: 0, background: "inherit" })}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {tieneAlgo && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, display: "inline-block", flexShrink: 0 }} />
                      )}
                      {obj.nombre}
                    </span>
                  </td>
                  <td style={tdSt({ textAlign: "center" })}>
                    <CheckboxUI
                      checked={!!todosOn} indeterminate={!todosOn && !!algunoOn}
                      onClick={() => onToggleFila(obj.objetoId)}
                    />
                  </td>
                  {ACCIONES.map(a => (
                    <td key={a.key} style={tdSt({ textAlign: "center" })}>
                      <CheckboxUI
                        checked={!!(ro && ro[a.key])} color={a.color}
                        onClick={() => onTogglePerm(obj.objetoId, a.key)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen inferior */}
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
