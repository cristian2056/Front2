// src/pages/Equipo/EquipoWizard.jsx
// Wizard flotante para crear un equipo nuevo paso a paso.
// Paso 1: Datos del equipo (obligatorio, crea el equipo en el backend)
// Pasos 2-6: Componentes, Software, Red, Fotos, Asignación (opcionales, usan las tabs existentes)

import React, { useState } from "react";
import { equiposApi } from "../../api/equipos.api";
import { http } from "../../services/http";
import TabComponentes from "./tabs/TabComponentes";
import TabSoftware    from "./tabs/TabSoftware";
import TabRed         from "./tabs/TabRed";
import TabFotos       from "./tabs/TabFotos";
import TabAsignacion  from "./tabs/TabAsignacion";

// ─── Estilos reutilizables ────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 9,
  border: "1.5px solid #d1d5db", fontSize: "0.97rem",
  boxSizing: "border-box", outline: "none", background: "#fff", color: "#111",
};
const labelStyle = {
  display: "block", fontWeight: 600, marginBottom: 6,
  color: "#374151", fontSize: "0.9rem",
};
const COLOR = { primary: "#4c7318", primaryHover: "#3e5b19", disabled: "#9ca3af" };
const ESTADOS = ["ACTIVO", "INACTIVO", "MANTENIMIENTO", "BAJA"];

// ─── Pasos del wizard ─────────────────────────────────────────────────────────
const PASOS = [
  { num: 1, label: "Equipo",       icon: "🖥️"  },
  { num: 2, label: "Componentes",  icon: "🔧"  },
  { num: 3, label: "Software",     icon: "💿"  },
  { num: 4, label: "Red",          icon: "🌐"  },
  { num: 5, label: "Fotos",        icon: "📷"  },
  { num: 6, label: "Asignación",   icon: "👤"  },
];

// ─── Indicador de pasos ───────────────────────────────────────────────────────
function PasoIndicador({ pasoActual, pasoCompletado }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 0, padding: "0 8px", overflowX: "auto",
    }}>
      {PASOS.map((paso, i) => {
        const completado = paso.num < pasoActual || paso.num <= pasoCompletado;
        const activo     = paso.num === pasoActual;
        return (
          <React.Fragment key={paso.num}>
            {/* Línea conectora */}
            {i > 0 && (
              <div style={{
                flex: 1, height: 2, minWidth: 16,
                background: completado ? COLOR.primary : "#e5e7eb",
                transition: "background 0.3s",
              }} />
            )}
            {/* Círculo del paso */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.78rem",
                background: activo ? COLOR.primary : completado ? "#dcfce7" : "#f3f4f6",
                color: activo ? "#fff" : completado ? COLOR.primary : "#9ca3af",
                border: activo ? `2px solid ${COLOR.primary}` : completado ? `2px solid ${COLOR.primary}` : "2px solid #e5e7eb",
                transition: "all 0.3s", flexShrink: 0,
              }}>
                {completado && !activo ? "✓" : paso.icon}
              </div>
              <span style={{
                fontSize: "0.65rem", fontWeight: activo ? 700 : 500,
                color: activo ? COLOR.primary : completado ? "#374151" : "#9ca3af",
                whiteSpace: "nowrap",
              }}>
                {paso.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Paso 1: Form de datos del equipo ─────────────────────────────────────────
function PasoEquipo({ onCreado, onCancelar }) {
  const [form, setForm] = useState({
    codigoPatrimonial: "", codigoInterno: "", serial: "", nombre: "",
    tipoActivoId: "", marcaId: "", proveedorId: "", estado: "ACTIVO",
    fechaGarantia: "", numeroFactura: "", mantenimientoProximaFecha: "",
    mantenimientoFrecuenciaDias: "", observaciones: "", activo: true, fotoId: 1,
  });
  const [marcas,      setMarcas]      = useState([]);
  const [tiposActivo, setTiposActivo] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loadingListas, setLoadingListas] = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState("");

  React.useEffect(() => {
    Promise.all([
      http("/api/Marcas"),
      http("/api/TiposActivos"),
      http("/api/Proveedores"),
    ]).then(([rMarcas, rTipos, rProveedores]) => {
      setMarcas(rMarcas.datos        ?? []);
      setTiposActivo(rTipos.datos    ?? []);
      setProveedores(rProveedores.datos ?? []);
    }).catch(console.error)
      .finally(() => setLoadingListas(false));
  }, []);

  const set = (campo) => (e) => setForm(p => ({ ...p, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true); setError("");
    try {
      const payload = {
        ...form,
        tipoActivoId:                parseInt(form.tipoActivoId) || 0,
        marcaId:                     form.marcaId     ? parseInt(form.marcaId)     : null,
        proveedorId:                 form.proveedorId ? parseInt(form.proveedorId) : null,
        mantenimientoFrecuenciaDias: form.mantenimientoFrecuenciaDias ? parseInt(form.mantenimientoFrecuenciaDias) : null,
        fechaGarantia:               form.fechaGarantia            || null,
        mantenimientoProximaFecha:   form.mantenimientoProximaFecha || null,
        observaciones:               form.observaciones.trim()      || null,
        codigoInterno:               form.codigoInterno.trim()      || null,
        serial:                      form.serial.trim()             || null,
        nombre:                      form.nombre.trim()             || null,
        numeroFactura:               form.numeroFactura.trim()      || null,
      };
      const resultado = await equiposApi.crear(payload);
      if (!resultado.exito) throw new Error(resultado.mensaje || "No se pudo crear el equipo.");
      onCreado(resultado.datos);
    } catch (e) {
      setError(e.message || "Error al crear el equipo.");
    } finally {
      setGuardando(false);
    }
  };

  if (loadingListas) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>Cargando datos...</div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: "#dc2626", background: "#fee2e2", padding: "8px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Cód. Patrimonial <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="text" placeholder="Ej: SM-MJ0KNV05"
            value={form.codigoPatrimonial} onChange={set("codigoPatrimonial")}
            required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Cód. Interno</label>
          <input type="text" placeholder="Opcional"
            value={form.codigoInterno} onChange={set("codigoInterno")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre</label>
          <input type="text" placeholder="Ej: Computadora de escritorio"
            value={form.nombre} onChange={set("nombre")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Serial</label>
          <input type="text" placeholder="Ej: MJ0KNV05"
            value={form.serial} onChange={set("serial")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tipo de Activo <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.tipoActivoId} onChange={set("tipoActivoId")} required
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">-- Seleccionar --</option>
            {tiposActivo.map(t => <option key={t.tipoActivoId} value={t.tipoActivoId}>{t.nombre}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Estado <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.estado} onChange={set("estado")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Marca</label>
          <select value={form.marcaId} onChange={set("marcaId")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">-- Sin marca --</option>
            {marcas.map(m => <option key={m.marcaId} value={m.marcaId}>{m.nombre}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Proveedor</label>
          <select value={form.proveedorId} onChange={set("proveedorId")}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">-- Sin proveedor --</option>
            {proveedores.map(p => <option key={p.proveedorId} value={p.proveedorId}>{p.nombre}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nº Factura</label>
          <input type="text" placeholder="Ej: F001-00123"
            value={form.numeroFactura} onChange={set("numeroFactura")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Fecha Garantía</label>
          <input type="date" value={form.fechaGarantia}
            onChange={set("fechaGarantia")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Próx. Mantenimiento</label>
          <input type="date" value={form.mantenimientoProximaFecha}
            onChange={set("mantenimientoProximaFecha")} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Frec. Mantenimiento (días)</label>
          <input type="number" placeholder="Ej: 180"
            value={form.mantenimientoFrecuenciaDias}
            onChange={set("mantenimientoFrecuenciaDias")} min={1} style={inputStyle} />
        </div>

      </div>

      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" id="activo" checked={form.activo}
          onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))}
          style={{ width: 18, height: 18, cursor: "pointer" }} />
        <label htmlFor="activo" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
          Equipo activo
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Observaciones</label>
        <textarea placeholder="Notas adicionales..."
          value={form.observaciones} onChange={set("observaciones")}
          rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onCancelar}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 9,
            border: "1.5px solid #d1d5db", background: "#fff",
            fontWeight: 600, fontSize: "0.97rem", cursor: "pointer", color: "#374151",
          }}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando}
          style={{
            flex: 2, padding: "10px 0", borderRadius: 9, border: "none",
            background: guardando ? COLOR.disabled : COLOR.primary,
            color: "#fff", fontWeight: 700, fontSize: "0.97rem",
            cursor: guardando ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => { if (!guardando) e.currentTarget.style.background = COLOR.primaryHover; }}
          onMouseLeave={e => { if (!guardando) e.currentTarget.style.background = COLOR.primary; }}
        >
          {guardando ? "Creando equipo..." : "Crear equipo y continuar →"}
        </button>
      </div>
    </form>
  );
}

// ─── Wrapper de pasos 2-6 (tabs existentes) ───────────────────────────────────
function PasoDetalle({ paso, equipoId, onSiguiente, onAnterior, esFinal }) {
  return (
    <div>
      {/* Contenido del paso */}
      <div style={{ minHeight: 200 }}>
        {paso === 2 && <TabComponentes equipoId={equipoId} crear modificar eliminar />}
        {paso === 3 && <TabSoftware    equipoId={equipoId} crear modificar eliminar />}
        {paso === 4 && <TabRed         equipoId={equipoId} crear modificar eliminar />}
        {paso === 5 && <TabFotos       equipoId={equipoId} crear eliminar />}
        {paso === 6 && <TabAsignacion  equipoId={equipoId} crear modificar eliminar />}
      </div>

      {/* Navegación */}
      <div style={{
        display: "flex", gap: 10, marginTop: 24,
        paddingTop: 16, borderTop: "1px solid #e5e7eb",
      }}>
        <button type="button" onClick={onAnterior}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 9,
            border: "1.5px solid #d1d5db", background: "#fff",
            fontWeight: 600, fontSize: "0.97rem", cursor: "pointer", color: "#374151",
          }}>
          ← Anterior
        </button>
        <button type="button" onClick={onSiguiente}
          style={{
            flex: 2, padding: "10px 0", borderRadius: 9, border: "none",
            background: COLOR.primary, color: "#fff",
            fontWeight: 700, fontSize: "0.97rem", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = COLOR.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = COLOR.primary}
        >
          {esFinal ? "✅ Finalizar" : `Continuar → ${PASOS[paso]?.label ?? ""}`}
        </button>
      </div>
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────
export default function EquipoWizard({ onCerrar, onEquipoCreado }) {
  const [pasoActual,    setPasoActual]    = useState(1);
  const [equipoCreado,  setEquipoCreado]  = useState(null);
  const [pasoMaximo,    setPasoMaximo]    = useState(1);

  const handleEquipoCreado = (equipo) => {
    setEquipoCreado(equipo);
    setPasoActual(2);
    setPasoMaximo(2);
    // Notifica a EquiposPage para refrescar la tabla
    onEquipoCreado?.(equipo);
  };

  const irA = (num) => {
    if (num < 1) return;
    if (num > PASOS.length) { onCerrar(); return; }
    setPasoActual(num);
    setPasoMaximo(p => Math.max(p, num));
  };

  const tituloPaso = PASOS[pasoActual - 1];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 3000, padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        width: "100%", maxWidth: 560,
        maxHeight: "95vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        border: "2px solid #e5e7eb",
      }}>

        {/* Header */}
        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#232946" }}>
              {tituloPaso.icon} {pasoActual === 1 ? "Nuevo equipo" : tituloPaso.label}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
                Paso {pasoActual} de {PASOS.length}
              </span>
              <button onClick={onCerrar}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "1.4rem", color: "#9ca3af", lineHeight: 1, padding: 0,
                }}>×</button>
            </div>
          </div>

          {/* Indicador de pasos */}
          <PasoIndicador pasoActual={pasoActual} pasoCompletado={pasoMaximo} />

          {/* Descripción del paso */}
          <p style={{ margin: "14px 0 0", color: "#6b7280", fontSize: "0.85rem" }}>
            {pasoActual === 1 && "Completa los datos principales del equipo para continuar."}
            {pasoActual === 2 && equipoCreado && `Agrega los componentes instalados en "${equipoCreado.nombre ?? equipoCreado.codigoPatrimonial}". Puedes saltar este paso.`}
            {pasoActual === 3 && "Registra el software instalado en el equipo. Puedes saltar este paso."}
            {pasoActual === 4 && "Configura los datos de red del equipo. Puedes saltar este paso."}
            {pasoActual === 5 && "Agrega fotos del equipo. Puedes saltar este paso."}
            {pasoActual === 6 && "Asigna el equipo a un usuario y dependencia. Puedes saltar este paso."}
          </p>
        </div>

        {/* Barra de progreso */}
        <div style={{ height: 4, background: "#f3f4f6", margin: "14px 0 0" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: COLOR.primary,
            width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%`,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Contenido scrolleable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 22px" }}>
          {pasoActual === 1 && (
            <PasoEquipo
              onCreado={handleEquipoCreado}
              onCancelar={onCerrar}
            />
          )}
          {pasoActual >= 2 && equipoCreado && (
            <PasoDetalle
              paso={pasoActual}
              equipoId={equipoCreado.equipoId}
              onSiguiente={() => irA(pasoActual + 1)}
              onAnterior={() => irA(pasoActual - 1)}
              esFinal={pasoActual === PASOS.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}