// src/components/layout/Menu.jsx
// Sin menu.css — todos los estilos son inline
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutLocal } from "../../stores/authSlice";
import { clearMenu, selectMenus, selectMenuCargado } from "../../stores/menuSlice";
import { authApi } from "../../api/auth.api";
import { menuItems as menuFallback } from "../../app/menuItems";
import goreaLogo from "../../assets/Imagenes/gorea_logo.png";

// ─── Colores ──────────────────────────────────────────────────────────────────
const LIMA = {
  400: "#a0d744",
  600: "#649719",
  800: "#3e5b19",
};

// ─── Iconos por módulo ────────────────────────────────────────────────────────
const ICONOS = {
  "dashboard":      "🏠",
  "inventario":     "📦",
  "equipos":        "💻",
  "marcas":         "🏷️",
  "tickets":        "🎫",
  "usuarios":       "👥",
  "reportes":       "📊",
  "configuracion":  "⚙️",
  "mantenimiento":  "🔧",
  "mantenimientos": "🔧",
  "proveedores":    "🏭",
  "software":       "💿",
  "componentes":    "🔩",
  "dependencias":   "🏢",
  "seguridad":      "🔒",
  "administración": "⚙️",
  "soporte":        "🛠️",
  "equipos red":    "🌐",
  "tipos de activo":"📋",
  "roles":          "🎭",
};
const getIcono = (nombre) => ICONOS[nombre?.toLowerCase()] ?? "📄";

function filtrarMenu(items) {
  return items.map(item => ({ ...item, subMenus: item.subMenus?.length ? filtrarMenu(item.subMenus) : [] }));
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const sidebarBase = {
  width: 220,
  background: `linear-gradient(to bottom, ${LIMA[400]} 0%, ${LIMA[600]} 45%, ${LIMA[800]} 100%)`,
  height: "100vh",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  boxShadow: "2px 0 14px rgba(26,43,8,0.30)",
  zIndex: 1200,
  overflow: "hidden",
  flexShrink: 0,
  transition: "width 0.2s ease",
};

const itemBase = {
  background: "none",
  border: "none",
  borderLeft: "3px solid transparent",
  color: "#fff",
  textAlign: "left",
  padding: "0.7rem 1rem",
  fontSize: "0.95rem",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "0.8rem",
  borderRadius: 8,
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textShadow: "0 1px 3px rgba(0,0,0,0.20)",
  width: "100%",
};

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const menusRedux  = useSelector(selectMenus);
  const menuCargado = useSelector(selectMenuCargado);

  const items = filtrarMenu(
    menuCargado && menusRedux.length > 0
      ? [...menusRedux].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
      : menuFallback.map(m => ({ nombre: m.name, url: m.path, orden: 99, subMenus: [], _icon: m.icon }))
  );

  const [collapsed, setCollapsed] = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [abiertos,  setAbiertos]  = useState({});
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (!document.getElementById("app-sidebar")?.contains(e.target)) {
        setCollapsed(true);
        setHovered(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const expanded = !collapsed || hovered;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logoutLocal());
    dispatch(clearMenu());
    navigate("/login");
  };

  const toggle = (id) => setAbiertos(p => ({ ...p, [id]: !p[id] }));
  const isActive     = (url) => url && location.pathname === url;
  const isParentActive = (item) => item.subMenus?.some(s => isActive(s.url));

  const renderItem = (item, nivel = 0) => {
    const tieneHijos = item.subMenus?.length > 0;
    const key        = item.menuId ?? item.url ?? item.nombre;
    const abierto    = abiertos[key];
    const activo     = isActive(item.url) || isParentActive(item);
    const itemIcono  = item._icon ?? getIcono(item.nombre);
    const isHov      = hoveredId === key;

    const estilo = {
      ...itemBase,
      paddingLeft: nivel > 0 ? 36 : 14,
      fontSize: nivel > 0 ? "0.88rem" : "0.95rem",
      borderLeft: activo ? "3px solid rgba(255,255,255,0.85)" : "3px solid transparent",
      background: activo
        ? "rgba(255,255,255,0.20)"
        : isHov
          ? "rgba(255,255,255,0.13)"
          : "none",
      fontWeight: activo ? 700 : 500,
    };

    return (
      <React.Fragment key={key}>
        <button
          style={estilo}
          onMouseEnter={() => setHoveredId(key)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => {
            if (tieneHijos) toggle(key);
            else if (item.url) navigate(item.url);
          }}
        >
          <span style={{ fontSize: "1.15rem", flexShrink: 0 }}>{itemIcono}</span>
          {expanded && (
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.nombre ?? item.name}
            </span>
          )}
          {tieneHijos && expanded && (
            <span style={{ fontSize: "0.65rem", opacity: 0.6, marginLeft: "auto" }}>
              {abierto ? "▲" : "▼"}
            </span>
          )}
        </button>

        {tieneHijos && abierto && expanded && (
          <div>
            {[...item.subMenus]
              .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
              .map(sub => renderItem(sub, nivel + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside
      id="app-sidebar"
      style={{ ...sidebarBase, width: expanded ? 220 : 64 }}
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header / logo */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "1.1rem 1rem", minHeight: 60,
          borderBottom: "1px solid rgba(255,255,255,0.20)",
          cursor: "pointer", userSelect: "none", overflow: "hidden",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <img src={goreaLogo} alt="Logo"
          style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }} />
        {expanded && (
          <span style={{
            fontWeight: 700, fontSize: "1.02rem",
            whiteSpace: "nowrap", overflow: "hidden",
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}>
            Parque Informático
          </span>
        )}
      </div>

      {/* Nav scrolleable */}
      <nav style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "0.5rem 0.5rem",
        // Scrollbar delgada
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.25) transparent",
      }}>
        {items.map(item => renderItem(item))}
      </nav>

      {/* Cerrar sesión — siempre visible */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(255,255,255,0.15)",
        padding: "0.5rem",
      }}>
        <button
          style={{
            ...itemBase,
            borderLeft: "3px solid transparent",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(220,50,50,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
          onClick={handleLogout}
        >
          <span style={{ fontSize: "1.15rem", flexShrink: 0 }}>🚪</span>
          {expanded && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}