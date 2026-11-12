const API_URL = import.meta.env.VITE_API_URL;

export async function getMedicos() {
  const response = await fetch(`${API_URL}/medicos`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener médicos: ${response.status}`);
  }

  return response.json();
}
