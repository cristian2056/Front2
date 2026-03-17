import { http } from "../services/http";

export const equiposApi = {
  listar:     ()         => http("/api/Equipo"),
  obtener:    (id)       => http(`/api/Equipo/${id}`),
  crear:      (body)     => http("/api/Equipo", { method: "POST", body }),
  actualizar: (id, body) => http(`/api/Equipo/${id}`, { method: "PUT", body }),
  eliminar:   (id)       => http(`/api/Equipo/${id}`, { method: "DELETE" }),
};