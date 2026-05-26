/**
 * API Configuration — Single source of truth for backend URL.
 * Uses VITE_API_URL from .env in production, falls back to localhost in dev.
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE;
