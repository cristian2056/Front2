// src/pages/Equipo/tabs/TabFotos.jsx
// Sube y muestra fotos de un equipo. Soporta cámara y galería.
// Las fotos se suben via multipart/form-data al endpoint /api/Fotos/upload.
import React, { useEffect, useRef, useState } from "react";
import { fotosApi } from "../../../api/equipoExtras.api";
import ErrorBanner from "../../../components/ui/ErrorBanner";
import { inputStyle, labelStyle } from "../../../components/ui/formStyles";
import ConfirmInline from "../../../components/ui/ConfirmInline";

const API_BASE = import.meta.env.VITE_API_BASE_URI;

// ─── Formulario de subida de foto ─────────────────────────────────────────────
function FormFoto({ onGuardar, onCancelar, loading }) {
  const [nombre,       setNombre]       = useState("");
  const [preview,      setPreview]      = useState(null);  // base64 para previsualizar
  const [archivo,      setArchivo]      = useState(null);  // File object
  const [modo,         setModo]         = useState(null);  // "galeria" | "camara"
  const [camaraStream, setCamaraStream] = useState(null);
  const [errorCamara,  setErrorCamara]  = useState("");
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const inputRef  = useRef(null);

  // Abre la cámara del dispositivo (trasera en móvil)
  const abrirCamara = async () => {
    setErrorCamara("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCamaraStream(stream);
      setModo("camara");
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      setErrorCamara("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
    }
  };

  // Libera los recursos de la cámara
  const cerrarCamara = () => {
    if (camaraStream) camaraStream.getTracks().forEach(t => t.stop());
    setCamaraStream(null);
    setModo(null);
  };

  // Captura el frame actual del video
  const capturarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      setArchivo(new File([blob], "foto_camara.jpg", { type: "image/jpeg" }));
    });
    cerrarCamara();
  };

  // Selecciona archivo desde el sistema de archivos
  const seleccionarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setModo("galeria");
  };

  const limpiar = () => {
    setPreview(null); setArchivo(null); setModo(null);
    cerrarCamara();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!archivo) return;
    onGuardar({ archivo, nombre: nombre.trim() || null });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Descripción (opcional)</label>
        <input type="text" placeholder="Ej: Vista frontal, pantalla..."
          value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
      </div>

      {/* Botones para elegir fuente de imagen */}
      {!preview && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button type="button" onClick={() => { setModo("galeria"); inputRef.current?.click(); }}
            style={{ flex: 1, padding: "32px 0", borderRadius: 12, border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: "0.93rem", color: "#374151", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "2rem" }}>🖼️</span>
            Seleccionar de galería
          </button>
          <button type="button" onClick={abrirCamara}
            style={{ flex: 1, padding: "32px 0", borderRadius: 12, border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: "0.93rem", color: "#374151", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "2rem" }}>📷</span>
            Tomar foto
          </button>
        </div>
      )}

      {/* Input oculto para galería */}
      <input ref={inputRef} type="file" accept="image/*" onChange={seleccionarArchivo} style={{ display: "none" }} />

      {errorCamara && <ErrorBanner mensaje={errorCamara} />}

      {/* Vista en vivo de la cámara */}
      {modo === "camara" && camaraStream && (
        <div style={{ marginBottom: 16 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 12, background: "#000" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={cerrarCamara}
              style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.93rem" }}>
              Cancelar
            </button>
            <button type="button" onClick={capturarFoto}
              style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#4c7318", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.93rem" }}>
              📸 Capturar
            </button>
          </div>
        </div>
      )}

      {/* Preview de imagen seleccionada */}
      {preview && (
        <div style={{ marginBottom: 16 }}>
          <img src={preview} alt="Preview"
            style={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 12, border: "1.5px solid #e5e7eb" }} />
          <button type="button" onClick={limpiar}
            style={{ marginTop: 8, padding: "6px 14px", borderRadius: 7, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem", color: "#6b7280" }}>
            ✕ Cambiar foto
          </button>
        </div>
      )}

      {/* Botones de acción */}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onCancelar}
          style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #d1d5db", background: "#fff", fontWeight: 600, fontSize: "0.93rem", cursor: "pointer", color: "#374151" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading || !archivo}
          style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: loading || !archivo ? "#9ca3af" : "#4c7318", color: "#fff", fontWeight: 700, fontSize: "0.93rem", cursor: loading || !archivo ? "not-allowed" : "pointer" }}>
          {loading ? "Subiendo..." : "Guardar foto"}
        </button>
      </div>
    </form>
  );
}

// ─── Tab principal ─────────────────────────────────────────────────────────────
export default function TabFotos({ equipoId, crear, eliminar }) {
  const [lista,        setLista]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [mostrarForm,  setMostrarForm]  = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [confirmElim,  setConfirmElim]  = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const data = await fotosApi.listar();
      const todas = Array.isArray(data.datos) ? data.datos : data.datos ? [data.datos] : [];
      setLista(todas.filter(f => String(f.equipoId) === String(equipoId)));
    } catch (e) {
      setError(e.message || "Error al cargar fotos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [equipoId]);

  // Sube via multipart/form-data (http.js usa JSON, por eso se llama directamente con fetch)
  const handleGuardar = async ({ archivo, nombre }) => {
    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("nombre",   nombre ?? "");
      formData.append("equipoId", String(equipoId));

      const { store } = await import("../../../stores/store");
      const token = store.getState().auth.accessToken;
      const res = await fetch(`${API_BASE}/api/Fotos/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!data.exito) throw new Error(data.mensaje || "No se pudo subir la foto.");

      setMostrarForm(false);
      cargar();
    } catch (e) {
      setError(e.message || "Error al subir la foto.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await fotosApi.eliminar(id);
      setConfirmElim(null);
      cargar();
    } catch (e) {
      setError(e.message || "No se pudo eliminar.");
    }
  };

  return (
    <div>
      <ErrorBanner mensaje={error} />

      {!mostrarForm && crear && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setMostrarForm(true)}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#4c7318", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            + Agregar foto
          </button>
        </div>
      )}

      {mostrarForm && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 16px", fontSize: "0.97rem", fontWeight: 700, color: "#232946" }}>📷 Agregar foto</h4>
          <FormFoto onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} loading={guardando} />
        </div>
      )}

      {loading ? (
        <div style={{ color: "#888", padding: "16px 0" }}>Cargando fotos...</div>
      ) : lista.length === 0 ? (
        <div style={{ color: "#9ca3af", padding: "24px 0", textAlign: "center", fontSize: "0.93rem" }}>
          📷 No hay fotos registradas para este equipo.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {lista.map((foto) => (
            <div key={foto.fotoId} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Imagen clickeable para ampliar */}
              <div style={{ height: 120, background: "#f3f4f6", overflow: "hidden", cursor: "pointer" }}
                onClick={() => setFotoAmpliada(foto)}>
                <img src={`${API_BASE}${foto.url}`} alt={foto.nombre ?? "Foto"}
                  onError={e => { e.target.src = ""; e.target.style.display = "none"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 8, wordBreak: "break-word" }}>
                  {foto.nombre ?? "Sin nombre"}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {eliminar && (confirmElim === foto.fotoId ? (
                    <ConfirmInline
                      onConfirmar={() => handleEliminar(foto.fotoId)}
                      onCancelar={() => setConfirmElim(null)}
                    />
                  ) : (
                    <button onClick={() => setConfirmElim(foto.fotoId)}
                      style={{ flex: 1, padding: "4px 0", borderRadius: 6, border: "1.5px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: "0.8rem" }}>
                      🗑️ Eliminar
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox para ampliar foto */}
      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, cursor: "zoom-out", padding: 24 }}>
          <img src={`${API_BASE}${fotoAmpliada.url}`} alt={fotoAmpliada.nombre ?? "Foto"}
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setFotoAmpliada(null)}
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "1.5rem", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
      )}
    </div>
  );
}
