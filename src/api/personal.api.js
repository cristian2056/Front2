// src/api/personal.api.js
import { http } from "../services/http";

export const personalApi = {
  // ── Personas ──────────────────────────────────────────────
  listarPersonas:    ()         => http("/api/Personas"),
  obtenerPersona:    (id)       => http(`/api/Personas/${id}`),
  crearPersona:      (body)     => http("/api/Personas",       { method: "POST",   body }),
  actualizarPersona: (id, body) => http(`/api/Personas/${id}`, { method: "PUT",    body }),
  eliminarPersona:   (id)       => http(`/api/Personas/${id}`, { method: "DELETE"       }),

  // ── Usuarios (cuenta de acceso asociada a persona) ────────
  // Según las rutas del backend: /api/Usuarios
  crearUsuario:      (body)     => http("/api/Usuarios",       { method: "POST",   body }),
  actualizarUsuario: (id, body) => http(`/api/Usuarios/${id}`, { method: "PUT",    body }),
};
