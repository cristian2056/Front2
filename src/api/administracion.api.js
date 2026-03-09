// src/api/administracion.api.js
import { http } from "../services/http";

export const tiposActivosApi = {
  listar:    ()          => http("/api/TiposActivos"),
  crear:     (body)      => http("/api/TiposActivos",       { method: "POST",   body }),
  actualizar:(id, body)  => http(`/api/TiposActivos/${id}`, { method: "PUT",    body }),
  eliminar:  (id)        => http(`/api/TiposActivos/${id}`, { method: "DELETE"       }),
};

export const proveedoresApi = {
  listar:    ()          => http("/api/Proveedores"),
  crear:     (body)      => http("/api/Proveedores",        { method: "POST",   body }),
  actualizar:(id, body)  => http(`/api/Proveedores/${id}`,  { method: "PUT",    body }),
  eliminar:  (id)        => http(`/api/Proveedores/${id}`,  { method: "DELETE"       }),
};

export const dependenciasApi = {
  listar:    ()          => http("/api/Dependencias"),
  crear:     (body)      => http("/api/Dependencias",       { method: "POST",   body }),
  actualizar:(id, body)  => http(`/api/Dependencias/${id}`, { method: "PUT",    body }),
  eliminar:  (id)        => http(`/api/Dependencias/${id}`, { method: "DELETE"       }),
};
