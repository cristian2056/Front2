// src/pages/Dependencias/DependenciasPage.jsx
import React, { useEffect, useState } from "react";
import { dependenciasApi } from "../../api/administracion.api";
import DataTable  from "../../components/ui/DataTable";
import ModalDialog from "../../components/ui/ModalDialog";
import FormModal   from "../../components/ui/FormModal";
import { usePermiso } from "../../stores/menuSlice";

const TIPOS = ["Gerencia", "Sub-gerencia", "Dirección", "Departamento", "Área", "Unidad", "Oficina"];

// Genera los fields con las opciones del padre cargadas dinámicamente
const buildFields = (items, currentId) => [
  { name: "nombre",            label: "Nombre",             type: "text",   required: true, placeholder: "Ej: Gerencia de TI" },
  { name: "tipo",              label: "Tipo",               type: "select", required: true, options: TIPOS.map(t => ({ value: t, label: t })) },
  { name: "dependenciaPadreId",label: "Dependencia padre",  type: "select", span: 2, numeric: true,
    options: items.filter(d => d.dependenciaId !== currentId).map(d => ({ value: d.dependenciaId, label: `${d.nombre} (${d.tipo})` })) },
  { name: "direccion",         label: "Dirección",          type: "text",   placeholder: "Ej: Av. La Marina 123" },
  { name: "ubigeo",            label: "Ubigeo",             type: "text",   placeholder: "Ej: 150101" },
  { name: "activo",            label: "Activa",             type: "toggle", span: 2 },
];

const TIPO_COLOR = {
  "Gerencia":      { bg: "#ede9fe", color: "#7c3aed" },
  "Sub-gerencia":  { bg: "#ddd6fe", color: "#6d28d9" },
  "Dirección":     { bg: "#e0f2fe", color: "#0369a1" },
  "Departamento":  { bg: "#fef9c3", color: "#a16207" },
  "Área":          { bg: "#dcfce7", color: "#16a34a" },
  "Unidad":        { bg: "#fee2e2", color: "#dc2626" },
  "Oficina":       { bg: "#f3f4f6", color: "#6b7280" },
};

const columnas = [
  { key: "dependenciaId", label: "ID",     ancho: 70,  render: d => `#${d.dependenciaId}` },
  { key: "nombre",        label: "Nombre", ancho: 240 },
  {
    key: "tipo", label: "Tipo", ancho: 130,
    render: d => {
      const s = TIPO_COLOR[d.tipo] ?? { bg: "#f3f4f6", color: "#6b7280" };
      return (
        <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: "0.78rem" }}>
          {d.tipo}
        </span>
      );
    },
  },
  { key: "direccion", label: "Dirección", ancho: 200, render: d => d.direccion ?? "—" },
  {
    key: "activo", label: "Estado", ancho: 90,
    render: d => (
      <span style={{
        background: d.activo ? "#dcfce7" : "#fee2e2",
        color: d.activo ? "#16a34a" : "#dc2626",
        borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: "0.78rem",
      }}>
        {d.activo ? "Activa" : "Inactiva"}
      </span>
    ),
  },
];

export default function DependenciasPage() {
  const { crear, modificar, eliminar } = usePermiso("Dependencias");
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [form,        setForm]        = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, id: null, loading: false });

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await dependenciasApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar." });
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.dependenciaId) {
        const res = await dependenciasApi.actualizar(form.dependenciaId, valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Dependencia actualizada correctamente." });
      } else {
        const res = await dependenciasApi.crear(valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Dependencia creada correctamente." });
      }
      setForm(null);
      cargar();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally { setFormLoading(false); }
  };

  const confirmarEliminar = async () => {
    setConfirm(p => ({ ...p, loading: true }));
    try {
      const res = await dependenciasApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Dependencia eliminada correctamente." });
      cargar();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const filtrados = items.filter(d =>
    [d.nombre, d.tipo, d.direccion]
      .some(v => (v ?? "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div style={{ width: "100%", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: "1.3rem", fontWeight: 800, color: "#232946" }}>
          🏛️ Dependencias
        </h2>
        <input
          type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por nombre o tipo..."
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.93rem", minWidth: 240 }}
        />
        {crear && <button onClick={() => setForm({})} style={{
          padding: "9px 20px", borderRadius: 8, background: "#4c7318",
          color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
        }}>+ Nueva dependencia</button>}
      </div>

      <DataTable
        columnas={columnas} datos={filtrados} loading={loading}
        keyField="dependenciaId" mensajeVacio="No hay dependencias registradas."
        onEdit={modificar ? d => setForm({ ...d }) : undefined}
        onDelete={eliminar ? d => setConfirm({ open: true, id: d.dependenciaId, loading: false }) : undefined}
      />

      {form !== null && (
        <FormModal
          title={form.dependenciaId ? "✏️ Editar dependencia" : "➕ Nueva dependencia"}
          fields={buildFields(items, form.dependenciaId)} initialData={form} cols={2} maxWidth={560}
          onSubmit={handleGuardar} loading={formLoading} onCancel={() => setForm(null)}
        />
      )}

      <ModalDialog open={modal.open} variant={modal.variant} message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })} />

      <ModalDialog
        open={confirm.open} variant="confirm" title="Eliminar dependencia"
        message="¿Seguro que deseas eliminar esta dependencia? Esta acción no se puede deshacer."
        loading={confirm.loading} confirmText="Sí, eliminar" cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
      />
    </div>
  );
}
