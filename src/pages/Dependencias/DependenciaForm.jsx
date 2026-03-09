// src/pages/Dependencias/DependenciaForm.jsx
import React, { useEffect, useState } from "react";
import Overlay      from "../../components/ui/Overlay";
import Spinner      from "../../components/ui/Spinner";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { dependenciasApi } from "../../api/administracion.api";

const C = { primary: "#4c7318", primaryHover: "#3e5b19" };
const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d1d5db", fontSize: "0.92rem",
  boxSizing: "border-box", outline: "none", background: "#fff",
};
const labelSt = { display: "block", fontWeight: 600, marginBottom: 5, color: "#374151", fontSize: "0.87rem" };

const TIPOS = ["Gerencia", "Sub-gerencia", "Dirección", "Departamento", "Área", "Unidad", "Oficina"];

export default function DependenciaForm({ initialData = {}, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    nombre:            initialData.nombre            ?? "",
    tipo:              initialData.tipo              ?? "",
    dependenciaPadreId:initialData.dependenciaPadreId ?? "",
    direccion:         initialData.direccion         ?? "",
    ubigeo:            initialData.ubigeo            ?? "",
    activo:            initialData.activo            ?? true,
  });
  const [padres,        setPadres]        = useState([]);
  const [cargandoPadres,setCargandoPadres]= useState(true);

  useEffect(() => {
    dependenciasApi.listar()
      .then(r => setPadres(Array.isArray(r.datos) ? r.datos : []))
      .catch(() => {})
      .finally(() => setCargandoPadres(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre:             form.nombre.trim(),
      tipo:               form.tipo,
      dependenciaPadreId: form.dependenciaPadreId ? Number(form.dependenciaPadreId) : null,
      direccion:          form.direccion.trim() || null,
      ubigeo:             form.ubigeo.trim()    || null,
      activo:             form.activo,
    });
  };

  // Excluir la dependencia actual de la lista de padres posibles (evitar ciclos)
  const padresDisponibles = padres.filter(p => p.dependenciaId !== initialData.dependenciaId);

  return (
    <Overlay onCerrar={onCancel}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "1.15rem", fontWeight: 800, color: "#232946", textAlign: "center" }}>
          {initialData.dependenciaId ? "✏️ Editar dependencia" : "➕ Nueva dependencia"}
        </h3>

        {cargandoPadres ? <Spinner /> : (
          <form onSubmit={handleSubmit}>
            {/* Nombre + Tipo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelSt}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
                <input required type="text" placeholder="Ej: Gerencia de TI" value={form.nombre}
                  onChange={e => set("nombre", e.target.value)} style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Tipo <span style={{ color: "#ef4444" }}>*</span></label>
                <select required value={form.tipo} onChange={e => set("tipo", e.target.value)}
                  style={{ ...inputSt, color: form.tipo ? "#111" : "#9ca3af" }}>
                  <option value="">— Seleccionar —</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Dependencia padre */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelSt}>Dependencia padre</label>
              <select value={form.dependenciaPadreId} onChange={e => set("dependenciaPadreId", e.target.value)}
                style={{ ...inputSt, color: form.dependenciaPadreId ? "#111" : "#9ca3af" }}>
                <option value="">— Ninguna (nivel raíz) —</option>
                {padresDisponibles.map(p => (
                  <option key={p.dependenciaId} value={p.dependenciaId}>
                    {p.nombre} ({p.tipo})
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección + Ubigeo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelSt}>Dirección</label>
                <input type="text" placeholder="Ej: Av. La Marina 123" value={form.direccion}
                  onChange={e => set("direccion", e.target.value)} style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Ubigeo</label>
                <input type="text" placeholder="Ej: 150101" value={form.ubigeo}
                  onChange={e => set("ubigeo", e.target.value)} style={inputSt} />
              </div>
            </div>

            {/* Activo */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <ToggleSwitch checked={form.activo} onChange={v => set("activo", v)} />
              <span style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600 }}>
                {form.activo ? "Activa" : "Inactiva"}
              </span>
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
        )}
      </div>
    </Overlay>
  );
}
