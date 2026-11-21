const API_URL = import.meta.env.VITE_API_URL;

// La API devuelve el mensaje de error en la propiedad `menssaje`.
async function buildError(response, fallback) {
  let message = `${fallback}: ${response.status}`;
  try {
    const body = await response.json();
    if (body?.menssaje) message = body.menssaje;
  } catch {
    // La respuesta no tenía cuerpo JSON; se conserva el mensaje por defecto.
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
}

export async function getMedicos() {
  // CONSUMO DE API: listado de médicos de la familia (sin paginación).
  const response = await fetch(`${API_URL}/medicos`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener médicos: ${response.status}`);
  }

  return response.json();
}

export async function getMedicoById(idMedico) {
  // CONSUMO DE API: detalle de un médico.
  const response = await fetch(`${API_URL}/medicos/${idMedico}`, {
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al obtener el médico');
  return response.json();
}

export async function createMedico(data) {
  // CONSUMO DE API: crea un médico con sus especialidades (solo ADMIN).
  const response = await fetch(`${API_URL}/medicos`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw await buildError(response, 'Error al crear el médico');
  return response.json();
}

export async function deleteMedico(idMedico) {
  // CONSUMO DE API: elimina un médico de la familia (solo ADMIN).
  const response = await fetch(`${API_URL}/medicos/${idMedico}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al eliminar el médico');
  return null;
}
