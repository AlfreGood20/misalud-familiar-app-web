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

async function sendJson(path, method, data, fallback) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw await buildError(response, fallback);
  return response.json();
}

export async function getEstudios(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 9),
    sort: 'fechaEstudio,DESC',
  });

  if (filters.busqueda) params.set('busqueda', filters.busqueda);
  if (filters.integrante) params.set('idIntegrante', String(filters.integrante));
  if (filters.categoria) params.set('categoria', filters.categoria);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.pendientes) params.set('pendientes', 'true');

  // CONSUMO DE API: listado de estudios con filtros y paginación (solo ADMIN).
  const response = await fetch(`${API_URL}/estudios-laboratorio?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al obtener los estudios');
  return response.json();
}

export function createEstudio(data) {
  // CONSUMO DE API: registra o solicita un estudio de laboratorio.
  return sendJson('/estudios-laboratorio', 'POST', data, 'Error al registrar el estudio');
}

export function updateEstudio(idEstudio, data) {
  // CONSUMO DE API: actualiza TODOS los datos del estudio (incluye resultados).
  return sendJson(`/estudios-laboratorio/${idEstudio}`, 'PUT', data, 'Error al actualizar el estudio');
}

export function cargarResultadoEstudio(idEstudio, data) {
  // CONSUMO DE API: carga el resultado y pasa el estudio a REALIZADO.
  return sendJson(`/estudios-laboratorio/${idEstudio}/resultado`, 'PATCH', data, 'Error al cargar el resultado');
}

export async function deleteEstudio(idEstudio) {
  // CONSUMO DE API: elimina un estudio registrado por error.
  const response = await fetch(`${API_URL}/estudios-laboratorio/${idEstudio}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al eliminar el estudio');
  return null;
}
