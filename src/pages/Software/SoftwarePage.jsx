// src/pages/Software/SoftwarePage.jsx
// Catálogo de software (Windows, Office, Antivirus, etc.)
// Estos registros se seleccionan al agregar software instalado a un equipo.
import React, { useEffect, useState } from "react";
import { softwaresApi } from "../../api/administracion.api";
import DataTable   from "../../components/ui/DataTable";
import FormModal   from "../../components/ui/FormModal";
import ModalDialog from "../../components/ui/ModalDialog";
import { usePermiso } from "../../stores/menuSlice";

const columnas = [
  { key: "softwareId",  label: "ID",          ancho: 70,  render: (s) => `#${s.softwareId}` },
  { key: "nombre",      label: "Nombre",       ancho: 200 },
  { key: "version",     label: "Versión",      ancho: 130 },
  { key: "tipo",        label: "Tipo",         ancho: 150 },
  { key: "descripcion", label: "Descripción",  ancho: 280 },
];

const FIELDS = [
  { name: "nombre",      label: "Nombre",      type: "text",     required: true,  placeholder: "Ej: Microsoft Office", span: 2 },
  { name: "version",     label: "Versión",     type: "text",     required: false, placeholder: "Ej: 2021, 365...", span: 1 },
  { name: "tipo",        label: "Tipo",        type: "text",     required: false, placeholder: "Ej: Ofimática, Antivirus, SO...", span: 1 },
  { name: "descripcion", label: "Descripción", type: "textarea", required: false, placeholder: "Descripción opcional", rows: 2, span: 2 },
];

export default function SoftwarePage() {
  const { crear, modificar, eliminar } = usePermiso("Software");
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
      const data = await softwaresApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al listar software." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.softwareId) {
        const res = await softwaresApi.actualizar(form.softwareId, valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Software actualizado correctamente." });
      } else {
        const res = await softwaresApi.crear(valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Software creado correctamente." });
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
      const res = await softwaresApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Software eliminado correctamente." });
      load();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const itemsFiltrados = items.filter(s =>
    (s.nombre      ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (s.tipo        ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (s.version     ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%", maxWidth: 1050 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>💿 Software</h2>
          <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: "0.87rem" }}>
            Catálogo de software para registrar instalaciones en equipos
          </p>
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, tipo o versión..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.95rem", minWidth: 260 }}
        />
        {crear && <button
          onClick={() => setForm({})}
          style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          + Nuevo software
        </button>}
      </div>

      <DataTable
        columnas={columnas}
        datos={itemsFiltrados}
        loading={loading}
        keyField="softwareId"
        mensajeVacio="No hay software registrado. Creá uno para poder asignarlo a equipos."
        onEdit={modificar ? s => setForm({ softwareId: s.softwareId, nombre: s.nombre, version: s.version ?? "", tipo: s.tipo ?? "", descripcion: s.descripcion ?? "" }) : undefined}
        onDelete={eliminar ? s => setConfirm({ open: true, id: s.softwareId, loading: false }) : undefined}
      />

      {form !== null && (
        <FormModal
          title={form.softwareId ? "✏️ Editar software" : "➕ Nuevo software"}
          fields={FIELDS}
          initialData={form}
          onSubmit={handleGuardar}
          loading={formLoading}
          onCancel={() => setForm(null)}
          cols={2}
          maxWidth={540}
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
        title="Eliminar software"
        message="¿Seguro que deseas eliminar este software? Los equipos que lo tengan asignado podrían verse afectados."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
