// src/App.jsx
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "./stores/authSlice";
import { setMenu } from "./stores/menuSlice";
import { authApi } from "./api/auth.api";
import { router } from "./app/routes";


export default function App() {
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const recuperarSesion = async () => {
      try {
        const resultado = await authApi.refresh();

        if (resultado?.exito) {
          const { accessToken, usuario } = resultado.datos;

          dispatch(setCredentials({ accessToken, usuario }));

          // Cargar menus y permisos — GET /api/Menu/usuario/{usuarioId}
          const menuResult = await authApi.obtenerMenu(usuario.usuarioId, accessToken);

          const menus = menuResult?.datos?.menus ?? [];

          const rawPermisos = menuResult?.datos?.permisos ?? {};
          const permisos = {};
          for (const [key, val] of Object.entries(rawPermisos)) {
            permisos[key.toLowerCase()] = val;
          }

          dispatch(setMenu({ menus, permisos }));
        }
      } catch {
        // Sin cookie o expirada → el router redirige al login
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