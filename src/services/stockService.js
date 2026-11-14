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

export async function getStock(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 9),
    sort: 'fechaCaducidad,ASC',
  });

  if (filters.nombre) params.set('nombre', filters.nombre);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.bajoMinimo) params.set('bajoMinimo', 'true');

  // CONSUMO DE API: listado de stock con filtros y paginación.
  const response = await fetch(`${API_URL}/stock?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al obtener el stock');
  return response.json();
}

export async function getStockById(idStock) {
  // CONSUMO DE API: detalle de un medicamento del stock (incluye días para caducar).
  const response = await fetch(`${API_URL}/stock/${idStock}`, {
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al obtener el detalle del stock');
  return response.json();
}

export async function createStock(data) {
  // CONSUMO DE API: añade un medicamento al stock. La unidad la define la API.
  const response = await fetch(`${API_URL}/stock`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw await buildError(response, 'Error al crear el stock');
  return response.json();
}

export async function updateStock(idStock, data) {
  // CONSUMO DE API: actualiza cantidad, mínimo, unidad y caducidad.
  const response = await fetch(`${API_URL}/stock/${idStock}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw await buildError(response, 'Error al actualizar el stock');
  return response.json();
}

export async function patchStock(idStock, data) {
  // CONSUMO DE API: actualización parcial, solo `cantidad` y/o `estado`.
  const response = await fetch(`${API_URL}/stock/${idStock}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw await buildError(response, 'Error al actualizar el stock');
  return response.json();
}

export async function deleteStock(idStock) {
  // CONSUMO DE API: elimina un medicamento del stock (solo ADMIN).
  const response = await fetch(`${API_URL}/stock/${idStock}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) throw await buildError(response, 'Error al eliminar el stock');
  return null;
}
