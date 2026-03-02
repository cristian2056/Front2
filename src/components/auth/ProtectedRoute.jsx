// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../stores/authSlice";

// ProtectedRoute envuelve las rutas que requieren sesión.
// Si el usuario NO está autenticado → lo manda al login.
// Si SÍ está autenticado → muestra la página normalmente.

// Uso en routes.jsx:
// <Route element={<ProtectedRoute />}>
//   <Route path="/" element={<AppLayout />} ... />
// </Route>

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    // replace evita que el usuario pueda volver atrás al login con el botón back
    return <Navigate to="/login" replace />;
  }

  return children;
}