import { http } from "../services/http";

export const equiposApi = {
  listar:     ()         => http("/api/Equipos"),
  obtener:    (id)       => http(`/api/Equipos/${id}`),
  crear:      (body)     => http("/api/Equipos", { method: "POST", body }),
  actualizar: (id, body) => http(`/api/Equipos/${id}`, { method: "PUT", body }),
  eliminar:   (id)       => http(`/api/Equipos/${id}`, { method: "DELETE" }),
};
