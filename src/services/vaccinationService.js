const API_URL = import.meta.env.VITE_API_URL;

export async function getEsquemasVacunacion(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 2),
  });

  if (filters.nombreVacuna) params.set('nombreVacuna', filters.nombreVacuna);

  const response = await fetch(`${API_URL}/esquemas-vacunacion?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el esquema de vacunación: ${response.status}`);
  }

  return response.json();
}

export async function getCartillaVacunacion(idIntegrante, filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 10),
  });

  if (filters.nombreVacuna) params.set('nombreVacuna', filters.nombreVacuna);
  if (filters.estado) params.set('estado', filters.estado);

  const response = await fetch(
    `${API_URL}/integrantes/${idIntegrante}/cartilla-vacunacion?${params.toString()}`,
    { credentials: 'include' },
  );

  if (!response.ok) {
    throw new Error(`Error al obtener la cartilla de vacunación: ${response.status}`);
  }

  return response.json();
}

export async function registerVaccineApplication(data) {
  const response = await fetch(`${API_URL}/aplicaciones-vacunas`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al registrar la aplicación de vacuna: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function updateVaccineApplication(idAplicacion, data) {
  const response = await fetch(`${API_URL}/aplicaciones-vacunas/${idAplicacion}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar la aplicación de vacuna: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function deleteVaccineApplication(idAplicacion) {
  const response = await fetch(`${API_URL}/aplicaciones-vacunas/${idAplicacion}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar la aplicación de vacuna: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}
