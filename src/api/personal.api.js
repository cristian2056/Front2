// src/api/personal.api.js
import { http } from "../services/http";

export const personalApi = {
  // ── Personas ──────────────────────────────────────────────
  listarPersonas:    ()              => http("/api/Personas"),
  crearPersona:      (body)          => http("/api/Personas",             { method: "POST",   body }),
  actualizarPersona: (id, body)      => http(`/api/Personas/${id}`,       { method: "PUT",    body }),
  eliminarPersona:   (id)            => http(`/api/Personas/${id}`,       { method: "DELETE"       }),

  // ── Usuarios ──────────────────────────────────────────────
  crearUsuario:      (body)          => http("/api/Personas/usuarios",       { method: "POST", body }),
  actualizarUsuario: (id, body)      => http(`/api/Personas/usuarios/${id}`, { method: "PUT",  body }),

  // ── Roles ─────────────────────────────────────────────────
  listarRoles: () => http("/api/Roles"),

  obtenerPersona: (id) => http(`/api/Personas/${id}`),
};