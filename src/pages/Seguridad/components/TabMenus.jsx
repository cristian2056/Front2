// src/pages/Seguridad/components/TabMenus.jsx
import React from "react";
import { C } from "../constants";
import CheckboxUI from "../../../components/ui/CheckboxUI";

export default function TabMenus({ menus, menuAcceso, onToggle }) {
  const lista  = Array.isArray(menus) ? menus : [];
  console.log("[TabMenus] lista recibida:", lista.length, lista);
  const padres = lista.filter(m => !m.menuPadreId);
  const hijos  = (padreId) => lista.filter(m => m.menuPadreId === padreId);

  if (lista.length === 0) return (
    <div style={{ padding: "48px 24px", textAlign: "center", color: C.gray400, fontSize: "0.88rem" }}>
      📋 No hay menús disponibles o el endpoint no está configurado.
    </div>
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      <p style={{ margin: "0 0 14px", fontSize: "0.85rem", color: C.gray600 }}>
        Marcá los menús y páginas a los que puede acceder este rol.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {padres.map(padre => (
          <div key={padre.menuId} style={{ border: `1.5px solid ${C.gray200}`, borderRadius: 10, overflow: "hidden" }}>

            {/* Menú padre */}
            <div
              onClick={() => onToggle(padre.menuId)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                cursor: "pointer", transition: "background 0.1s",
                background: menuAcceso(padre.menuId) ? C.primaryLight : C.white,
              }}
              onMouseEnter={e => { if (!menuAcceso(padre.menuId)) e.currentTarget.style.background = C.gray50; }}
              onMouseLeave={e => { if (!menuAcceso(padre.menuId)) e.currentTarget.style.background = C.white; }}
            >
              <CheckboxUI checked={menuAcceso(padre.menuId)} />
              <span style={{ fontWeight: 700, fontSize: "0.93rem", color: C.gray900 }}>{padre.nombre}</span>
              {padre.url && (
                <span style={{ fontSize: "0.78rem", color: C.gray400, marginLeft: "auto" }}>{padre.url}</span>
              )}
            </div>

            {/* Submenús hijos */}
            {hijos(padre.menuId).map(sub => (
              <div
                key={sub.menuId}
                onClick={() => onToggle(sub.menuId)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 16px 9px 44px", cursor: "pointer",
                  borderTop: `1px solid ${C.gray100}`, transition: "background 0.1s",
                  background: menuAcceso(sub.menuId) ? C.primaryLight : C.gray50,
                }}
                onMouseEnter={e => { if (!menuAcceso(sub.menuId)) e.currentTarget.style.background = C.gray100; }}
                onMouseLeave={e => { if (!menuAcceso(sub.menuId)) e.currentTarget.style.background = C.gray50; }}
              >
                <CheckboxUI checked={menuAcceso(sub.menuId)} />
                <span style={{ fontSize: "0.88rem", color: C.gray700 }}>↳ {sub.nombre}</span>
                {sub.url && (
                  <span style={{ fontSize: "0.75rem", color: C.gray400, marginLeft: "auto" }}>{sub.url}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
