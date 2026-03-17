// src/pages/EquiposRed/EquiposRedPage.jsx
// Vista global de todas las configuraciones de red registradas en el sistema.
// Permite crear, editar y eliminar registros de red vinculados a equipos.
import React, { useEffect, useState } from "react";
import { equipoRedApi } from "../../api/equipoExtras.api";
import { http } from "../../services/http";
import DataTable   from "../../components/ui/DataTable";
import ModalDialog from "../../components/ui/ModalDialog";
import FormModal   from "../../components/ui/FormModal";
import { usePermiso } from "../../stores/menuSlice";

const columnas = [
  { key: "equipoRedId", label: "ID",       ancho: 70,  render: r => `#${r.equipoRedId}` },
  { key: "equipoNombre",label: "Equipo",   ancho: 200, render: r => r._equipoNombre ?? `Equipo #${r.equipoId}` },
  { key: "ipAddress",   label: "IP",       ancho: 160 },
  { key: "macAddress",  label: "MAC",      ancho: 170 },
  { key: "gateway",     label: "Gateway",  ancho: 140, render: r => r.gateway ?? "—" },
  { key: "vlan",        label: "VLAN",     ancho: 80,  render: r => r.vlan ?? "—" },
  { key: "comentarios", label: "Notas",    ancho: 180, render: r => r.comentarios ?? "—" },
];

export default function EquiposRedPage() {
  const { crear, modificar, eliminar } = usePermiso("EquiposRed");

  const [items,       setItems]       = useState([]);
  const [equipos,     setEquipos]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [confirm,     setConfirm]     = useState({ open: false, id: null, loading: false });
  const [form,        setForm]        = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [dataRed, dataEq] = await Promise.all([
        equipoRedApi.listar(),
        http("/api/Equipo"),
      ]);
      const listaRed = Array.isArray(dataRed.datos) ? dataRed.datos : dataRed.datos ? [dataRed.datos] : [];
      const listaEq  = Array.isArray(dataEq.datos)  ? dataEq.datos  : dataEq.datos  ? [dataEq.datos]  : [];

      setEquipos(listaEq);

      // Enriquecer cada registro con el nombre del equipo para mostrarlo en la tabla
      const equipoMap = Object.fromEntries(listaEq.map(e => [e.equipoId, e.nombre ?? e.codigoPatrimonial ?? `Equipo #${e.equipoId}`]));
      setItems(listaRed.map(r => ({ ...r, _equipoNombre: equipoMap[r.equipoId] ?? `Equipo #${r.equipoId}` })));
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al cargar." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Opciones del select de equipos
  const equipoOptions = equipos.map(e => ({
    value: e.equipoId,
    label: e.nombre ?? e.codigoPatrimonial ?? `Equipo #${e.equipoId}`,
  }));

  const FIELDS = [
    { name: "equipoId",   label: "Equipo",      type: "select",  required: true, options: equipoOptions, numeric: true, span: 2 },
    { name: "ipAddress",  label: "IP Address",  type: "text",    required: true, placeholder: "Ej: 192.168.1.100" },
    { name: "macAddress", label: "MAC Address", type: "text",    required: true, placeholder: "Ej: AA:BB:CC:DD:EE:FF" },
    { name: "gateway",    label: "Gateway",     type: "text",    required: false, placeholder: "Ej: 192.168.1.1" },
    { name: "vlan",       label: "VLAN",        type: "number",  required: false, placeholder: "Ej: 10" },
    { name: "comentarios",label: "Comentarios", type: "textarea",required: false, placeholder: "Notas adicionales...", rows: 2, span: 2 },
  ];

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      const payload = {
        ...valores,
        vlan: valores.vlan ? parseInt(valores.vlan) : null,
      };
      if (form?.equipoRedId) {
        const res = await equipoRedApi.actualizar(form.equipoRedId, payload);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo actualizar.");
        setModal({ open: true, variant: "success", message: "Configuración actualizada correctamente." });
      } else {
        const res = await equipoRedApi.crear(payload);
        if (res?.exito === false) throw new Error(res.mensaje || "No se pudo crear.");
        setModal({ open: true, variant: "success", message: "Configuración creada correctamente." });
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
      const res = await equipoRedApi.eliminar(confirm.id);
      if (res?.exito === false) throw new Error(res.mensaje || "No se pudo eliminar.");
      setConfirm({ open: false, id: null, loading: false });
      setModal({ open: true, variant: "success", message: "Configuración eliminada correctamente." });
      cargar();
    } catch (e) {
      setConfirm(p => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const filtrados = items.filter(r =>
    [r.ipAddress, r.macAddress, r._equipoNombre].some(v =>
      (v ?? "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div style={{ width: "100%", maxWidth: 1200 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: "1.3rem", fontWeight: 800, color: "#232946" }}>
          🌐 Configuración de Red
        </h2>
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por IP, MAC o equipo..."
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
            fontSize: "0.93rem", minWidth: 250 }} />
        {crear && (
          <button onClick={() => setForm({})}
            style={{ padding: "9px 20px", borderRadius: 8, background: "#4c7318", color: "#fff",
              border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
            + Nueva configuración
          </button>
        )}
      </div>

      <DataTable
        columnas={columnas} datos={filtrados} loading={loading}
        keyField="equipoRedId" mensajeVacio="No hay configuraciones de red registradas."
        onEdit={modificar ? r => setForm({
          equipoRedId: r.equipoRedId,
          equipoId:    r.equipoId,
          ipAddress:   r.ipAddress   ?? "",
          macAddress:  r.macAddress  ?? "",
          gateway:     r.gateway     ?? "",
          vlan:        r.vlan        ?? "",
          comentarios: r.comentarios ?? "",
        }) : undefined}
        onDelete={eliminar ? r => setConfirm({ open: true, id: r.equipoRedId, loading: false }) : undefined}
      />

      {form !== null && (
        <FormModal
          title={form.equipoRedId ? "✏️ Editar configuración de red" : "🌐 Nueva configuración de red"}
          fields={FIELDS}
          initialData={form}
          cols={2}
          maxWidth={560}
          onSubmit={handleGuardar}
          loading={formLoading}
          onCancel={() => setForm(null)}
        />
      )}

      <ModalDialog open={modal.open} variant={modal.variant} message={modal.message}
        onClose={() => setModal({ open: false, variant: "error", message: "" })} />

      <ModalDialog
        open={confirm.open} variant="confirm" title="Eliminar configuración de red"
        message="¿Seguro que deseas eliminar esta configuración de red?"
        loading={confirm.loading} confirmText="Sí, eliminar" cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
      />
    </div>
  );
}
