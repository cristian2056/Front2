// src/components/layout/App.jsx (AppLayout)
import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUsuario } from "../../stores/authSlice";
import Sidebar from "./Menu";
import Header  from "./Header";
import "./appLayout.css";

const routeTitles = {
  "/":        "Dashboard",
  "/marcas":  "Marcas",
  "/tickets": "Tickets",
};

export default function AppLayout() {
  const location = useLocation();
  const usuario  = useSelector(selectUsuario); // ← usuario real desde Redux

  const title = useMemo(() => {
    return routeTitles[location.pathname] || "Parque Informático";
  }, [location.pathname]);

  // Ahora usamos los datos reales del usuario logueado
  const nombreUsuario = usuario?.nombreCompleto ?? "Usuario";
  const tipoUsuario   = usuario?.tipoUsuario    ?? "";

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Header
          title={title}
          nombreUsuario={nombreUsuario}
          tipoUsuario={tipoUsuario}
        />
        <div className="zona-trabajo">
          <Outlet />
        </div>
      </div>
    </div>
  );
}