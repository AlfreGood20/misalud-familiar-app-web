const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboardData() {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al cargar el dashboard: ${response.status}`);
  }

  const data = await response.json();
  const kpiFields = [
    'integrantesRegistrados',
    'consultasPendientes',
    'medicamentosEnStock',
    'medicamentosPorCaducar',
    'tomasHoyCompletadas',
    'tomasHoyTotales',
  ];

  if (
    !data
    || typeof data.nombreFamilia !== 'string'
    || !data.kpis
    || !kpiFields.every((field) => Number.isFinite(data.kpis[field]))
    || !Array.isArray(data.tomasDeHoy)
    || !Array.isArray(data.proximasConsultas)
    || !Array.isArray(data.integrantes)
  ) {
    throw new Error('La respuesta del dashboard no tiene el formato esperado.');
  }

  return data;
}
