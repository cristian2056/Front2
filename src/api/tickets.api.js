// src/api/tickets.api.js
import { http } from "../services/http";

export const ticketsApi = {
  listar:     ()               => http("/api/Tickets"),
  obtener:    (ticketId)       => http(`/api/Tickets/${ticketId}`),
  crear:      (body)           => http("/api/Tickets",              { method: "POST",   body }),
  actualizar: (ticketId, body) => http(`/api/Tickets/${ticketId}`,  { method: "PUT",    body }),
  eliminar:   (ticketId)       => http(`/api/Tickets/${ticketId}`,  { method: "DELETE"       }),
};
