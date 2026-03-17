// src/pages/Mantenimientos/MantenimientosPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { mantenimientosApi } from "../../api/mantenimientos.api";
import { http } from "../../services/http";
import DataTable   from "../../components/ui/DataTable";
import ModalDialog from "../../components/ui/ModalDialog";
import Overlay     from "../../components/ui/Overlay";
import { usePermiso } from "../../stores/menuSlice";
import { selectUsuario } from "../../stores/authSlice";
import { inputStyle, labelStyle } from "../../components/ui/formStyles";

const TIPOS   = ["PREVENTIVO", "CORRECTIVO"];
const ESTADOS = ["ABIERTO", "EN_PROCESO", "CERRADO"];

const TIPO_BADGE = {
  PREVENTIVO: { bg: "#dbeafe", color: "#1d4ed8" },
  CORRECTIVO: { bg: "#fee2e2", color: "#dc2626" },
};
const ESTADO_BADGE = {
  ABIERTO:    { bg: "#dcfce7", color: "#16a34a" },
  EN_PROCESO: { bg: "#fef9c3", color: "#a16207" },
  CERRADO:    { bg: "#f3f4f6", color: "#6b7280" },
};

function Badge({ value, map }) {
  const s = map[value?.toUpperCase()] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20,
      padding: "2px 10px", fontWeight: 700, fontSize: "0.8rem" }}>
      {value?.replace("_", " ") ?? "—"}
    </span>
  );
}

const columnas = [
  { key: "mantenimientoId",  label: "ID",          ancho: 70,
    render: m => `#${m.mantenimientoId}` },
  { key: "tipoMantenimiento", label: "Tipo",        ancho: 120,
    render: m => <Badge value={m.tipoMantenimiento} map={TIPO_BADGE} /> },
  { key: "descripcion",      label: "Descripción",  ancho: 280,
    render: m => m.descripcion?.length > 70 ? `${m.descripcion.substring(0, 70)}…` : m.descripcion },
  { key: "estado",           label: "Estado",       ancho: 120,
    render: m => <Badge value={m.estado} map={ESTADO_BADGE} /> },
  { key: "fechaProgramada",  label: "Fecha prog.",  ancho: 120,
    render: m => m.fechaProgramada ?? "—" },
];

// ─── Formulario ──────────────────────────────────────────────────────────────
const FORM_VACIO = {
  tipoMantenimiento: "PREVENTIVO",
  descripcion:       "",
  fechaProgramada:   "",
  estado:            "ABIERTO",
  responsableId:     "",
  equipoId:          "",
};

function MantenimientoForm({ initial, onGuardar, onCancelar, loading }) {
  const [form, setForm]         = useState(initial);
  const [usuarios, setUsuarios] = useState([]);
  const [equipos,  setEquipos]  = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([http("/api/Usuarios"), http("/api/Equipo")])
      .then(([rU, rE]) => {
        setUsuarios(Array.isArray(rU.datos) ? rU.datos : rU.datos ? [rU.datos] : []);
        setEquipos(Array.isArray(rE.datos) ? rE.datos : rE.datos ? [rE.datos] : []);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    onGuardar({
      tipoMantenimiento: form.tipoMantenimiento,
      descripcion:       form.descripcion.trim(),
      fechaProgramada:   form.fechaProgramada || null,
      estado:            form.estado || "ABIERTO",
      responsableId:     form.responsableId ? parseInt(form.responsableId) : null,
      equipoId:          form.equipoId || null,
    });
  };

  if (cargando) return <div style={{ color: "#888", padding: "16px 0" }}>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Descripción — ancho completo */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Descripción <span style={{ color: "#ef4444" }}>*</span></label>
        <textarea value={form.descripcion} onChange={set("descripcion")} required rows={3}
          placeholder="Detalla el mantenimiento a realizar..."
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tipo <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.tipoMantenimiento} onChange={set("tipoMantenimiento")} required
            style={{ ...inputStyle, cursor: "pointer" }}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Estado</label>
          <select value={form.estado} onChange={set("estado")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {ESTADOS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Fecha programada (opcional)</label>
          <input type="date" value={form.fechaProgramada ?? ""} onChange={set("fechaProgramada")}
            style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Equipo (opcional)</label>
          <select value={form.equipoId ?? ""} onChange={set("equipoId")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— Sin equipo —</option>
            {equipos.map(e => (
              <option key={e.equipoId} value={e.equipoId}>
                {e.nombre ?? e.codigoPatrimonial ?? `Equipo #${e.equipoId}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Responsable / Técnico (opcional)</label>
          <select value={form.responsableId ?? ""} onChange={set("responsableId")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— Sin asignar —</option>
            {usuarios.map(u => (
              <option key={u.usuarioId} value={u.usuarioId}>
                {u.nombreCompleto ?? u.userName ?? `Usuario #${u.usuarioId}`}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button type="button" onClick={onCancelar}
          style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1.5px solid #d1d5db",
            background: "#fff", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            background: loading ? "#9ca3af" : "#4c7318", color: "#fff",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Guardando..." : "Guardar mantenimiento"}
        </button>
      </div>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MantenimientosPage() {
  const { crear, modificar, eliminar } = usePermiso("Mantenimientos");
  const usuarioActual = useSelector(selectUsuario);

  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo,   setFiltroTipo]   = useState("");
  const [modal,        setModal]        = useState({ open: false, variant: "error", message: "" });
  const [confirm,      setConfirm]      = useState({ open: false, id: null, loading: false });
  const [form,         setForm]         = useState(null);
  const [formLoading,  setFormLoading]  = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await mantenimientosApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar mantenimientos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      const payload = {
        ...valores,
        creadoPorId: form?.mantenimientoId ? undefined : (usuarioActual?.usuarioId ?? 0),
      };

      if (form?.mantenimientoId) {
        const res = await mantenimientosApi.actualizar(form.mantenimientoId, payload);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Mantenimiento actualizado correctamente." });
      } else {
        const res = await mantenimientosApi.crear({ ...payload, creadoPorId: usuarioActual?.usuarioId ?? 0 });
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Mantenimiento creado correctamente." });
      }
      setForm(null);
      cargar();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    setConfirm(p => ({ ...p, loading: true }));
    try {
      const res = await mantenimientosApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Mantenimiento eliminado correctamente." });
      cargar();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const abrirEditar = m => setForm({
    mantenimientoId:   m.mantenimientoId,
    tipoMantenimiento: m.tipoMantenimiento ?? "PREVENTIVO",
    descripcion:       m.descripcion ?? "",
    fechaProgramada:   m.fechaProgramada ?? "",
    estado:            m.estado ?? "ABIERTO",
    responsableId:     m.responsableId ?? "",
    equipoId:          m.equipoId ?? "",
  });

  const filtrados = items.filter(m =>
    (filtroEstado ? m.estado?.toUpperCase() === filtroEstado : true) &&
    (filtroTipo   ? m.tipoMantenimiento?.toUpperCase() === filtroTipo : true) &&
    (m.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%", maxWidth: 1100 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: "1.3rem", fontWeight: 800, color: "#232946" }}>
          🔧 Mantenimientos
        </h2>
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por descripción..."
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", minWidth: 220 }} />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", cursor: "pointer" }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", cursor: "pointer" }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        {crear && (
          <button onClick={() => setForm({ ...FORM_VACIO })}
            style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff",
              border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
            + Nuevo mantenimiento
          </button>
        )}
      </div>

      <DataTable
        columnas={columnas} datos={filtrados} loading={loading}
        keyField="mantenimientoId" mensajeVacio="No hay mantenimientos registrados."
        onEdit={modificar ? abrirEditar : undefined}
        onDelete={eliminar ? m => setConfirm({ open: true, id: m.mantenimientoId, loading: false }) : undefined}
      />

      {form !== null && (
        <Overlay onCerrar={() => setForm(null)}>
          <div style={{ width: "100%", maxWidth: 560 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "1.15rem", fontWeight: 800,
              color: "#232946", textAlign: "center" }}>
              {form.mantenimientoId ? "✏️ Editar mantenimiento" : "🔧 Nuevo mantenimiento"}
            </h3>
            <MantenimientoForm
              initial={form}
              onGuardar={handleGuardar}
              onCancelar={() => setForm(null)}
              loading={formLoading}
            />
          </div>
        </Overlay>
      )}

      <ModalDialog open={modal.open} variant={modal.variant} message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })} />

      <ModalDialog
        open={confirm.open} variant="confirm" title="Eliminar mantenimiento"
        message="¿Seguro que deseas eliminar este mantenimiento? Esta acción no se puede deshacer."
        loading={confirm.loading} confirmText="Sí, eliminar" cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
      />
    </div>
  );
}
