// src/pages/Tickets/TicketsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsApi } from "../../api/tickets.api";
import ModalDialog from "../../components/ui/ModalDialog";
import TicketForm from "./TicketForm";
import TicketTable from "./TicketTable";

export default function TicketsPage() {
  const navigate = useNavigate();

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [busqueda,    setBusqueda]    = useState("");

  const [modal,       setModal]       = useState({ open: false, variant: "error", message: "" });
  const [form,        setForm]        = useState(null); // null=cerrado | {}=nuevo
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.listar();
      setItems(Array.isArray(data.datos) ? data.datos : []);
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "Error al listar tickets." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGuardar = async (valores) => {
    setFormLoading(true);
    try {
      await ticketsApi.crear(valores);
      setModal({ open: true, variant: "success", message: "Ticket creado correctamente." });
      setForm(null);
      load();
    } catch (e) {
      setModal({ open: true, variant: "error", message: e.message || "No se pudo guardar." });
    } finally {
      setFormLoading(false);
    }
  };

  const itemsFiltrados = items.filter((t) =>
    (t.titulo ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (t.estado ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ width: "100%", maxWidth: 980 }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Tickets</h2>
        <input
          type="text"
          placeholder="🔍 Buscar por título o estado..."
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
          + Nuevo ticket
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, minHeight: 80 }}>
        {loading ? (
          <div style={{ padding: 16, color: "#888" }}>Cargando...</div>
        ) : itemsFiltrados.length === 0 ? (
          <div style={{ padding: 16, color: "#9ca3af", textAlign: "center" }}>
            {busqueda ? "No se encontraron resultados." : "No hay tickets registrados."}
          </div>
        ) : (
          <TicketTable
            items={itemsFiltrados}
            onVer={(t) => navigate(`/tickets/${t.ticketId ?? t.id}`)}
          />
        )}
      </div>

      {/* Modal formulario */}
      {form !== null && (
        <TicketForm
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

    </div>
  );
}
