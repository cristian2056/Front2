// src/pages/Marcas/MarcasPage.jsx
import React, { useEffect, useState } from "react";
import { marcasApi } from "../../api/marcas.api";
import ModalDialog from "../../components/ui/ModalDialog";
import MarcaForm from "./MarcaForm";
import MarcaTable from "./MarcaTable";

export default function MarcasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modal, setModal] = useState({ open: false, variant: "error", message: "" });
  const [confirm, setConfirm] = useState({ open: false, marcaId: null, loading: false });
  const [form, setForm] = useState(null); // null=cerrado | {}=nueva | {marcaId,...}=editar
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await marcasApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al listar marcas." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      if (form?.marcaId) {
        await marcasApi.actualizar(form.marcaId, valores);
        setModal({ open: true, variant: "success", message: "Marca actualizada correctamente." });
      } else {
        await marcasApi.crear(valores);
        setModal({ open: true, variant: "success", message: "Marca creada correctamente." });
      }
      setForm(null);
      load();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    setConfirm((p) => ({ ...p, loading: true }));
    try {
      await marcasApi.eliminar(confirm.marcaId);
      setConfirm({ open: false, marcaId: null, loading: false });
      setModal({ open: true, variant: "success", message: "Marca eliminada correctamente." });
      load();
    } catch (e) {
      setConfirm((p) => ({ ...p, loading: false }));
      setModal({ open: true, variant: "error", message: e.message || "No se pudo eliminar." });
    }
  };

  const itemsFiltrados = items.filter((m) =>
    (m.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.modelo ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%", maxWidth: 980 }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Marcas</h2>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: "0.95rem", minWidth: 240,
          }}
        />
        <button
          onClick={() => setForm({})}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: "#232946", color: "#fff",
            border: "none", fontWeight: 700,
            fontSize: "0.95rem", cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          + Nueva marca
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, minHeight: 80 }}>
        {loading ? (
          <div style={{ padding: 16, color: "#888" }}>Cargando...</div>
        ) : itemsFiltrados.length === 0 ? (
          <div style={{ padding: 16, color: "#9ca3af", textAlign: "center" }}>
            {busqueda ? "No se encontraron resultados." : "No hay marcas registradas."}
          </div>
        ) : (
          <MarcaTable
            items={itemsFiltrados}
            onEdit={(m) => setForm({ marcaId: m.marcaId ?? m.id, nombre: m.nombre, modelo: m.modelo })}
            onDelete={(id) => setConfirm({ open: true, marcaId: id, loading: false })}
          />
        )}
      </div>

      {/* Modal formulario */}
      {form !== null && (
        <MarcaForm
          initialData={form}
          onSubmit={handleGuardar}
          loading={formLoading}
          onCancel={() => setForm(null)}
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
        title="Eliminar marca"
        message="¿Seguro que deseas eliminar esta marca? Esta acción no se puede deshacer."
        loading={confirm.loading}
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm({ open: false, marcaId: null, loading: false })}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}