// src/services/http.js
// Versión actualizada: inyecta el accessToken y maneja refresh automático en 401

import { store } from "../stores/store";
import { setCredentials, logoutLocal } from "../stores/authSlice";
import { authApi } from "../api/auth.api";

const API_BASE_URI = import.meta.env.VITE_API_BASE_URI;

if (!API_BASE_URI) {
  console.warn("[http] Falta VITE_API_BASE_URI en .env");
}

class HttpError extends Error {
  constructor(message, { status, url, details } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
    this.details = details;
  }
}

const normalizeBody = (body) => {
  if (body == null) return undefined;
  if (body instanceof FormData) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

// buildHeaders ahora lee el accessToken desde Redux y lo inyecta
// en el header Authorization de cada request
const buildHeaders = (options = {}) => {
  const headers = new Headers(options.headers || {});

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");

  // ← NUEVO: leer el token del store de Redux y agregarlo al header
  // El backend lo busca en "Authorization: Bearer <token>"
  const token = store.getState().auth.accessToken;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

// Variable para evitar múltiples refresh al mismo tiempo
// Si ya hay un refresh en curso, esperamos que termine en vez de lanzar otro
let isRefreshing = false;
let refreshQueue = []; // requests que esperan el nuevo token

const processQueue = (newToken) => {
  refreshQueue.forEach(resolve => resolve(newToken));
  refreshQueue = [];
};

export async function http(path, options = {}) {
  const url = `${API_BASE_URI}${path}`;

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 20000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: buildHeaders(options),
      body: normalizeBody(options.body),
      signal: options.signal || controller.signal,
      credentials: options.credentials || "include",
    });

    const contentType = res.headers.get("content-type") || "";
    const raw = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    // ← NUEVO: si el token venció (401) → intentar refresh automático
    if (res.status === 401) {

      // Si ya hay un refresh en curso, esperamos que termine
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            options.headers = { ...options.headers, Authorization: `Bearer ${newToken}` };
            resolve(http(path, options));
          });
        });
      }

      isRefreshing = true;

      try {
        // Llamar a /auth/refresh (la cookie viaja automáticamente)
        const refreshResult = await authApi.refresh();

        if (refreshResult.exito) {
          // Guardar el nuevo token en Redux
          store.dispatch(setCredentials({
            accessToken: refreshResult.datos.accessToken,
            usuario: refreshResult.datos.usuario,
          }));

          // Procesar requests que estaban esperando
          processQueue(refreshResult.datos.accessToken);

          // Reintentar la request original con el nuevo token
          return http(path, options);
        } else {
          // Refresh falló → sesión expirada, logout local
          store.dispatch(logoutLocal());
          processQueue(null);
          throw new HttpError("Sesión expirada. Iniciá sesión nuevamente.", { status: 401, url });
        }
      } finally {
        isRefreshing = false;
      }
    }

    if (!res.ok) {
      const msg =
        (raw && raw.message) ||
        (typeof raw === "string" && raw.trim()) ||
        `Request failed (${res.status})`;
      throw new HttpError(msg, { status: res.status, url, details: raw });
    }

    return raw;

  } catch (err) {
    if (err?.name === "AbortError") {
      throw new HttpError("Tiempo de espera agotado. Intenta nuevamente.", { status: 408, url });
    }
    if (err instanceof HttpError) throw err;
    throw new HttpError(err?.message || "Error de red inesperado.", { url });
  } finally {
    clearTimeout(timeoutId);
  }
}

export { HttpError };