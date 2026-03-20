// src/api/administracion.api.js
import { http } from "../services/http";

export const tiposActivosApi = {
  listar:     ()         => http("/api/TiposActivos"),
  obtener:    (id)       => http(`/api/TiposActivos/${id}`),
  crear:      (body)     => http("/api/TiposActivos",       { method: "POST",   body }),
  actualizar: (id, body) => http(`/api/TiposActivos/${id}`, { method: "PUT",    body }),
  eliminar:   (id)       => http(`/api/TiposActivos/${id}`, { method: "DELETE"       }),
};

export const proveedoresApi = {
  listar:     ()         => http("/api/Proveedores"),
  obtener:    (id)       => http(`/api/Proveedores/${id}`),
  crear:      (body)     => http("/api/Proveedores",        { method: "POST",   body }),
  actualizar: (id, body) => http(`/api/Proveedores/${id}`,  { method: "PUT",    body }),
  eliminar:   (id)       => http(`/api/Proveedores/${id}`,  { method: "DELETE"       }),
};

export const dependenciasApi = {
  listar:     ()         => http("/api/Dependencias"),
  obtener:    (id)       => http(`/api/Dependencias/${id}`),
  crear:      (body)     => http("/api/Dependencias",       { method: "POST",   body }),
  actualizar: (id, body) => http(`/api/Dependencias/${id}`, { method: "PUT",    body }),
  eliminar:   (id)       => http(`/api/Dependencias/${id}`, { method: "DELETE"       }),
};

export const softwaresApi = {
  listar:     ()         => http("/api/Softwares"),
  obtener:    (id)       => http(`/api/Softwares/${id}`),
  crear:      (body)     => http("/api/Softwares",          { method: "POST",   body }),
  actualizar: (id, body) => http(`/api/Softwares/${id}`,    { method: "PUT",    body }),
  eliminar:   (id)       => http(`/api/Softwares/${id}`,    { method: "DELETE"       }),
};

export const categoriasTicketApi = {
  listar:     ()         => http("/api/CategoriasTicket"),
  obtener:    (id)       => http(`/api/CategoriasTicket/${id}`),
  crear:      (body)     => http("/api/CategoriasTicket",       { method: "POST",   body }),
  actualizar: (id, body) => http(`/api/CategoriasTicket/${id}`, { method: "PUT",    body }),
  eliminar:   (id)       => http(`/api/CategoriasTicket/${id}`, { method: "DELETE"       }),
};
