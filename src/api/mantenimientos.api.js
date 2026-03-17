import { http } from "../services/http";

export const mantenimientosApi = {
  listar:     ()         => http("/api/Mantenimientos"),
  obtener:    (id)       => http(`/api/Mantenimientos/${id}`),
  crear:      (body)     => http("/api/Mantenimientos", { method: "POST", body }),
  actualizar: (id, body) => http(`/api/Mantenimientos/${id}`, { method: "PUT", body }),
  eliminar:   (id)       => http(`/api/Mantenimientos/${id}`, { method: "DELETE" }),
};
