// src/pages/Componentes/ComponentesPage.jsx
// Catálogo de tipos de componente (CPU, RAM, Disco, etc.)
// Estos son los registros que luego se seleccionan al agregar componentes a un equipo.
import React, { useEffect, useState } from "react";
import { componentesApi } from "../../api/componentes.api";
import DataTable  from "../../components/ui/DataTable";
import FormModal  from "../../components/ui/FormModal";
import ModalDialog from "../../components/ui/ModalDialog";
import { usePermiso } from "../../stores/menuSlice";

const columnas = [
  { key: "componenteId", label: "ID",          ancho: 70,  render: (c) => `#${c.componenteId}` },
  { key: "nombre",       label: "Nombre",       ancho: 220 },
  { key: "descripcion",  label: "Descripción",  ancho: 380 },
];

const FIELDS = [
  { name: "nombre",      label: "Nombre",      type: "text",     required: true,  placeholder: "Ej: Procesador, RAM, Disco SSD...", span: 2 },
  { name: "descripcion", label: "Descripción", type: "textarea", required: false,  placeholder: "Descripción opcional del tipo de componente", rows: 2, span: 2 },
];

export default function ComponentesPage() {
  const { crear, modificar, eliminar } = usePermiso("Componentes");
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, id: null, loading: false });
  const [form,        setForm]        = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await componentesApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al listar componentes." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.componenteId) {
        const res = await componentesApi.actualizar(form.componenteId, valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Componente actualizado correctamente." });
      } else {
        const res = await componentesApi.crear(valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Componente creado correctamente." });
      }
      setForm(null);
      load();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    setConfirm(p => ({ ...p, loading: true }));
    try {
      const res = await componentesApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Componente eliminado correctamente." });
      load();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const itemsFiltrados = items.filter(c =>
    (c.nombre      ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%", maxWidth: 980 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>🔩 Componentes</h2>
          <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: "0.87rem" }}>
            Catálogo de tipos de componente para asignar a equipos
          </p>
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.95rem", minWidth: 220 }}
        />
        {crear && <button
          onClick={() => setForm({})}
          style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          + Nuevo componente
        </button>}
      </div>

      <DataTable
        columnas={columnas}
        datos={itemsFiltrados}
        loading={loading}
        keyField="componenteId"
        mensajeVacio="No hay componentes registrados. Creá uno para poder asignarlo a equipos."
        onEdit={modificar ? c => setForm({ componenteId: c.componenteId, nombre: c.nombre, descripcion: c.descripcion ?? "" }) : undefined}
        onDelete={eliminar ? c => setConfirm({ open: true, id: c.componenteId, loading: false }) : undefined}
      />

      {form !== null && (
        <FormModal
          title={form.componenteId ? "✏️ Editar componente" : "➕ Nuevo componente"}
          fields={FIELDS}
          initialData={form}
          onSubmit={handleGuardar}
          loading={formLoading}
          onCancel={() => setForm(null)}
          cols={1}
          maxWidth={480}
        />
      )}

      <ModalDialog
        open={modal.open}
        variant={modal.variant}
        message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })}
      />

      <ModalDialog
        open={confirm.open}
        variant="confirm"
        title="Eliminar componente"
        message="¿Seguro que deseas eliminar este componente? Los equipos que lo tengan asignado podrían verse afectados."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
