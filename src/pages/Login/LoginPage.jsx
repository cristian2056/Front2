// src/pages/Login/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../stores/authSlice";
import { authApi } from "../../api/auth.api";

// Colores lima (mismo tema del sidebar)
const COLOR = {
  primary:     "#4c7318",   // lima-700
  primaryDark: "#3e5b19",   // lima-800
  light:       "#f6fce9",   // lima-50
};

export default function LoginPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Llamar al backend
      const resultado = await authApi.login(userName, password);

      // 2) Si falló → mostrar mensaje de error
      if (!resultado.exito) {
        setError(resultado.mensaje || "Credenciales incorrectas.");
        return;
      }

      // 3) Si funcionó → guardar token y usuario en Redux
      dispatch(setCredentials({
        accessToken: resultado.datos.accessToken,
        usuario:     resultado.datos.usuario,
      }));

      // 4) Redirigir al dashboard
      navigate("/", { replace: true });

    } catch {
      setError("Error de conexión. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 9,
    border: "1.5px solid #d1d5db",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
    color: "#111",
  };

  return (
    // Fondo con degradado lima (igual que el sidebar)
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, #a0d744 0%, #649719 45%, #3e5b19 100%)`,
    }}>

      {/* Tarjeta de login */}
      <div style={{
        background: "#fff",
        borderRadius: 18,
        padding: "44px 40px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(26,43,8,0.25)",
      }}>

        {/* Logo / título */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: `linear-gradient(135deg, #a0d744, #3e5b19)`,
            borderRadius: 14,
            margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem",
          }}>
            🖥️
          </div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#1a2b08" }}>
            Parque Informático
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Iniciá sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>

          {/* Campo usuario */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>
              Usuario
            </label>
            <input
              type="text"
              placeholder="Tu nombre de usuario"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Campo contraseña */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151", fontSize: "0.9rem" }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              color: "#dc2626", fontSize: "0.9rem",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Botón ingresar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 9,
              border: "none",
              background: loading ? "#9ca3af" : COLOR.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
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