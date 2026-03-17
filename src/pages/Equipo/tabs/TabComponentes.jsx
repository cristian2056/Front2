// src/pages/Equipo/tabs/TabComponentes.jsx
// Lista y gestiona los componentes físicos instalados en un equipo.
// El usuario escribe el nombre libremente; si no existe en el catálogo se crea automáticamente.
import React, { useEffect, useState } from "react";
import { componentesApi, composicionesApi } from "../../../api/componentes.api";
import { http } from "../../../services/http";
import EstadoBadge   from "../../../components/ui/EstadoBadge";
import ConfirmInline from "../../../components/ui/ConfirmInline";
import ErrorBanner   from "../../../components/ui/ErrorBanner";
import FormBotones   from "../../../components/ui/FormBotones";
import { inputStyle, labelStyle } from "../../../components/ui/formStyles";

const ESTADOS = ["INSTALADO", "RETIRADO", "EN_REPARACION", "RESERVA"];
const FORM_VACIO = {
  nombre: "", marcaId: "", codigo: "", numeroSerie: "",
  especificaciones: "", estado: "INSTALADO",
  fechaInstalacion: "", fechaRetiro: "", motivoRetiro: "",
};

// ─── Formulario de composición ────────────────────────────────────────────────
function FormComposicion({ initial = FORM_VACIO, onGuardar, onCancelar, loading }) {
  const [form, setForm] = useState(initial);
  const [marcas, setMarcas] = useState([]);

  useEffect(() => {
    http("/api/Marcas").then(r => setMarcas(r.datos ?? [])).catch(() => {});
  }, []);

  const set = (campo) => (e) => setForm(p => ({ ...p, [campo]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.nombre.trim().length < 3) return; // backend requiere mínimo 3 caracteres
    onGuardar({ ...form, marcaId: form.marcaId ? parseInt(form.marcaId) : null });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>

        <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Componente <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="text" value={form.nombre} onChange={set("nombre")} required minLength={3}
            placeholder="Ej: Procesador Intel Core i7, RAM 8GB DDR4..."
            style={inputStyle} />
          {form.nombre.trim().length > 0 && form.nombre.trim().length < 3 && (
            <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 4 }}>Mínimo 3 caracteres</div>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Marca</label>
          <select value={form.marcaId} onChange={set("marcaId")} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">-- Sin marca --</option>
            {marcas.map(m => <option key={m.marcaId} value={m.marcaId}>{m.nombre}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Estado <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.estado} onChange={set("estado")} style={{ ...inputStyle, cursor: "pointer" }}>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Código</label>
          <input type="text" placeholder="Ej: CPU-001" value={form.codigo} onChange={set("codigo")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nº de Serie</label>
          <input type="text" placeholder="Ej: SN123456" value={form.numeroSerie} onChange={set("numeroSerie")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Fecha Instalación</label>
          <input type="date" value={form.fechaInstalacion} onChange={set("fechaInstalacion")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Fecha Retiro</label>
          <input type="date" value={form.fechaRetiro} onChange={set("fechaRetiro")} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Especificaciones</label>
        <textarea placeholder="Ej: Intel Core i7 10ma gen, 3.8GHz..."
          value={form.especificaciones} onChange={set("especificaciones")}
          rows={2} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      {/* Motivo de retiro solo cuando no está instalado */}
      {form.estado !== "INSTALADO" && (
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Motivo de Retiro</label>
          <input type="text" placeholder="Opcional" value={form.motivoRetiro} onChange={set("motivoRetiro")} style={inputStyle} />
        </div>
      )}

      <FormBotones onCancelar={onCancelar} loading={loading} textoGuardar="Guardar componente" />
    </form>
  );
}

// ─── Tab principal ─────────────────────────────────────────────────────────────
export default function TabComponentes({ equipoId, crear, modificar, eliminar }) {
  const [lista,       setLista]       = useState([]);
  const [catalogo,    setCatalogo]    = useState([]); // catálogo global de tipos de componente
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [confirmElim, setConfirmElim] = useState(null);

  const cargar = async () => {
    setLoading(true); setError("");

    // 1. Catálogo de tipos de componente — debe cargar siempre para resolver IDs
    try {
      const rCat = await componentesApi.listar();
      setCatalogo(Array.isArray(rCat.datos) ? rCat.datos : []);
    } catch { /* si falla el catálogo, seguimos con [] */ }

    // 2. Composiciones del equipo — se intenta por equipo, luego listar+filtrar
    try {
      try {
        const rComp = await composicionesApi.listarPorEquipo(equipoId);
        setLista(Array.isArray(rComp.datos) ? rComp.datos : []);
      } catch {
        const rComp = await composicionesApi.listar();
        const todas = Array.isArray(rComp.datos) ? rComp.datos : [];
        setLista(todas.filter(c => String(c.equipoId) === String(equipoId)));
      }
    } catch {
      setLista([]); // ambos fallaron, lista vacía sin bloquear
    }

    setLoading(false);
  };

  useEffect(() => { cargar(); }, [equipoId]);

  // Reutiliza componente existente por nombre o crea uno nuevo en el catálogo
  const resolverComponenteId = async (nombre) => {
    const existente = catalogo.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (existente) return parseInt(existente.componenteId);
    const res = await componentesApi.crear({ nombre });
    if (res.exito === false) throw new Error(res.mensaje || "No se pudo crear el componente.");
    const id = res.datos?.componenteId ?? res.datos?.ComponenteId ?? res.datos?.id ?? res.datos?.Id ?? res.datos;
    return parseInt(id);
  };

  const handleGuardar = async (valores) => {
    setGuardando(true); setError("");
    try {
      const componenteId = await resolverComponenteId(valores.nombre);
      const payload = {
        equipoId:         parseInt(equipoId),
        componenteId:     parseInt(componenteId),   // Int64 requerido por el backend
        marcaId:          valores.marcaId          || null,
        codigo:           valores.codigo           || null,
        numeroSerie:      valores.numeroSerie      || null,
        especificaciones: valores.especificaciones || null,
        estado:           valores.estado,
        fechaInstalacion: valores.fechaInstalacion || null,
        fechaRetiro:      valores.fechaRetiro      || null,
        motivoRetiro:     valores.motivoRetiro     || null,
      };
      if (editando) {
        await composicionesApi.actualizar(editando.composicionId, payload);
      } else {
        await composicionesApi.crear(payload);
      }
      setMostrarForm(false); setEditando(null);
      await cargar();
    } catch (e) {
      setError(e.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await composicionesApi.eliminar(id);
      setConfirmElim(null);
      cargar();
    } catch (e) {
      setError(e.message || "No se pudo eliminar.");
    }
  };

  const cerrarForm = () => { setMostrarForm(false); setEditando(null); };

  const initialEditar = editando ? {
    nombre:           catalogo.find(c => c.componenteId === editando.componenteId)?.nombre ?? editando.componenteNombre ?? "",
    marcaId:          editando.marcaId          ?? "",
    codigo:           editando.codigo           ?? "",
    numeroSerie:      editando.numeroSerie      ?? "",
    especificaciones: editando.especificaciones ?? "",
    estado:           editando.estado           ?? "INSTALADO",
    fechaInstalacion: editando.fechaInstalacion ?? "",
    fechaRetiro:      editando.fechaRetiro      ?? "",
    motivoRetiro:     editando.motivoRetiro     ?? "",
  } : FORM_VACIO;

  return (
    <div>
      <ErrorBanner mensaje={error} />

      {!mostrarForm && crear && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setMostrarForm(true)}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#4c7318", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            + Agregar componente
          </button>
        </div>
      )}

      {mostrarForm && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 16px", fontSize: "0.97rem", fontWeight: 700, color: "#232946" }}>
            {editando ? "✏️ Editar componente" : "➕ Nuevo componente"}
          </h4>
          <FormComposicion initial={initialEditar} onGuardar={handleGuardar} onCancelar={cerrarForm} loading={guardando} />
        </div>
      )}

      {loading ? (
        <div style={{ color: "#888", padding: "16px 0" }}>Cargando componentes...</div>
      ) : lista.length === 0 ? (
        <div style={{ color: "#9ca3af", padding: "24px 0", textAlign: "center", fontSize: "0.93rem" }}>
          🔧 No hay componentes registrados para este equipo.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map((comp) => {
            const nombre = catalogo.find(c => c.componenteId === comp.componenteId)?.nombre
              ?? comp.componenteNombre ?? `Componente #${comp.componenteId}`;
            return (
              <div key={comp.composicionId} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.97rem", color: "#232946" }}>
                    {nombre}
                    {comp.marcaNombre && <span style={{ color: "#6b7280", fontWeight: 400 }}> · {comp.marcaNombre}</span>}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "#6b7280", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
                    {comp.especificaciones  && <span>{comp.especificaciones}</span>}
                    {comp.numeroSerie       && <span>S/N: {comp.numeroSerie}</span>}
                    {comp.codigo           && <span>Cód: {comp.codigo}</span>}
                    {comp.fechaInstalacion && <span>Instalado: {comp.fechaInstalacion}</span>}
                  </div>
                </div>

                <EstadoBadge estado={comp.estado} tipo="componente" />

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {modificar && (
                    <button onClick={() => { setEditando(comp); setMostrarForm(true); }}
                      style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>✏️</button>
                  )}
                  {eliminar && (confirmElim === comp.composicionId ? (
                    <ConfirmInline
                      onConfirmar={() => handleEliminar(comp.composicionId)}
                      onCancelar={() => setConfirmElim(null)}
                    />
                  ) : (
                    <button onClick={() => setConfirmElim(comp.composicionId)}
                      style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: "0.85rem" }}>🗑️</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
