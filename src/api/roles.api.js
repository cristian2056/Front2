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

// Endpoints /api/UsuarioRoles (plural) — consistente con personal.api.js
export const rolUsuariosApi = {
  listarPorRol: (rolId)        => http(`/api/UsuarioRoles/rol/${rolId}`),
  asignar:      (body)         => http("/api/UsuarioRoles",                 { method: "POST",   body }),
  quitar:       (uId, rolId)   => http(`/api/UsuarioRoles/${uId}/${rolId}`, { method: "DELETE"       }),
  listarTodos:  ()             => http("/api/Usuarios"),
};
