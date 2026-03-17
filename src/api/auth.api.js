// src/api/auth.api.js
const API_BASE_URI = import.meta.env.VITE_API_BASE_URI;

export const authApi = {

  login: async (userName, password) => {
    const res = await fetch(`${API_BASE_URI}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userName, password }),
    });
    return res.json();
  },

  refresh: async () => {
    const res = await fetch(`${API_BASE_URI}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URI}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  // Carga menús y permisos del usuario → GET /api/Menu/usuario/{usuarioId}
  // Respuesta: { exito, datos: { menus: MenuItemDto[], permisos: { Modulo: {leer,crear,modificar,eliminar} } } }
  obtenerMenu: async (usuarioId, accessToken) => {
    const res = await fetch(`${API_BASE_URI}/api/Menu/usuario/${usuarioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
    return res.json();
  },
};