// src/api/marcas.api.js
import { http } from "../services/http";

export const marcasApi = {
  listar:     ()             => http("/api/Marcas"),
  obtener:    (id)           => http(`/api/Marcas/${id}`),
  crear:      (body)         => http("/api/Marcas",            { method: "POST",   body }),
  actualizar: (marcaId, body)=> http(`/api/Marcas/${marcaId}`, { method: "PUT",    body }),
  eliminar:   (marcaId)      => http(`/api/Marcas/${marcaId}`, { method: "DELETE"       }),
};