// src/pages/Tikets/TiketsPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ticketsApi } from "../../api/tickets.api";
import { http } from "../../services/http";
import DataTable    from "../../components/ui/DataTable";
import ModalDialog  from "../../components/ui/ModalDialog";
import Overlay      from "../../components/ui/Overlay";
import { usePermiso } from "../../stores/menuSlice";
import { selectUsuario } from "../../stores/authSlice";
import { inputStyle, labelStyle } from "../../components/ui/formStyles";

const PRIORIDADES = ["alta", "media", "baja"];
const ESTADOS     = ["abierto", "en_proceso", "cerrado"];

const PRIORIDAD_BADGE = {
  alta:   { bg: "#fee2e2", color: "#dc2626" },
  media:  { bg: "#fef9c3", color: "#a16207" },
  baja:   { bg: "#dcfce7", color: "#16a34a" },
};
const ESTADO_BADGE = {
  abierto:    { bg: "#dbeafe", color: "#1d4ed8" },
  en_proceso: { bg: "#fef9c3", color: "#a16207" },
  cerrado:    { bg: "#f3f4f6", color: "#6b7280" },
};

function Badge({ value, map }) {
  const s = map[value?.toLowerCase()] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20,
      padding: "2px 10px", fontWeight: 700, fontSize: "0.8rem" }}>
      {value?.replace("_", " ") ?? "—"}
    </span>
  );
}

const columnas = [
  { key: "ticketId",      label: "ID",         ancho: 70,  render: t => `#${t.ticketId}` },
  { key: "serie",         label: "Serie",       ancho: 130 },
  { key: "solicitud",     label: "Solicitud",   ancho: 280,
    render: t => t.solicitud?.length > 70 ? `${t.solicitud.substring(0, 70)}…` : t.solicitud },
  { key: "prioridad",     label: "Prioridad",   ancho: 100,
    render: t => <Badge value={t.prioridad} map={PRIORIDAD_BADGE} /> },
  { key: "estado",        label: "Estado",      ancho: 120,
    render: t => <Badge value={t.estado} map={ESTADO_BADGE} /> },
  { key: "fechaCreacion", label: "Fecha",       ancho: 110,
    render: t => t.fechaCreacion ? String(t.fechaCreacion).substring(0, 10) : "—" },
];

// ─── Formulario ──────────────────────────────────────────────────────────────
const FORM_VACIO = {
  serie: "", solicitud: "", prioridad: "media", estado: "abierto",
  usuarioSolicitanteId: "", usuarioTecnicoId: "", equipoId: "",
};

function TicketForm({ initial, onGuardar, onCancelar, loading }) {
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
      serie:                form.serie.trim(),
      solicitud:            form.solicitud.trim(),
      prioridad:            form.prioridad || "media",
      estado:               form.estado || "abierto",
      usuarioSolicitanteId: parseInt(form.usuarioSolicitanteId) || 0,
      usuarioTecnicoId:     form.usuarioTecnicoId ? parseInt(form.usuarioTecnicoId) : null,
      equipoId:             form.equipoId ? parseInt(form.equipoId) : null,
    });
  };

  if (cargando) return <div style={{ color: "#888", padding: "16px 0" }}>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Solicitud — ancho completo */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Solicitud / Descripción <span style={{ color: "#ef4444" }}>*</span></label>
        <textarea value={form.solicitud} onChange={set("solicitud")} required minLength={10} rows={3}
          placeholder="Describe el problema o solicitud (mínimo 10 caracteres)..."
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Serie <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="text" value={form.serie} onChange={set("serie")} required
            placeholder="Ej: TK-2024-001" style={inputStyle} />
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

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Prioridad</label>
          <select value={form.prioridad} onChange={set("prioridad")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {PRIORIDADES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Estado</label>
          <select value={form.estado} onChange={set("estado")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {ESTADOS.map(s => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Solicitante <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.usuarioSolicitanteId} onChange={set("usuarioSolicitanteId")} required
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— Seleccionar —</option>
            {usuarios.map(u => (
              <option key={u.usuarioId} value={u.usuarioId}>
                {u.nombreCompleto ?? u.userName ?? `Usuario #${u.usuarioId}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Técnico asignado (opcional)</label>
          <select value={form.usuarioTecnicoId ?? ""} onChange={set("usuarioTecnicoId")}
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
          {loading ? "Guardando..." : "Guardar ticket"}
        </button>
      </div>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function TiketsPage() {
  const { crear, modificar, eliminar } = usePermiso("Tickets");
  const usuarioActual = useSelector(selectUsuario);

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, id: null, loading: false });
  const [form,        setForm]        = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar tickets." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.ticketId) {
        const res = await ticketsApi.actualizar(form.ticketId, valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Ticket actualizado correctamente." });
      } else {
        const res = await ticketsApi.crear(valores);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Ticket creado correctamente." });
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
      const res = await ticketsApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Ticket eliminado correctamente." });
      cargar();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const abrirNuevo = () => setForm({
    ...FORM_VACIO,
    usuarioSolicitanteId: usuarioActual?.usuarioId ?? "",
  });

  const abrirEditar = t => setForm({
    ticketId:             t.ticketId,
    serie:                t.serie ?? "",
    solicitud:            t.solicitud ?? "",
    prioridad:            t.prioridad ?? "media",
    estado:               t.estado ?? "abierto",
    usuarioSolicitanteId: t.usuarioSolicitanteId ?? "",
    usuarioTecnicoId:     t.usuarioTecnicoId ?? "",
    equipoId:             t.equipoId ?? "",
  });

  const filtrados = items.filter(t =>
    (filtroEstado ? t.estado === filtroEstado : true) &&
    [t.serie, t.solicitud].some(v => (v ?? "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div style={{ width: "100%", maxWidth: 1100 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: "1.3rem", fontWeight: 800, color: "#232946" }}>
          🎫 Tickets
        </h2>
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por serie o descripción..."
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", minWidth: 240 }} />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", cursor: "pointer" }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        {crear && (
          <button onClick={abrirNuevo}
            style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff",
              border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
            + Nuevo ticket
          </button>
        )}
      </div>

      <DataTable
        columnas={columnas} datos={filtrados} loading={loading}
        keyField="ticketId" mensajeVacio="No hay tickets registrados."
        onEdit={modificar ? abrirEditar : undefined}
        onDelete={eliminar ? t => setConfirm({ open: true, id: t.ticketId, loading: false }) : undefined}
      />

      {form !== null && (
        <Overlay onCerrar={() => setForm(null)}>
          <div style={{ width: "100%", maxWidth: 560 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "1.15rem", fontWeight: 800,
              color: "#232946", textAlign: "center" }}>
              {form.ticketId ? "✏️ Editar ticket" : "🎫 Nuevo ticket"}
            </h3>
            <TicketForm
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
        open={confirm.open} variant="confirm" title="Eliminar ticket"
        message="¿Seguro que deseas eliminar este ticket? Esta acción no se puede deshacer."
        loading={confirm.loading} confirmText="Sí, eliminar" cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
      />
    </div>
  );
}
