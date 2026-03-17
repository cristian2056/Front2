// src/pages/Personal/PersonalPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { personalApi } from "../../api/personal.api";
import ModalDialog  from "../../components/ui/ModalDialog";
import DataTable    from "../../components/ui/DataTable";
import PersonaForm  from "./PersonaForm";
import RolesModal   from "./RolesModal";
import { usePermiso } from "../../stores/menuSlice";

// ── Columnas de la tabla ───────────────────────────────────
const columnas = [
  { key: "personaId",  label: "ID",        ancho: 70,  render: (p) => `#${p.personaId}` },
  { key: "nombre",     label: "Nombre",    ancho: 220, render: (p) => `${p.nombres} ${p.apellidosPaterno} ${p.apellidosMaterno}` },
  { key: "documento",  label: "Documento", ancho: 140, render: (p) => `${p.tipoDocumento}: ${p.numeroDocumento}` },
  { key: "email",      label: "Email",     ancho: 200 },
  { key: "usuario",    label: "Usuario",   ancho: 120,
    render: (p) => p.usuario
      ? <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 20,
          padding: "2px 10px", fontWeight: 600, fontSize: "0.82rem" }}>
          {p.usuario.userName}
        </span>
      : <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Sin usuario</span>
  },
];

export default function PersonalPage() {
  const navigate = useNavigate(); // ✅ dentro del componente
  const { crear, modificar, eliminar } = usePermiso("Personal");

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, personaId: null, loading: false });
  const [form,        setForm]        = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [rolesTarget, setRolesTarget] = useState(null);

  // ── Carga de datos ────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await personalApi.listarPersonas();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar el personal." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Guardar (crear o editar) ──────────────────────────────
  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.personaId) {
        const res = await personalApi.actualizarPersona(form.personaId, {
          tipoDocumento:    valores.tipoDocumento,
          numeroDocumento:  valores.numeroDocumento,
          nombres:          valores.nombres,
          apellidosPaterno: valores.apellidosPaterno,
          apellidosMaterno: valores.apellidosMaterno,
          sexo:             valores.sexo,
          email:            valores.email,
          telefono:         valores.telefono,
          direccion:        valores.direccion,
        });
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Persona actualizada correctamente." });
      } else {
        const respPersona = await personalApi.crearPersona({
          tipoDocumento:    valores.tipoDocumento,
          numeroDocumento:  valores.numeroDocumento,
          nombres:          valores.nombres,
          apellidosPaterno: valores.apellidosPaterno,
          apellidosMaterno: valores.apellidosMaterno,
          sexo:             valores.sexo,
          email:            valores.email,
          telefono:         valores.telefono,
          direccion:        valores.direccion,
        });
        if (respPersona?.exito === false) throw new Error(respPersona.mensaje || "No se pudo crear la persona.");

        if (valores.crearUsuario && valores.userName && valores.password) {
          const personaId = respPersona.datos?.personaId ?? respPersona.datos?.id;
          if (!personaId) throw new Error("No se pudo obtener el ID de la persona creada.");
          const resU = await personalApi.crearUsuario({
            personaId,
            userName:      valores.userName,
            password:      valores.password,
            dependenciaId: Number(valores.dependenciaId) || null,
            rolId:         Number(valores.rolId) || null,
            activo:        true,
          });
          if (resU?.exito === false) throw new Error(resU.mensaje || "No se pudo crear el usuario.");
          setModal({ open: true, variant: "success", message: "Persona y usuario creados correctamente." });
        } else {
          setModal({ open: true, variant: "success", message: "Persona creada correctamente." });
        }
      }

      setForm(null);
      load();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally {
      setFormLoading(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────
  const confirmarEliminar = async () => {
    setConfirm(p => ({ ...p, loading: true }));
    try {
      await personalApi.eliminarPersona(confirm.personaId);
      setConfirm({ open: false, personaId: null, loading: false });
      setModal({ open: true, variant: "success", message: "Persona eliminada correctamente." });
      load();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  // ── Filtro ────────────────────────────────────────────────
  const itemsFiltrados = items.filter(p =>
    (p.nombres          ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.apellidosPaterno ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.numeroDocumento  ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.email            ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Acciones extra ────────────────────────────────────────
  const accionesExtra = (persona) => (
    <button
      onClick={() => navigate(`/personal/${persona.personaId}`)}
      style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #a3e635",
        background: "#f0fdf4", color: "#4c7318", fontWeight: 700,
        fontSize: "0.8rem", cursor: "pointer" }}>
      👁️ Ver
    </button>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1100 }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Personal</h2>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, DNI o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: "0.95rem", minWidth: 260 }}
        />
        {crear && <button
          onClick={() => setForm({})}
          style={{ padding: "9px 20px", borderRadius: 8,
            background: "#4c7318", color: "#fff", border: "none",
            fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", whiteSpace: "nowrap" }}>
          + Nueva persona
        </button>}
      </div>

      {/* Tabla */}
      <DataTable
        columnas={columnas}
        datos={itemsFiltrados}
        loading={loading}
        keyField="personaId"
        mensajeVacio="No hay personal registrado."
        onEdit={modificar ? (p) => setForm({
          personaId:        p.personaId,
          tipoDocumento:    p.tipoDocumento,
          numeroDocumento:  p.numeroDocumento,
          nombres:          p.nombres,
          apellidosPaterno: p.apellidosPaterno,
          apellidosMaterno: p.apellidosMaterno,
          sexo:             p.sexo,
          email:            p.email,
          telefono:         p.telefono,
          direccion:        p.direccion,
        }) : undefined}
        onDelete={eliminar ? (p) => setConfirm({ open: true, personaId: p.personaId, loading: false }) : undefined}
        accionesExtra={accionesExtra}
      />

      {/* Modal formulario */}
      {form !== null && (
        <PersonaForm
          initialData={form}
          onSubmit={handleGuardar}
          loading={formLoading}
          onCancel={() => setForm(null)}
        />
      )}

      {/* Modal asignar roles */}
      {rolesTarget && (
        <RolesModal
          persona={rolesTarget}
          onClose={() => { setRolesTarget(null); load(); }}
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
        title="Eliminar persona"
        message="¿Seguro que deseas eliminar esta persona? Si tiene usuario asignado, también se eliminará."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, personaId: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}