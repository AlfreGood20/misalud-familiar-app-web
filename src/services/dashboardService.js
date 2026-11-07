const API_URL = import.meta.env.VITE_API_URL;

// Reemplaza esta ruta por el endpoint real de resumen familiar.
export async function getDashboardData() {
  const response = await fetch(`${API_URL}/familias/dashboard`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al cargar el dashboard: ${response.status}`);
  }

  return response.json();
}
