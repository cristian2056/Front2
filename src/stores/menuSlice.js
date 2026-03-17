// src/stores/menuSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  menus:    [],   // [{ menuId, nombre, url, orden, subMenus[] }]
  permisos: {},   // { "Equipos": { leer, crear, modificar, eliminar } }
  cargado:  false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu: (state, action) => {
      state.menus    = action.payload.menus    ?? [];
      state.permisos = action.payload.permisos ?? {};
      state.cargado  = true;
    },
    clearMenu: (state) => {
      state.menus    = [];
      state.permisos = {};
      state.cargado  = false;
    },
  },
});

export const { setMenu, clearMenu } = menuSlice.actions;

// Selectores base
export const selectMenus        = (state) => state.menu.menus;
export const selectPermisos     = (state) => state.menu.permisos;
export const selectMenuCargado  = (state) => state.menu.cargado;

// Hook: usePermiso("Equipos") → { leer, crear, modificar, eliminar }
// Las claves en permisos son lowercase ("equipos"), se normaliza la entrada.
export function usePermiso(nombreModulo) {
  return useSelector((state) =>
    state.menu.permisos[nombreModulo.toLowerCase()] ?? {
      leer: false, crear: false, modificar: false, eliminar: false,
    }
  );
}

export default menuSlice.reducer;