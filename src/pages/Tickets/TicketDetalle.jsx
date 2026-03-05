// src/pages/Tickets/TicketDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi } from "../../api/tickets.api";
import TicketBadge from "./TicketBadge";
import { estadoBadge, prioridadBadge } from "./ticketBadges";

function Campo({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <div style={{ fontSize: "0.97rem", color: "#232946" }}>
        {children}
      </div>
    </div>
  );
}

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketsApi.obtener(id);
        if (!cancelled) setTicket(data?.datos ?? data);
      } catch (e) {
        if (!cancelled) setError(e.message || "No se pudo cargar el ticket.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTicket();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div style={{ width: "100%", maxWidth: 980 }}>

      {/* Botón Volver */}
      <button
        onClick={() => navigate("/tickets")}
        style={{
          marginBottom: 20,
          padding: "8px 18px",
          borderRadius: 8,
          border: "1.5px solid #d1d5db",
          background: "#fff",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: "pointer",
          color: "#374151",
        }}
      >
        ← Volver
      </button>

      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "32px 36px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid #e5e7eb",
      }}>

        {loading && (
          <div style={{ padding: 16, color: "#888" }}>Cargando...</div>
        )}

        {error && !loading && (
          <div style={{ padding: 16, color: "#dc2626" }}>{error}</div>
        )}

        {ticket && !loading && (
          <>
            <h2 style={{ margin: "0 0 28px", fontSize: "1.4rem", fontWeight: 800, color: "#232946" }}>
              🎫 {ticket.titulo ?? "Ticket sin título"}
            </h2>

            {/* Grid de 2 columnas para los campos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px 32px",
              marginBottom: 24,
            }}>
              <Campo label="Estado">
                <TicketBadge value={ticket.estado} map={estadoBadge} fontSize="0.85rem" padding="4px 12px" />
              </Campo>

              <Campo label="Prioridad">
                <TicketBadge value={ticket.prioridad} map={prioridadBadge} fontSize="0.85rem" padding="4px 12px" />
              </Campo>

              <Campo label="ID">
                <span style={{ color: "#9ca3af" }}>#{ticket.ticketId ?? ticket.id}</span>
              </Campo>

              <Campo label="Creado el">
                {ticket.creadoEl
                  ? new Date(ticket.creadoEl).toLocaleDateString("es-ES")
                  : "—"}
              </Campo>
            </div>

            {/* Descripción — ocupa todo el ancho */}
            <Campo label="Descripción">
              <p style={{ margin: "8px 0 0", lineHeight: 1.6, color: "#374151" }}>
                {ticket.descripcion ?? "—"}
              </p>
            </Campo>
          </>
        )}
      </div>
    </div>
  );
}
