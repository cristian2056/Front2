// src/components/layout/Menu.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutLocal } from "../../stores/authSlice";
import { authApi } from "../../api/auth.api";
import "./menu.css";
import goreaLogo from "../../assets/Imagenes/gorea_logo.png";

const menuItems = [
  { path: "/",        name: "Dashboard", icon: "🏠" },
  { path: "/marcas",  name: "Marcas",    icon: "🏷️" },
  { path: "/tickets", name: "Tickets",   icon: "🎫" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);

  // Cerrar sidebar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar && !sidebar.contains(event.target)) {
        setIsCollapsed(true);
        setIsHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const expanded = !isCollapsed || isHovered;
  const sidebarClass = `sidebar${isCollapsed ? " collapsed" : ""}${isHovered ? " hovered" : ""}`;

  // Logout: borra cookie en backend y limpia Redux
  const handleLogout = async () => {
    try {
      await authApi.logout();    // revoca la cookie en el backend
    } catch {
      // si falla igual limpiamos local
    }
    dispatch(logoutLocal());     // limpia el token de Redux
    navigate("/login");          // manda al login
  };

 return (
  <aside
    className={sidebarClass}
    onMouseEnter={() => isCollapsed && setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
    {/* Header */}
    <div className="sidebar-header" onClick={() => setIsCollapsed((v) => !v)}>
      <img src={goreaLogo} alt="Logo" className="logo-img" />
      {expanded && <span className="logo-text">Parque Informático</span>}
    </div>

    {/* Navegación */}
    <nav className="sidebar-nav">
      {menuItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`sidebar-item${active ? " active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.name}</span>
          </button>
        );
      })}
    </nav>

    {/* Cerrar sesión — FUERA del nav, directo en el aside */}
    <div className="sidebar-bottom">
      <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
        <span className="sidebar-icon">🚪</span>
        <span className="sidebar-label">Cerrar sesión</span>
      </button>
    </div>

  </aside>
);
}