// src/components/ui/FormModal.jsx
// Componente genérico de formulario en modal.
// Recibe un array de "fields" y renderiza los inputs correspondientes.
//
// Uso:
//   <FormModal
//     title="Nueva marca"
//     fields={FIELDS}
//     initialData={form}       // {} para crear, {...datos} para editar
//     onSubmit={handleGuardar}
//     loading={formLoading}
//     onCancel={() => setForm(null)}
//     cols={2}                 // columnas de grilla (default 2)
//     maxWidth={520}           // ancho máximo del modal (default 520)
//   />
//
// Tipos de campo soportados:
//   type: "text" | "email" | "tel" | "number" | "textarea" | "select" | "toggle"
//   span: 2  → ocupa el ancho completo (ambas columnas)
//   required: true → agrega validación y asterisco rojo
//   options: [{ value, label }]  → para type="select"
//   rows: 3  → para type="textarea"

import React, { useState } from "react";
import Overlay      from "./Overlay";
import ToggleSwitch from "./ToggleSwitch";

const C = { primary: "#4c7318", primaryHover: "#3e5b19" };

const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d1d5db", fontSize: "0.92rem",
  boxSizing: "border-box", outline: "none", background: "#fff", color: "#111",
};
const labelSt = { display: "block", fontWeight: 600, marginBottom: 5, color: "#374151", fontSize: "0.87rem" };

// ── Renderiza el input correcto según el tipo ────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const { type = "text", placeholder, options = [], rows = 3, required } = field;

  if (type === "toggle") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 6 }}>
        <ToggleSwitch checked={!!value} onChange={onChange} />
        <span style={{ fontSize: "0.9rem", color: "#374151" }}>{value ? "Sí" : "No"}</span>
      </div>
    );
  }

  if (type === "select") {
    return (
      <select
        required={required} value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputSt, color: value ? "#111" : "#9ca3af" }}
      >
        <option value="">— Seleccionar —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        required={required} rows={rows} placeholder={placeholder}
        value={value ?? ""} onChange={e => onChange(e.target.value)}
        style={{ ...inputSt, resize: "vertical", fontFamily: "inherit" }}
      />
    );
  }

  return (
    <input
      required={required} type={type} placeholder={placeholder}
      value={value ?? ""} onChange={e => onChange(e.target.value)}
      style={inputSt}
    />
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function FormModal({
  title, fields = [], initialData = {},
  onSubmit, loading, onCancel,
  cols = 2, maxWidth = 520,
}) {
  // Inicializar estado con los valores del initialData o defaults según tipo
  const [values, setValues] = useState(() => {
    const init = {};
    fields.forEach(f => {
      init[f.name] = initialData[f.name] ?? (f.type === "toggle" ? false : "");
    });
    return init;
  });

  const set = (name, val) => setValues(p => ({ ...p, [name]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = { ...values };
    // Campos opcionales vacíos → null (excepto toggle)
    fields.forEach(f => {
      if (!f.required && f.type !== "toggle" && body[f.name] === "") {
        body[f.name] = null;
      }
      // Select numérico: convertir string a número si el campo lo requiere
      if (f.type === "select" && f.numeric && body[f.name] !== null && body[f.name] !== "") {
        body[f.name] = Number(body[f.name]);
      }
    });
    onSubmit(body);
  };

  return (
    <Overlay onCerrar={onCancel}>
      <div style={{ maxWidth, width: "100%" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "1.15rem", fontWeight: 800, color: "#232946", textAlign: "center" }}>
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 12px" }}>
            {fields.map(f => (
              <div key={f.name} style={{ gridColumn: (f.span === 2 || cols === 1) ? "1 / -1" : "auto" }}>
                <label style={labelSt}>
                  {f.label}
                  {f.required  && <span style={{ color: "#ef4444" }}> *</span>}
                  {!f.required && f.type !== "toggle" && (
                    <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.8rem" }}> (opcional)</span>
                  )}
                </label>
                <FieldInput field={f} value={values[f.name]} onChange={v => set(f.name, v)} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
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
