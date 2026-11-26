const API_URL = import.meta.env.VITE_API_URL;

// La API devuelve el mensaje de error en la propiedad `menssaje`.
async function parse(response, fallback) {
  if (!response.ok) {
    let message = `${fallback}: ${response.status}`;
    try {
      const body = await response.json();
      if (body?.menssaje) message = body.menssaje;
    } catch {
      // Sin cuerpo JSON: se conserva el mensaje por defecto.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

const jsonRequest = (method, data) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export async function getRecetas(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 6),
  });
  if (filters.idIntegrante) params.set('idIntegrante', String(filters.idIntegrante));
  if (filters.activa !== undefined && filters.activa !== '') params.set('activa', String(filters.activa));
  if (filters.busqueda) params.set('busqueda', filters.busqueda);

  // CONSUMO DE API: historial paginado de recetas.
  return parse(await fetch(`${API_URL}/recetas?${params.toString()}`, { credentials: 'include' }), 'Error al obtener recetas');
}

export async function createReceta(data) {
  // CONSUMO DE API: crea la receta y genera sus tomas programadas.
  return parse(await fetch(`${API_URL}/recetas`, jsonRequest('POST', data)), 'Error al crear la receta');
}

export async function finalizarReceta(idReceta) {
  // CONSUMO DE API: finaliza el tratamiento y cancela las tomas pendientes.
  return parse(await fetch(`${API_URL}/recetas/${idReceta}/finalizar`, { method: 'PATCH', credentials: 'include' }), 'Error al finalizar la receta');
}

export async function deleteReceta(idReceta) {
  // CONSUMO DE API: elimina la receta con sus medicamentos y tomas.
  return parse(await fetch(`${API_URL}/recetas/${idReceta}`, { method: 'DELETE', credentials: 'include' }), 'Error al eliminar la receta');
}

export async function getTomas(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 100),
  });
  if (filters.fechaInicio) params.set('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.set('fechaFin', filters.fechaFin);
  if (filters.idIntegrante) params.set('idIntegrante', String(filters.idIntegrante));
  if (filters.estado) params.set('estado', filters.estado);

  // CONSUMO DE API: agenda de tomas (por defecto, las de hoy).
  return parse(await fetch(`${API_URL}/tomas?${params.toString()}`, { credentials: 'include' }), 'Error al obtener las tomas');
}

export async function updateTomaEstado(idToma, estado) {
  // CONSUMO DE API: marca la toma como TOMADA, OMITIDA o PENDIENTE.
  return parse(await fetch(`${API_URL}/tomas/${idToma}/estado`, jsonRequest('PATCH', { estado })), 'Error al actualizar la toma');
}

export async function getTomasPorReceta(idReceta) {
  // CONSUMO DE API: cronograma completo de una receta.
  return parse(await fetch(`${API_URL}/tomas/recetas/${idReceta}`, { credentials: 'include' }), 'Error al obtener el cronograma');
}
