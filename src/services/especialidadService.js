const API_URL = import.meta.env.VITE_API_URL;

export async function getEspecialidades() {
  // CONSUMO DE API: catálogo de especialidades médicas.
  const response = await fetch(`${API_URL}/especialidades`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener especialidades: ${response.status}`);
  }

  return response.json();
}
