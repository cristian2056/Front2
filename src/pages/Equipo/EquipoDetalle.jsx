// src/pages/Equipo/EquipoDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { equiposApi } from "../../api/equipos.api";
import { usePermiso } from "../../stores/menuSlice";
import TabInfoGeneral from "./tabs/TabInfoGeneral";
import TabComponentes from "./tabs/TabComponentes";
import TabSoftware    from "./tabs/TabSoftware";
import TabRed         from "./tabs/TabRed";
import TabFotos       from "./tabs/TabFotos";
import TabAsignacion  from "./tabs/TabAsignacion";

const TABS = [
  { key: "info",        label: "📋 Info General" },
  { key: "componentes", label: "🔧 Componentes"  },
  { key: "software",    label: "💿 Software"      },
  { key: "red",         label: "🌐 Red"           },
  { key: "fotos",       label: "📷 Fotos"         },
  { key: "asignacion",  label: "👤 Asignación"    },
];

export default function EquipoDetalle() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { crear, modificar, eliminar } = usePermiso("Equipos");
  const [equipo,    setEquipo]   = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState("");
  const [tabActiva, setTabActiva] = useState("info");

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await equiposApi.obtener(id);
        if (data.exito) setEquipo(data.datos);
        else setError(data.mensaje || "No se pudo cargar el equipo.");
      } catch (e) {
        setError(e.message || "Error de conexión.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: "#888" }}>Cargando equipo...</div>;

  if (error) return (
    <div style={{ padding: 40 }}>
      <div style={{ color: "#dc2626", marginBottom: 16 }}>{error}</div>
      <button onClick={() => navigate("/equipos")}
        style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#4c7318", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
        ← Volver a equipos
      </button>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1100 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/equipos")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#4c7318" }}>
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>
            {equipo.nombre ?? equipo.codigoPatrimonial}
          </h2>
          <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Cód. Patrimonial: {equipo.codigoPatrimonial}
            {equipo.serial ? ` · Serial: ${equipo.serial}` : ""}
          </span>
        </div>
        <span style={{
          marginLeft: "auto", padding: "4px 14px", borderRadius: 20,
          background: equipo.activo ? "#dcfce7" : "#fee2e2",
          color: equipo.activo ? "#16a34a" : "#dc2626",
          fontWeight: 700, fontSize: "0.85rem",
        }}>
          {equipo.estado}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 24, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setTabActiva(tab.key)}
            style={{
              padding: "10px 18px", border: "none",
              borderBottom: tabActiva === tab.key ? "3px solid #4c7318" : "3px solid transparent",
              background: "none", cursor: "pointer",
              fontWeight: tabActiva === tab.key ? 700 : 500,
              color: tabActiva === tab.key ? "#4c7318" : "#6b7280",
              fontSize: "0.93rem", marginBottom: -2, whiteSpace: "nowrap",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {tabActiva === "info"        && <TabInfoGeneral  equipo={equipo} equipoId={id} onActualizado={setEquipo} modificar={modificar} />}
        {tabActiva === "componentes" && <TabComponentes  equipoId={id} crear={crear} modificar={modificar} eliminar={eliminar} />}
        {tabActiva === "software"    && <TabSoftware     equipoId={id} crear={crear} modificar={modificar} eliminar={eliminar} />}
        {tabActiva === "red"         && <TabRed          equipoId={id} crear={crear} modificar={modificar} eliminar={eliminar} />}
        {tabActiva === "fotos"       && <TabFotos        equipoId={id} crear={crear} eliminar={eliminar} />}
        {tabActiva === "asignacion"  && <TabAsignacion   equipoId={id} crear={crear} modificar={modificar} eliminar={eliminar} />}
      </div>
    </div>
  );
}