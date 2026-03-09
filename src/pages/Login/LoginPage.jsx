// src/pages/Login/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import { setMenu } from "../../stores/menuSlice";
import { authApi } from "../../api/auth.api";
import { http } from "../../services/http";

const COLOR = { primary: "#4c7318", primaryDark: "#3e5b19" };

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Login
      const resultado = await authApi.login(userName, password);
      if (!resultado.exito) {
        setError(resultado.mensaje || "Credenciales incorrectas.");
        return;
      }

      const { accessToken, usuario } = resultado.datos;

      // 2. Guardar credenciales en Redux
      dispatch(setCredentials({ accessToken, usuario }));

      // 3. Cargar menús y permisos — usa http.js que ya tiene el Bearer token
      //    Pasamos el token manualmente porque Redux aún no lo tiene en este momento
      try {
        const menuResult = await fetch(
          `${import.meta.env.VITE_API_BASE_URI}/api/Menu`,
          { headers: { Authorization: `Bearer ${accessToken}` }, credentials: "include" }
        ).then(r => r.json());

        if (menuResult.exito) {
          dispatch(setMenu({
            menus:    menuResult.datos.menus    ?? [],
            permisos: menuResult.datos.permisos ?? {},
          }));
        }
      } catch {
        console.warn("[Login] No se pudo cargar el menú — se usará el fallback.");
      }

      // 4. Redirigir
      navigate("/", { replace: true });

    } catch {
      setError("Error de conexión. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 9,
    border: "1.5px solid #d1d5db", fontSize: "1rem",
    boxSizing: "border-box", outline: "none", background: "#fff", color: "#111",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #a0d744 0%, #649719 45%, #3e5b19 100%)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, padding: "44px 40px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(26,43,8,0.25)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #a0d744, #3e5b19)",
            borderRadius: 14, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem",
          }}>🖥️</div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#1a2b08" }}>
            Parque Informático
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Iniciá sesión para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>Usuario</label>
            <input type="text" placeholder="Tu nombre de usuario"
              value={userName} onChange={e => setUserName(e.target.value)} required style={inp} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>Contraseña</label>
            <input type="password" placeholder="Tu contraseña"
              value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: "0.9rem", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 9, border: "none",
              background: loading ? "#9ca3af" : COLOR.primary,
              color: "#fff", fontWeight: 700, fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = COLOR.primaryDark; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = COLOR.primary; }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}