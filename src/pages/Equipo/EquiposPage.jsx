// src/pages/Equipos/EquiposPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { equiposApi } from "../../api/equipos.api";
import DataTable from "../../components/ui/DataTable";
import ModalDialog from "../../components/ui/ModalDialog";
import EquipoForm from "./EquipoForm";        // solo para EDITAR
import EquipoWizard from "./EquipoWizard";    // para CREAR (wizard)
import { usePermiso } from "../../stores/menuSlice";

const columnas = [
  { key: "equipoId",          label: "ID",               ancho: 70,  render: (e) => `#${e.equipoId}` },
  { key: "codigoPatrimonial", label: "Cód. Patrimonial", ancho: 160 },
  { key: "codigoInterno",     label: "Cód. Interno",     ancho: 130 },
  { key: "nombre",            label: "Nombre",           ancho: 200 },
  { key: "serial",            label: "Serial",           ancho: 150 },
  { key: "estado",            label: "Estado",           ancho: 130,
    render: (e) => <EstadoBadge estado={e.estado} /> },
  { key: "activo", label: "Activo", ancho: 80,
    render: (e) => e.activo ? "✅" : "❌" },
];

function EstadoBadge({ estado }) {
  const colores = {
    ACTIVO:        { bg: "#dcfce7", color: "#16a34a" },
    INACTIVO:      { bg: "#f3f4f6", color: "#6b7280" },
    MANTENIMIENTO: { bg: "#fef9c3", color: "#ca8a04" },
    BAJA:          { bg: "#fee2e2", color: "#dc2626" },
  };
  const s = colores[estado?.toUpperCase()] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 10px", borderRadius: 20,
      fontSize: "0.82rem", fontWeight: 700,
    }}>
      {estado ?? "—"}
    </span>
  );
}

export default function EquiposPage() {
  const navigate = useNavigate();
  const { crear, modificar, eliminar } = usePermiso("Equipos");
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, equipoId: null, loading: false });

  // Wizard para crear
  const [wizardAbierto, setWizardAbierto] = useState(false);

  // Form simple solo para editar
  const [formEditar,    setFormEditar]    = useState(null);
  const [formLoading,   setFormLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await equiposApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al listar equipos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Solo para edición (form simple, sin wizard)
  const handleGuardarEdicion = async (valores) => {
    setFormLoading(true);
    try {
      await equiposApi.actualizar(formEditar.equipoId, valores);
      setModal({ open: true, variant: "success", message: "Equipo actualizado correctamente." });
      setFormEditar(null);
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
      await equiposApi.eliminar(confirm.equipoId);
      setConfirm({ open: false, equipoId: null, loading: false });
      setModal({ open: true, variant: "success", message: "Equipo eliminado correctamente." });
      load();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const itemsFiltrados = items.filter(e =>
    (e.codigoPatrimonial ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.nombre            ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.serial            ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%" }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Equipos</h2>
        <input
          type="text"
          placeholder="🔍 Buscar por código, nombre o serial..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: "0.95rem", minWidth: 280,
          }}
        />
        {crear && (
          <button
            onClick={() => setWizardAbierto(true)}
            style={{
              padding: "9px 20px", borderRadius: 8,
              background: "#4c7318", color: "#fff",
              border: "none", fontWeight: 700,
              fontSize: "0.95rem", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            + Nuevo equipo
          </button>
        )}
      </div>

      {/* Tabla — ✏️ abre el detalle con pestañas */}
      <DataTable
        columnas={columnas}
        datos={itemsFiltrados}
        loading={loading}
        keyField="equipoId"
        mensajeVacio="No hay equipos registrados."
        onEdit={modificar ? e => navigate(`/equipos/${e.equipoId}`) : undefined}
        onDelete={eliminar ? e => setConfirm({ open: true, equipoId: e.equipoId, loading: false }) : undefined}
      />

      {/* Wizard — solo para crear */}
      {wizardAbierto && (
        <EquipoWizard
          onCerrar={() => { setWizardAbierto(false); load(); }}
          onEquipoCreado={() => load()}
        />
      )}

      {/* Form simple — solo para editar (se abre desde el detalle si hace falta) */}
      {formEditar !== null && (
        <EquipoForm
          initialData={formEditar}
          onSubmit={handleGuardarEdicion}
          loading={formLoading}
          onCancel={() => setFormEditar(null)}
        />
      )}

      {/* Modal éxito/error */}
      <ModalDialog
        open={modal.open}
        variant={modal.variant}
        message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })}
      />

      {/* Modal confirmar eliminar */}
      <ModalDialog
        open={confirm.open}
        variant="confirm"
        title="Eliminar equipo"
        message="¿Seguro que deseas eliminar este equipo? Esta acción no se puede deshacer."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, equipoId: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}