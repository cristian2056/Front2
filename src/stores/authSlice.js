// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// ¿Qué es un slice?
// Es como una "sección" del estado global de la app.
// Este slice maneja todo lo relacionado a la sesión del usuario.

// Estado inicial: sin sesión
const initialState = {
  usuario: null,        // datos del usuario (nombre, tipo, roles, etc.)
  accessToken: null,    // el JWT que se manda en cada request
  isAuthenticated: false, // true si hay sesión activa
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // setCredentials: se llama después del login o refresh exitoso
    // Guarda el token y los datos del usuario en memoria (Redux)
    // IMPORTANTE: no usamos localStorage por seguridad (XSS)
    setCredentials: (state, action) => {
      const { accessToken, usuario } = action.payload;
      state.accessToken     = accessToken;
      state.usuario         = usuario;
      state.isAuthenticated = true;
    },

    // logoutLocal: limpia el estado cuando el usuario cierra sesión
    // La cookie la borra el backend, esto solo limpia la memoria
    logoutLocal: (state) => {
      state.accessToken     = null;
      state.usuario         = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logoutLocal } = authSlice.actions;

// Selectores: forma cómoda de leer el estado desde cualquier componente
// Uso: const usuario = useSelector(selectUsuario)
export const selectUsuario         = (state) => state.auth.usuario;
export const selectAccessToken     = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;