const API_URL = import.meta.env.VITE_API_URL;
export const ALERT_COUNT_UPDATED_EVENT = 'alertas:contador-actualizado';

export async function getAlertas(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 15),
    sort: 'fechaGeneracion,DESC',
    soloNoLeidas: String(filters.soloNoLeidas ?? false),
  });

  if (filters.idIntegrante !== undefined && filters.idIntegrante !== '') {
    params.set('idIntegrante', String(filters.idIntegrante));
  }
  if (filters.tipo) params.set('tipo', filters.tipo);

  const response = await fetch(`${API_URL}/alertas?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener alertas: ${response.status}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.content) || !data.page) {
    throw new Error('La respuesta de alertas no tiene el formato esperado.');
  }

  return data;
}

export async function getUnreadAlertCount() {
  const response = await fetch(`${API_URL}/alertas/contador`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el contador de alertas: ${response.status}`);
  }

  const data = await response.json();
  const count = data?.noLeidas;
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('La respuesta del contador de alertas no tiene el formato esperado.');
  }

  return count;
}

async function updateAlerta(path, method, errorMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }

  await response.text();
}

export async function markAlertaAsRead(idAlerta) {
  await updateAlerta(`/alertas/${idAlerta}/leer`, 'PATCH', 'Error al marcar la alerta como leída');
}

export async function markAllAlertasAsRead() {
  await updateAlerta('/alertas/leer-todas', 'PATCH', 'Error al marcar las alertas como leídas');
}

export async function deleteAlerta(idAlerta) {
  await updateAlerta(`/alertas/${idAlerta}`, 'DELETE', 'Error al eliminar la alerta');
}

export function publishUnreadAlertCount(count) {
  window.dispatchEvent(new CustomEvent(ALERT_COUNT_UPDATED_EVENT, { detail: count }));
}
