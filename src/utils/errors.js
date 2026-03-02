// src/utils/errors.js
// Utilidades para manejo de errores globales

export function parseError(error) {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.status && error.statusText) return `${error.status}: ${error.statusText}`;
  return JSON.stringify(error);
}
