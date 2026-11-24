export const studyCategories = [
  { value: 'SANGRE', label: 'Sangre' },
  { value: 'ORINA', label: 'Orina' },
  { value: 'HECES', label: 'Heces' },
  { value: 'IMAGEN', label: 'Imagen' },
  { value: 'OTRO', label: 'Otro' },
];

export const studyStatuses = [
  { value: 'PENDIENTE', label: 'Pendiente', badge: 'bg-[#fff3df] text-[#bd7419]' },
  { value: 'REALIZADO', label: 'Realizado', badge: 'bg-[#e0f5ef] text-[#176b67]' },
  { value: 'CANCELADO', label: 'Cancelado', badge: 'bg-slate-100 text-slate-500' },
];

export function getCategoryLabel(category) {
  return studyCategories.find((item) => item.value === category)?.label ?? category ?? '';
}

export function getStatusInfo(status) {
  return studyStatuses.find((item) => item.value === status)
    ?? { label: status, badge: 'bg-slate-100 text-slate-500' };
}

export function getFullName(person) {
  return [person?.nombre, person?.apellidoPaterno, person?.apellidoMaterno].filter(Boolean).join(' ');
}

// Convierte `YYYY-MM-DD` a fecha legible sin desfase por zona horaria.
export function formatDate(value) {
  if (!value) return 'Sin fecha';
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return 'Sin costo registrado';
  return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

// PUT /estudios-laboratorio/{id} reemplaza todos los campos, incluidos los resultados.
// Se arma el cuerpo con los datos actuales para no borrar nada al cambiar solo una parte.
export function toUpdatePayload(study, overrides = {}) {
  return {
    idConsulta: study.consulta?.id ?? null,
    fechaEstudio: study.fechaEstudio,
    tipoEstudio: study.tipoEstudio,
    categoria: study.categoria,
    laboratorio: study.laboratorio ?? null,
    indicaciones: study.indicaciones ?? null,
    estado: study.estado,
    resultado: study.resultado ?? null,
    valoresReferencia: study.valoresReferencia ?? null,
    observaciones: study.observaciones ?? null,
    archivoUrl: study.archivoUrl ?? null,
    costo: study.costo ?? null,
    ...overrides,
  };
}
