import { http } from "../services/http";

export const ticketsApi = {
  listar:     ()         => http("/api/Tickets"),
  obtener:    (id)       => http(`/api/Tickets/${id}`),
  crear:      (body)     => http("/api/Tickets", { method: "POST", body }),
  actualizar: (id, body) => http(`/api/Tickets/${id}`, { method: "PUT", body }),
  eliminar:   (id)       => http(`/api/Tickets/${id}`, { method: "DELETE" }),
};
