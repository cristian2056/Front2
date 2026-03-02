// src/components/layout/Header.jsx
import React from "react";
import "./header.css";

export default function Header({ title, nombreUsuario, tipoUsuario }) {
  return (
    <header className="header">
      <div className="header-titulo" style={{ paddingLeft: "2rem" }}>
        {title}
      </div>

      <div className="header-usuario">
        <div>
          <div className="usuario-nombre">{nombreUsuario}</div>
          <div className="usuario-tipo">{tipoUsuario}</div>
        </div>
        <div className="usuario-avatar" />
      </div>
    </header>
  );
}
