// src/pages/Seguridad/UsuariosPage.jsx
// Reutiliza PersonaForm, RolesModal, ModalDialog y DataTable del módulo Personal
import { useEffect, useState } from "react";
import { personalApi }  from "../../api/personal.api";
import PersonaForm      from "../Personal/PersonaForm";
import RolesModal       from "../Personal/RolesModal";
import ModalDialog      from "../../components/ui/ModalDialog";
import DataTable        from "../../components/ui/DataTable";
import { usePermiso } from "../../stores/menuSlice";

// ─── Columnas de la tabla ─────────────────────────────────────────────────────
const columnas = [
  {
    key: "nombre", label: "Nombre completo", ancho: 220,
    render: (p) => `${p.nombres} ${p.apellidosPaterno} ${p.apellidosMaterno}`,
  },
  {
    key: "documento", label: "Documento", ancho: 140,
    render: (p) => `${p.tipoDocumento}: ${p.numeroDocumento}`,
  },
  {
    key: "userName", label: "Usuario", ancho: 130,
    render: (p) => p.usuario
      ? <span style={{ background: "#e0e7ff", color: "#4338ca", borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: "0.82rem" }}>
          @{p.usuario.userName}
        </span>
      : <span style={{ color: "#d1d5db", fontSize: "0.82rem" }}>Sin usuario</span>,
  },
  {
    key: "rol", label: "Rol", ancho: 150,
    render: (p) => p.usuario?.rolNombre
      ? <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: "0.82rem" }}>
          {p.usuario.rolNombre}
        </span>
      : <span style={{ color: "#d1d5db", fontSize: "0.82rem" }}>Sin rol</span>,
  },
  {
    key: "activo", label: "Estado", ancho: 90,
    render: (p) => p.usuario
      ? <span style={{
          background: p.usuario.activo ? "#dcfce7" : "#fee2e2",
          color: p.usuario.activo ? "#16a34a" : "#dc2626",
          borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: "0.82rem",
        }}>
          {p.usuario.activo ? "Activo" : "Inactivo"}
        </span>
      : null,
  },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function UsuariosPage() {
  const { crear, modificar, eliminar } = usePermiso("Usuarios");
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, personaId: null, loading: false });
  const [form,        setForm]        = useState(null);   // null = cerrado, {} = nuevo, {...} = editar
  const [formLoading, setFormLoading] = useState(false);
  const [rolesTarget, setRolesTarget] = useState(null);   // persona a la que asignar roles

  // ── Cargar personas que tienen usuario ────────────────────
  const cargar = async () => {
    setLoading(true);
    try {
      const data = await personalApi.listarPersonas();
      const todos = Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : [];
      setItems(todos.filter(p => p.usuario)); // solo los que tienen acceso al sistema
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar usuarios." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Guardar (crear o editar persona + usuario opcional) ───
  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.personaId) {
        // Editar persona existente
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
        setModal({ open: true, variant: "success", message: "Usuario actualizado correctamente." });
      } else {
        // Nueva persona
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
          activo:           true,
        });
        if (respPersona?.exito === false) throw new Error(respPersona.mensaje || "No se pudo crear la persona.");

        // Crear usuario si marcó el checkbox
        if (valores.crearUsuario && valores.userName && valores.password) {
          const personaId = respPersona.datos?.personaId ?? respPersona.datos?.id;
          if (!personaId) throw new Error("No se pudo obtener el ID de la persona creada.");
          const resU = await personalApi.crearUsuario({
            personaId,
            dependenciaId: Number(valores.dependenciaId) || null,
            rolId:         Number(valores.rolId) || null,
            userName:      valores.userName,
            password:      valores.password,
            activo:        true,
          });
          if (resU?.exito === false) throw new Error(resU.mensaje || "No se pudo crear el usuario.");
          setModal({ open: true, variant: "success", message: "Persona y usuario creados correctamente." });
        } else {
          setModal({ open: true, variant: "success", message: "Persona creada. No se creó usuario." });
        }
      }
      setForm(null);
      cargar();
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
      setModal({ open: true, variant: "success", message: "Usuario eliminado correctamente." });
      cargar();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  // ── Filtro ────────────────────────────────────────────────
  const filtrados = items.filter(p =>
    `${p.nombres ?? ""} ${p.apellidosPaterno ?? ""} ${p.apellidosMaterno ?? ""} ${p.usuario?.userName ?? ""}`
      .toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Acciones extra: asignar roles ─────────────────────────
  const accionesExtra = (persona) => persona.usuario && (
    <button
      onClick={() => setRolesTarget(persona)}
      style={{
        padding: "5px 12px", borderRadius: 6,
        border: "1px solid #c7d2fe", background: "#eef2ff",
        color: "#4338ca", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
      }}>
      🎭 Roles
    </button>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1200 }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: "1.3rem", fontWeight: 800, color: "#232946" }}>
          👥 Usuarios del sistema
        </h2>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o usuario..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.93rem", minWidth: 240 }}
        />
        {crear && <button
          onClick={() => setForm({})}
          style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          + Nuevo usuario
        </button>}
      </div>

      {/* Tabla */}
      <DataTable
        columnas={columnas}
        datos={filtrados}
        loading={loading}
        keyField="personaId"
        mensajeVacio="No hay usuarios registrados."
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

      {/* Formulario persona (crear/editar) */}
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
          onClose={() => { setRolesTarget(null); cargar(); }}
        />
      )}

      {/* Modales de resultado */}
      <ModalDialog
        open={modal.open}
        variant={modal.variant}
        message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })}
      />

      <ModalDialog
        open={confirm.open}
        variant="confirm"
        title="Eliminar usuario"
        message="¿Seguro que deseas eliminar este usuario? La persona también será eliminada."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, personaId: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}