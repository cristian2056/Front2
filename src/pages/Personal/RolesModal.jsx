// src/pages/Personal/RolesModal.jsx
// Selector de UN solo rol por usuario (nuevo sistema)
import React, { useEffect, useState } from "react";
import { personalApi } from "../../api/personal.api";
import { http } from "../../services/http";

export default function RolesModal({ persona, onClose }) {
  const usuario = persona.usuario;
  const [roles,     setRoles]     = useState([]);
  const [rolId,     setRolId]     = useState(usuario?.rolId ?? "");
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg,       setMsg]       = useState("");

  useEffect(() => {
    personalApi.listarRoles()
      .then(r => setRoles(Array.isArray(r.datos) ? r.datos : []))
      .catch(() => setMsg("No se pudieron cargar los roles."))
      .finally(() => setLoading(false));
  }, []);

  const handleGuardar = async () => {
    if (!rolId) { setMsg("Seleccioná un rol."); return; }
    setGuardando(true);
    setMsg("");
    try {
      await http(`/api/Usuarios/${usuario.usuarioId}`, {
        method: "PUT",
        body: {
          userName:      usuario.userName,
          dependenciaId: usuario.dependenciaId,
          activo:        usuario.activo ?? true,
          rolId:         Number(rolId),
        },
      });
      onClose();
    } catch (e) {
      setMsg(e.message || "Error al actualizar rol.");
    } finally {
      setGuardando(false);
    }
  };

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
  };
  const box = {
    background: "#fff", borderRadius: 14, padding: "28px 32px",
    width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  };

  return (
    <div style={overlay}>
      <div style={box}>
        <h3 style={{ margin: "0 0 6px", color: "#111827" }}>🔐 Asignar rol</h3>
        <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>
          {persona.nombres} — usuario: <strong>{usuario?.userName}</strong>
        </p>

        {loading ? (
          <p style={{ color: "#9ca3af" }}>Cargando roles...</p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.88rem" }}>
              Rol *
            </label>
            <select
              value={rolId}
              onChange={e => setRolId(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: "1.5px solid #d1d5db", fontSize: "0.95rem",
                background: "#fff", cursor: "pointer",
              }}
            >
              <option value="">Seleccione un rol...</option>
              {roles.map(r => (
                <option key={r.rolId} value={r.rolId}>{r.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {msg && <p style={{ color: "#dc2626", fontSize: "0.88rem", marginBottom: 12 }}>{msg}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button onClick={onClose} disabled={guardando}
            style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid #d1d5db",
              background: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando || loading}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none",
              background: "#4c7318", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
