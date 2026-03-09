// src/pages/Seguridad/components/ModalRol.jsx
import React, { useState } from "react";
import { C, btnSt, inputSt, labelSt } from "../constants";
import Overlay     from "../../../components/ui/Overlay";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

export default function ModalRol({ rol, onGuardar, onCerrar, loading }) {
  const [nombre,      setNombre]      = useState(rol?.nombre      ?? "");
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "");
  const [activo,      setActivo]      = useState(rol?.activo      ?? true);

  const puedeGuardar = nombre.trim() && !loading;

  const handleGuardar = () => {
    if (!puedeGuardar) return;
    onGuardar({ ...rol, nombre: nombre.trim(), descripcion: descripcion.trim(), activo });
  };

  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: C.gray900 }}>
          {rol ? "✏️ Editar rol" : "➕ Nuevo rol"}
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Nombre <span style={{ color: C.danger }}>*</span></label>
          <input
            value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Supervisor" style={inputSt}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Descripción</label>
          <input
            value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Breve descripción..." style={inputSt}
          />
        </div>

        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <ToggleSwitch checked={activo} onChange={setActivo} />
          <span style={{ fontSize: "0.9rem", color: C.gray700, fontWeight: 600 }}>
            {activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCerrar}
            style={btnSt({ flex: 1, background: C.white, color: C.gray700, border: `1.5px solid ${C.gray200}`, justifyContent: "center" })}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar}
            style={btnSt({
              flex: 1, justifyContent: "center",
              background: puedeGuardar ? C.primary : C.gray400,
              color: C.white,
              cursor: puedeGuardar ? "pointer" : "not-allowed",
            })}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
