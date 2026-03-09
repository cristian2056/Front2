// src/pages/Proveedores/ProveedorForm.jsx
import React, { useState } from "react";
import Overlay from "../../components/ui/Overlay";

const C = { primary: "#4c7318", primaryHover: "#3e5b19" };
const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d1d5db", fontSize: "0.92rem",
  boxSizing: "border-box", outline: "none", background: "#fff",
};
const labelSt = { display: "block", fontWeight: 600, marginBottom: 5, color: "#374151", fontSize: "0.87rem" };
const groupSt = { marginBottom: 14 };
const CALIFICACIONES = ["Alta", "Media", "Baja"];

export default function ProveedorForm({ initialData = {}, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    nombre:           initialData.nombre           ?? "",
    ruc:              initialData.ruc              ?? "",
    rubro:            initialData.rubro            ?? "",
    direccion:        initialData.direccion        ?? "",
    telefono:         initialData.telefono         ?? "",
    email:            initialData.email            ?? "",
    contactoPrincipal:initialData.contactoPrincipal?? "",
    calificacion:     initialData.calificacion     ?? "",
    observaciones:    initialData.observaciones    ?? "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = { ...form };
    // Enviar null en lugar de "" para campos opcionales vacíos
    Object.keys(body).forEach(k => { if (k !== "nombre" && body[k] === "") body[k] = null; });
    onSubmit(body);
  };

  return (
    <Overlay onCerrar={onCancel}>
      <div style={{ maxWidth: 580, width: "100%" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "1.15rem", fontWeight: 800, color: "#232946", textAlign: "center" }}>
          {initialData.proveedorId ? "✏️ Editar proveedor" : "➕ Nuevo proveedor"}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Fila 1: Nombre + RUC */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelSt}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
              <input required type="text" placeholder="Razón social" value={form.nombre}
                onChange={e => set("nombre", e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>RUC / NIT</label>
              <input type="text" placeholder="20123456789" value={form.ruc}
                onChange={e => set("ruc", e.target.value)} style={inputSt} />
            </div>
          </div>

          {/* Fila 2: Rubro + Calificación */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelSt}>Rubro</label>
              <input type="text" placeholder="Ej: Tecnología" value={form.rubro}
                onChange={e => set("rubro", e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Calificación</label>
              <select value={form.calificacion} onChange={e => set("calificacion", e.target.value)}
                style={{ ...inputSt, color: form.calificacion ? "#111" : "#9ca3af" }}>
                <option value="">— Sin calificar —</option>
                {CALIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Fila 3: Teléfono + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelSt}>Teléfono</label>
              <input type="tel" placeholder="+51 999 999 999" value={form.telefono}
                onChange={e => set("telefono", e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Email</label>
              <input type="email" placeholder="contacto@empresa.com" value={form.email}
                onChange={e => set("email", e.target.value)} style={inputSt} />
            </div>
          </div>

          {/* Dirección */}
          <div style={groupSt}>
            <label style={labelSt}>Dirección</label>
            <input type="text" placeholder="Av. Principal 123, Lima" value={form.direccion}
              onChange={e => set("direccion", e.target.value)} style={inputSt} />
          </div>

          {/* Contacto principal */}
          <div style={groupSt}>
            <label style={labelSt}>Contacto principal</label>
            <input type="text" placeholder="Nombre del contacto" value={form.contactoPrincipal}
              onChange={e => set("contactoPrincipal", e.target.value)} style={inputSt} />
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelSt}>Observaciones</label>
            <textarea
              rows={3} placeholder="Notas adicionales..." value={form.observaciones}
              onChange={e => set("observaciones", e.target.value)}
              style={{ ...inputSt, resize: "vertical", fontFamily: "inherit" }}
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
