// src/App.jsx
import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "./stores/authSlice";
import { authApi } from "./api/auth.api";
import { router } from "./app/routes";


export default function App() {
  const dispatch = useDispatch();

  // loading: mientras verifica la sesión, no mostramos nada
  // (evita un flash del login antes de recuperar la sesión)
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const recuperarSesion = async () => {
      try {
        const resultado = await authApi.refresh();

        if (resultado.exito) {
          // Cookie válida → restaurar sesión en Redux
          dispatch(setCredentials({
            accessToken: resultado.datos.accessToken,
            usuario:     resultado.datos.usuario,
          }));
        }
        // Si falla simplemente no hay sesión, el router manda al login
      } catch {
        // Sin cookie o expirada → no hacer nada, el router redirige al login
      } finally {
        setChecking(false);
      }
    };

    recuperarSesion();
  }, [dispatch]);

  // Mientras verifica la sesión mostramos una pantalla de carga simple
  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a0d744 0%, #649719 45%, #3e5b19 100%)",
      }}>
        <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600 }}>
          Cargando...
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}