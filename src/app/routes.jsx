// src/app/routes.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RequireAuth, PublicRoute } from "../components/auth/AuthGuards";

import AppLayout from "../components/layout/AppLayout.jsx";
import Dashboard  from "../pages/Dashboard";
import MarcasPage from "../pages/Marcas/MarcasPage";
import LoginPage  from "../pages/Login/LoginPage";


export const router = createBrowserRouter([

  // ── Rutas públicas (sin sesión) ──────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },

  // ── Rutas protegidas (requieren sesión) ───────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true,    element: <Dashboard /> },
          { path: "marcas", element: <MarcasPage /> },
        ],
      },
    ],
  },

]);