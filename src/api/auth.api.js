// src/api/auth.api.js
// Igual que marcas.api.js pero para los endpoints de autenticación

const API_BASE_URI = import.meta.env.VITE_API_BASE_URI;

// Las llamadas de auth NO usan el http.js normal porque:
// - login y refresh no necesitan el token en el header
// - refresh no debe disparar otro refresh si falla (loop infinito)
// Por eso usamos fetch directo aquí.

export const authApi = {

  // Llama a POST /auth/login
  // Manda usuario y contraseña, recibe accessToken + cookie
  login: async (userName, password) => {
    const res = await fetch(`${API_BASE_URI}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",   // necesario para que el navegador guarde la cookie
      body: JSON.stringify({ userName, password }),
    });
    return res.json();
  },

  // Llama a POST /auth/refresh
  // La cookie viaja automáticamente (el navegador la adjunta solo)
  // Si funciona devuelve nuevo accessToken, si no devuelve error
  refresh: async () => {
    const res = await fetch(`${API_BASE_URI}/auth/refresh`, {
      method: "POST",
      credentials: "include",   // cookie viaja sola aquí
    });
    return res.json();
  },

  // Llama a POST /auth/logout
  // El backend revoca la cookie y la borra
  logout: async () => {
    const res = await fetch(`${API_BASE_URI}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },
};