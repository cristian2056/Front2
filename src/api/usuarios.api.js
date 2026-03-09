// src/api/usuarios.api.js
import { http } from "../services/http";

export const usuariosApi = {
  listar:   ()         => http("/api/Usuarios"),
  obtener:  (id)       => http(`/api/Usuarios/${id}`),
  crear:    (body)     => http("/api/Usuarios", { method: "POST", body }),
  editar:   (id, body) => http(`/api/Usuarios/${id}`, { method: "PUT", body }),
  eliminar: (id)       => http(`/api/Usuarios/${id}`, { method: "DELETE" }),
};

export const rolesApi = {
  listar:   ()         => http("/api/Roles"),
  obtener:  (id)       => http(`/api/Roles/${id}`),
  crear:    (body)     => http("/api/Roles", { method: "POST", body }),
  editar:   (id, body) => http(`/api/Roles/${id}`, { method: "PUT", body }),
  eliminar: (id)       => http(`/api/Roles/${id}`, { method: "DELETE" }),
};

export const usuarioRolApi = {
  porUsuario: (usuarioId) => http(`/api/UsuarioRol/usuario/${usuarioId}`),
  asignar:    (body)      => http("/api/UsuarioRol", { method: "POST", body }),
  quitar:     (body)      => http("/api/UsuarioRol", { method: "DELETE", body }),
};

export const personasApi = {
  listar: () => http("/api/Personas"),
};