const API_URL = import.meta.env.VITE_API_URL;

export async function getConsultas(filters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 9),
    sort: 'fechaConsulta,DESC',
  });

  if (filters.busqueda) params.set('busqueda', filters.busqueda);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
  if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
  if (filters.integrante) params.set('idIntegrante', String(filters.integrante));
  if (filters.medico) params.set('idMedico', String(filters.medico));

  const response = await fetch(`${API_URL}/consultas?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener consultas: ${response.status}`);
  }

  return response.json();
}

export async function getConsultaById(idConsulta) {
  const response = await fetch(`${API_URL}/consultas/${idConsulta}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el detalle de la consulta: ${response.status}`);
  }

  return response.json();
}

export async function createConsulta(data) {
  const response = await fetch(`${API_URL}/consultas`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al crear consulta: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function updateConsulta(idConsulta, data) {
  const response = await fetch(`${API_URL}/consultas/${idConsulta}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar consulta: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function concludeConsulta(idConsulta, data) {
  const response = await fetch(`${API_URL}/consultas/${idConsulta}/concluir`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al concluir consulta: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function cancelConsulta(idConsulta) {
  const response = await fetch(`${API_URL}/consultas/${idConsulta}/cancelar`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al cancelar consulta: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function deleteConsulta(idConsulta) {
  const response = await fetch(`${API_URL}/consultas/${idConsulta}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Error al eliminar consulta: ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.menssaje === 'string' && body.menssaje.trim()) {
        message = body.menssaje;
      }
    } catch {
      // Si la respuesta no contiene JSON, se conserva el error HTTP.
    }
    throw new Error(message);
  }

  return null;
}
