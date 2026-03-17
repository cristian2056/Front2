// src/api/roles.api.js
// Fuente única de verdad para todas las APIs del módulo de Roles/Seguridad
import { http } from "../services/http";

export const rolesApi = {
  listar:    ()          => http("/api/Roles"),
  crear:     (body)      => http("/api/Roles",       { method: "POST",   body }),
  actualizar:(id, body)  => http(`/api/Roles/${id}`, { method: "PUT",    body }),
  eliminar:  (id)        => http(`/api/Roles/${id}`, { method: "DELETE"       }),
};

export const objetosApi = {
  listar: () => http("/api/Objetos"),
};

export const rolObjetosApi = {
  listarPorRol: (rolId)    => http(`/api/RolObjetos/rol/${rolId}`),
  asignar:      (body)     => http("/api/RolObjetos",       { method: "POST",   body }),
  actualizar:   (id, body) => http(`/api/RolObjetos/${id}`, { method: "PUT",    body }),
  quitar:       (id)       => http(`/api/RolObjetos/${id}`, { method: "DELETE"       }),
};

export const menuApi = {
  listar: () => http("/api/Menu"),
};

export const rolMenuApi = {
  listarPorRol: (rolId) => http(`/api/RolMenu/rol/${rolId}`),
  asignar:      (body)  => http("/api/RolMenu",       { method: "POST",   body }),
  quitar:       (id)    => http(`/api/RolMenu/${id}`, { method: "DELETE"       }),
};

// Un usuario tiene UN solo rol (FK directo en tabla Usuarios)
export const rolUsuariosApi = {
  listarTodos:  ()                  => http("/api/Usuarios"),
  cambiarRol:   (usuarioId, body)   => http(`/api/Usuarios/${usuarioId}`, { method: "PUT", body }),
};
