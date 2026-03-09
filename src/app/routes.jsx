// src/app/routes.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RequireAuth, PublicRoute } from "../components/auth/AuthGuards";

import AppLayout      from "../components/layout/AppLayout.jsx";
import LoginPage      from "../pages/Login/LoginPage";
import Dashboard      from "../pages/Dashboard";
import MarcasPage        from "../pages/Marcas/MarcasPage";
import TiposActivosPage  from "../pages/TiposActivos/TiposActivosPage";
import ProveedoresPage   from "../pages/Proveedores/ProveedoresPage";
import DependenciasPage  from "../pages/Dependencias/DependenciasPage";
import EquiposPage    from "../pages/Equipo/EquiposPage";
import EquipoDetalle  from "../pages/Equipo/EquipoDetalle";
import PersonalPage   from "../pages/Personal/PersonalPage";
import PersonaDetalle from "../pages/Personal/PersonaDetalle";
import Proximamente   from "../pages/Proximamente";
import UsuariosPage   from "../pages/Seguridad/UsuariosPage";
import RolesPage      from "../pages/Seguridad/RolesPage";

// Rutas con placeholder "Próximamente"
const prox = <Proximamente />;

export const router = createBrowserRouter([

  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },

  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true,              element: <Dashboard /> },

          // ── Inventario ────────────────────────────────
          { path: "equipos",          element: <EquiposPage /> },
          { path: "equipos/:id",      element: <EquipoDetalle /> },
          { path: "componentes",      element: prox },
          { path: "software",         element: prox },
          { path: "equipos-red",      element: prox },

          // ── Administración ────────────────────────────
          { path: "marcas",           element: <MarcasPage /> },
          { path: "tipos-activos",    element: <TiposActivosPage /> },
          { path: "proveedores",      element: <ProveedoresPage /> },
          { path: "dependencias",     element: <DependenciasPage /> },

          // ── Soporte ───────────────────────────────────
          { path: "tickets",          element: prox },
          { path: "mantenimientos",   element: prox },

          // ── Seguridad ─────────────────────────────────
          { path: "usuarios", element: <UsuariosPage /> },
          { path: "roles",            element:<RolesPage />},

          // ── Personal (existente) ──────────────────────
          { path: "personal",         element: <PersonalPage /> },
          { path: "personal/:id",     element: <PersonaDetalle /> },
        ],
      },
    ],
  },

]);