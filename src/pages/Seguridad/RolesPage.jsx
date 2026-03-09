// src/pages/Seguridad/RolesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { C, ACCIONES, btnSt } from "./constants";
import { rolesApi, objetosApi, menuApi, rolObjetosApi, rolMenuApi, rolUsuariosApi } from "../../api/roles.api";

import Spinner              from "../../components/ui/Spinner";
import RolLista             from "./components/RolLista";
import TabObjetos           from "./components/TabObjetos";
import TabMenus             from "./components/TabMenus";
import TabUsuarios          from "./components/TabUsuarios";
import ModalRol             from "./components/ModalRol";
import ModalAgregarUsuario  from "./components/ModalAgregarUsuario";
import ModalDialog          from "../../components/ui/ModalDialog";

const TABS = [
  { key: "objetos",  label: "🔐 Permisos" },
  { key: "menus",    label: "📋 Menús"    },
  { key: "usuarios", label: "👥 Usuarios" },
];

export default function RolesPage() {
  const [roles,       setRoles]       = useState([]);
  const [objetos,     setObjetos]     = useState([]);
  const [menus,       setMenus]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const [rolId,       setRolId]       = useState(null);
  const [rolObjetos,  setRolObjetos]  = useState([]);
  const [rolMenus,    setRolMenus]    = useState([]);
  const [rolUsuarios, setRolUsuarios] = useState([]);
  const [loadingRol,  setLoadingRol]  = useState(false);

  const [tab,       setTab]       = useState("objetos");
  const [modalRol,  setModalRol]  = useState(null);   // null=cerrado | "nuevo" | {...rol}
  const [modalUsu,  setModalUsu]  = useState(false);
  const [confirmEl, setConfirmEl] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      rolesApi.listar(),
      objetosApi.listar(),
      menuApi.listar().catch(() => ({ datos: [] })),
    ]).then(([rR, rO, rM]) => {
      const toArr = (v) => Array.isArray(v) ? v : [];
      setRoles(toArr(rR.datos));
      setObjetos(toArr(rO.datos));
      setMenus(toArr(rM.datos));
    }).catch(e => setError(e.message || "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  // ── Carga datos del rol seleccionado ──────────────────────────────────────
  const cargarRol = useCallback(async (id) => {
    setLoadingRol(true);
    try {
      const [rObj, rUsu] = await Promise.all([
        rolObjetosApi.listarPorRol(id),
        rolUsuariosApi.listarPorRol(id).catch(() => ({ datos: [] })),
      ]);
      setRolObjetos(rObj.datos  ?? []);
      setRolUsuarios(rUsu.datos ?? []);
      try {
        const rM = await rolMenuApi.listarPorRol(id);
        setRolMenus(rM.datos ?? []);
      } catch { setRolMenus([]); }
    } catch (e) {
      setError(e.message || "Error al cargar rol.");
    } finally {
      setLoadingRol(false);
    }
  }, []);

  const handleSelRol = (id) => {
    if (id === rolId) { setRolId(null); return; }
    setRolId(id);
    setTab("objetos");
    cargarRol(id);
  };

  const rolActivo = roles.find(r => r.rolId === rolId) ?? null;
  const getRO     = (objetoId) => rolObjetos.find(ro => ro.objetoId === objetoId) ?? null;

  // ── Handlers: permisos por objeto ─────────────────────────────────────────
  const handleTogglePerm = async (objetoId, accion) => {
    const ro = getRO(objetoId);
    try {
      if (!ro) {
        const body = { rolId, objetoId, leer: false, crear: false, modificar: false, eliminar: false, [accion]: true };
        const res  = await rolObjetosApi.asignar(body);
        setRolObjetos(prev => [...prev, res.datos ?? { ...body, rolObjetoId: Date.now() }]);
      } else {
        const nuevo        = !ro[accion];
        const body         = { ...ro, [accion]: nuevo };
        const todosEnFalse = ACCIONES.every(a => a.key === accion ? !nuevo : !ro[a.key]);
        if (todosEnFalse) {
          await rolObjetosApi.quitar(ro.rolObjetoId);
          setRolObjetos(prev => prev.filter(x => x.rolObjetoId !== ro.rolObjetoId));
        } else {
          await rolObjetosApi.actualizar(ro.rolObjetoId, body);
          setRolObjetos(prev => prev.map(x => x.rolObjetoId === ro.rolObjetoId ? { ...x, [accion]: nuevo } : x));
        }
      }
    } catch (e) { setError(e.message); }
  };

  const handleToggleFila = async (objetoId) => {
    const ro = getRO(objetoId);
    const todosOn = ro && ACCIONES.every(a => ro[a.key]);
    try {
      if (todosOn) {
        await rolObjetosApi.quitar(ro.rolObjetoId);
        setRolObjetos(prev => prev.filter(x => x.rolObjetoId !== ro.rolObjetoId));
      } else if (!ro) {
        const body = { rolId, objetoId, leer: true, crear: true, modificar: true, eliminar: true };
        const res  = await rolObjetosApi.asignar(body);
        setRolObjetos(prev => [...prev, res.datos ?? { ...body, rolObjetoId: Date.now() }]);
      } else {
        const body = { ...ro, leer: true, crear: true, modificar: true, eliminar: true };
        await rolObjetosApi.actualizar(ro.rolObjetoId, body);
        setRolObjetos(prev => prev.map(x => x.rolObjetoId === ro.rolObjetoId ? body : x));
      }
    } catch (e) { setError(e.message); }
  };

  // ── Handlers: menús ───────────────────────────────────────────────────────
  const menuAcceso       = (menuId) => rolMenus.some(rm => rm.menuId === menuId);
  const handleToggleMenu = async (menuId) => {
    const rm = rolMenus.find(x => x.menuId === menuId);
    try {
      if (rm) {
        await rolMenuApi.quitar(rm.rolMenuId);
        setRolMenus(prev => prev.filter(x => x.menuId !== menuId));
      } else {
        const body = { rolId, menuId, acceso: true };
        const res  = await rolMenuApi.asignar(body);
        setRolMenus(prev => [...prev, res.datos ?? { ...body, rolMenuId: Date.now() }]);
      }
    } catch (e) { setError(e.message); }
  };

  // ── Handlers: usuarios ────────────────────────────────────────────────────
  const handleQuitarUsuario = async (usuarioId) => {
    try {
      await rolUsuariosApi.quitar(usuarioId, rolId);
      setRolUsuarios(prev => prev.filter(u => u.usuarioId !== usuarioId));
    } catch (e) { setError(e.message); }
  };

  const handleAgregarUsuario = async (usuarioId) => {
    try {
      await rolUsuariosApi.asignar({ usuarioId, rolId });
      const r = await rolUsuariosApi.listarPorRol(rolId);
      setRolUsuarios(r.datos ?? []);
      setModalUsu(false);
    } catch (e) { setError(e.message); }
  };

  // ── Handlers: CRUD roles ──────────────────────────────────────────────────
  const handleGuardarRol = async (datos) => {
    setGuardando(true);
    try {
      if (datos.rolId) {
        await rolesApi.actualizar(datos.rolId, datos);
        setRoles(prev => prev.map(r => r.rolId === datos.rolId ? { ...r, ...datos } : r));
      } else {
        const res = await rolesApi.crear(datos);
        setRoles(prev => [...prev, res.datos]);
      }
      setModalRol(null);
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const handleEliminarRol = async () => {
    try {
      await rolesApi.eliminar(confirmEl);
      setRoles(prev => prev.filter(r => r.rolId !== confirmEl));
      if (rolId === confirmEl) setRolId(null);
      setConfirmEl(null);
    } catch (e) { setError(e.message); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <Spinner />;

  return (
    <div style={{ width: "100%", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {error && (
        <div style={{
          background: C.dangerLight, border: "1px solid #fecaca", borderRadius: 8,
          padding: "10px 16px", marginBottom: 16, color: C.danger, fontSize: "0.9rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>⚠️ {error}</span>
          <span onClick={() => setError("")} style={{ cursor: "pointer", fontWeight: 700, fontSize: "1.1rem" }}>×</span>
        </div>
      )}

      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: C.gray900 }}>🎭 Gestión de Roles</h2>
          <p style={{ margin: "4px 0 0", color: C.gray400, fontSize: "0.87rem" }}>
            Creá roles, asigná usuarios y configurá permisos por objeto y menú
          </p>
        </div>
        <button
          onClick={() => setModalRol("nuevo")}
          style={btnSt({ background: C.primary, color: C.white, padding: "10px 20px" })}
          onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = C.primary}
        >
          ＋ Nuevo rol
        </button>
      </div>

      {/* Layout principal */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <RolLista
          roles={roles} rolId={rolId}
          onSelect={handleSelRol}
          onEditar={rol => setModalRol(rol)}
          onEliminar={id => setConfirmEl(id)}
        />

        {/* Panel derecho */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!rolActivo ? (
            <div style={{
              background: C.white, borderRadius: 14, border: `2px dashed ${C.gray200}`,
              padding: "70px 40px", textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎭</div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: C.gray700, marginBottom: 6 }}>
                Seleccioná un rol
              </div>
              <div style={{ color: C.gray400, fontSize: "0.88rem" }}>
                Hacé clic en un rol para gestionar sus permisos y usuarios
              </div>
            </div>
          ) : (
            <div style={{
              background: C.white, borderRadius: 14,
              border: `1px solid ${C.gray200}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden",
            }}>
              {/* Header con tabs */}
              <div style={{
                padding: "16px 24px", borderBottom: `1px solid ${C.gray200}`,
                background: C.gray50, display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: C.gray900 }}>{rolActivo.nombre}</div>
                  <div style={{ fontSize: "0.82rem", color: C.gray400, marginTop: 2 }}>
                    {rolActivo.descripcion || "Sin descripción"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3, background: C.gray200, borderRadius: 9, padding: 3 }}>
                  {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      style={btnSt({
                        background: tab === t.key ? C.white : "transparent",
                        color: tab === t.key ? C.gray900 : C.gray600,
                        padding: "6px 14px", borderRadius: 7, fontSize: "0.82rem",
                        boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                      })}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              {loadingRol ? <Spinner /> : (
                <>
                  {tab === "objetos"  && <TabObjetos objetos={objetos} getRO={getRO} onTogglePerm={handleTogglePerm} onToggleFila={handleToggleFila} />}
                  {tab === "menus"    && <TabMenus menus={menus} menuAcceso={menuAcceso} onToggle={handleToggleMenu} />}
                  {tab === "usuarios" && <TabUsuarios usuarios={rolUsuarios} onQuitar={handleQuitarUsuario} onAbrirModal={() => setModalUsu(true)} />}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {modalRol !== null && (
        <ModalRol
          rol={modalRol === "nuevo" ? null : modalRol}
          onGuardar={handleGuardarRol} onCerrar={() => setModalRol(null)} loading={guardando}
        />
      )}
      {modalUsu && rolId && (
        <ModalAgregarUsuario
          usuariosActuales={rolUsuarios}
          onAgregar={handleAgregarUsuario} onCerrar={() => setModalUsu(false)}
        />
      )}
      <ModalDialog
        open={confirmEl !== null}
        variant="confirm"
        title="Eliminar rol"
        message={`¿Eliminar el rol "${roles.find(r => r.rolId === confirmEl)?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleEliminarRol}
        onClose={() => setConfirmEl(null)}
      />
    </div>
  );
}
