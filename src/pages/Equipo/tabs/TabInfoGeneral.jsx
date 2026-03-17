// src/pages/Equipo/tabs/TabInfoGeneral.jsx
// Muestra los datos del equipo resolviendo IDs a nombres.
// Incluye botón para editar los datos básicos mediante EquipoForm.
import React, { useEffect, useState } from "react";
import { http } from "../../../services/http";
import { equiposApi } from "../../../api/equipos.api";
import EquipoForm   from "../EquipoForm";
import EstadoBadge  from "../../../components/ui/EstadoBadge";
import CampoLectura from "../../../components/ui/CampoLectura";
import ErrorBanner  from "../../../components/ui/ErrorBanner";

export default function TabInfoGeneral({ equipo, equipoId, onActualizado, modificar }) {
  const [marcas,      setMarcas]      = useState([]);
  const [tiposActivo, setTiposActivo] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [editando,    setEditando]    = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState("");

  // Carga catálogos para resolver IDs a nombres legibles
  useEffect(() => {
    Promise.all([
      http("/api/Marcas"),
      http("/api/TiposActivos"),
      http("/api/Proveedores"),
    ]).then(([rM, rT, rP]) => {
      setMarcas(rM.datos      ?? []);
      setTiposActivo(rT.datos ?? []);
      setProveedores(rP.datos ?? []);
    }).catch(console.error);
  }, []);

  const nombreMarca      = marcas.find(m => m.marcaId         === equipo.marcaId)?.nombre      ?? null;
  const nombreTipoActivo = tiposActivo.find(t => t.tipoActivoId === equipo.tipoActivoId)?.nombre ?? null;
  const nombreProveedor  = proveedores.find(p => p.proveedorId  === equipo.proveedorId)?.nombre  ?? null;

  const handleGuardar = async (valores) => {
    setGuardando(true); setError("");
    try {
      const res = await equiposApi.actualizar(equipoId, valores);
      onActualizado?.(res.datos ?? { ...equipo, ...valores });
      setEditando(false);
    } catch (e) {
      setError(e.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <ErrorBanner mensaje={error} />

      {/* Botón editar */}
      {modificar && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => setEditando(true)}
            style={{ padding: "8px 18px", borderRadius: 8, border: "1.5px solid #4c7318", background: "#f0fdf4", color: "#4c7318", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            ✏️ Editar datos
          </button>
        </div>
      )}

      {/* Grilla de campos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0 24px" }}>
        <CampoLectura label="Código Patrimonial" valor={equipo.codigoPatrimonial} />
        <CampoLectura label="Código Interno"     valor={equipo.codigoInterno} />
        <CampoLectura label="Nombre"             valor={equipo.nombre} />
        <CampoLectura label="Serial"             valor={equipo.serial} />

        {/* Estado con badge de color */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }}>Estado</div>
          <div style={{ padding: "7px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <EstadoBadge estado={equipo.estado} tipo="equipo" />
          </div>
        </div>

        <CampoLectura label="Tipo de Activo"              valor={nombreTipoActivo ?? (equipo.tipoActivoId ? `ID: ${equipo.tipoActivoId}` : null)} />
        <CampoLectura label="Marca"                       valor={nombreMarca      ?? (equipo.marcaId      ? `ID: ${equipo.marcaId}`      : null)} />
        <CampoLectura label="Proveedor"                   valor={nombreProveedor  ?? (equipo.proveedorId  ? `ID: ${equipo.proveedorId}`  : null)} />
        <CampoLectura label="Nº Factura"                  valor={equipo.numeroFactura} />
        <CampoLectura label="Garantía hasta"              valor={equipo.fechaGarantia} />
        <CampoLectura label="Próx. Mantenimiento"         valor={equipo.mantenimientoProximaFecha} />
        <CampoLectura label="Frec. Mantenimiento (días)"  valor={equipo.mantenimientoFrecuenciaDias} />
        <CampoLectura label="Activo"                      valor={equipo.activo ? "Sí" : "No"} />
      </div>

      <CampoLectura label="Observaciones" valor={equipo.observaciones} />

      {editando && (
        <EquipoForm
          initialData={equipo}
          onSubmit={handleGuardar}
          loading={guardando}
          onCancel={() => setEditando(false)}
        />
      )}
    </div>
  );
}
