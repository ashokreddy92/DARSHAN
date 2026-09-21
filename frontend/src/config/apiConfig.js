/**
 * DarshanEase — API Configuration & Dynamic Backend Endpoint Resolver
 * Ensures production site on Render always resolves to the active Render backend API.
 */

export const getApiBaseUrl = () => {
  // 1. Check explicit build environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  // 2. If running in a production browser environment (not localhost)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://darshan-2-sap7.onrender.com';
    }
  }

  // 3. Local Development Fallback
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_AUTH_URL = `${API_BASE_URL}/api/auth`;

export default getApiBaseUrl;
