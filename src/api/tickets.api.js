// src/api/tickets.api.js
import { http } from "../services/http";

export const ticketsApi = {
  // ── Usuario ──────────────────────────────────────────────────────────────
  misEquipos:   ()         => http("/api/Ticket/mis-equipos"),
  misTickets:   ()         => http("/api/Ticket/mis-tickets"),
  detalle:      (id)       => http(`/api/Ticket/${id}/detalle`),
  crear:        (body)     => http("/api/Ticket/crear", { method: "POST", body }),

  // ── Técnico ──────────────────────────────────────────────────────────────
  pendientes:   ()         => http("/api/Ticket/pendientes"),
  misAsignados: ()         => http("/api/Ticket/mis-asignados"),
  tomar:        (id)       => http(`/api/Ticket/${id}/tomar`,  { method: "POST" }),
  cerrar:       (id, body) => http(`/api/Ticket/${id}/cerrar`, { method: "POST", body }),

  // ── Admin CRUD ────────────────────────────────────────────────────────────
  listar:     ()         => http("/api/Ticket"),
  obtener:    (id)       => http(`/api/Ticket/${id}`),
  actualizar: (id, body) => http(`/api/Ticket/${id}`, { method: "PUT", body }),
  eliminar:   (id)       => http(`/api/Ticket/${id}`, { method: "DELETE" }),
};

export const ticketArchivosApi = {
  listarPorTicket: (ticketId) => http(`/api/TicketArchivos/ticket/${ticketId}`),
  subir:           (body)     => http("/api/TicketArchivos", { method: "POST", body }),
  eliminar:        (id)       => http(`/api/TicketArchivos/${id}`, { method: "DELETE" }),
};
