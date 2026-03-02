// src/components/ui/ModalDialog.jsx
import React from "react";
import "./modalDialog.css";

const VARIANTS = {
  error: { title: "Ocurrió un error", border: "#b71c1c", button: "#b71c1c" },
  success: { title: "Operación exitosa", border: "#388e1f", button: "#388e1f" },
  confirm: { title: "Confirmar acción", border: "#5b5b5b", button: "#5b5b5b" },
};

export default function ModalDialog({
  open,
  variant = "error",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
}) {
  if (!open) return null;

  const v = VARIANTS[variant] || VARIANTS.error;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ borderColor: v.border }}>
        <div className="modal-title">{title || v.title}</div>
        <div className="modal-message">{message}</div>

        <div className="modal-actions">
          {variant === "confirm" ? (
            <>
              <button
                className="modal-btn"
                style={{ background: v.button }}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Procesando..." : confirmText}
              </button>
              <button className="modal-btn secondary" onClick={onClose} disabled={loading}>
                {cancelText}
              </button>
            </>
          ) : (
            <button className="modal-btn" style={{ background: v.button }} onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
