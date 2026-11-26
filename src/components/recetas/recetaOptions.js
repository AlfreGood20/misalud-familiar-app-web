export const tomaStyles = {
  PENDIENTE: { label: 'Pendiente', badge: 'bg-[#fff3df] text-[#bd7419]', dot: 'bg-[#d98b1f]' },
  TOMADA: { label: 'Tomada', badge: 'bg-[#e5f7f4] text-[#126f7b]', dot: 'bg-[#2f9e78]' },
  OMITIDA: { label: 'Omitida', badge: 'bg-[#fff0f0] text-[#b54b52]', dot: 'bg-[#c84b55]' },
  CANCELADA: { label: 'Cancelada', badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

export const dayPeriods = [
  { key: 'madrugada', label: 'Madrugada', range: [0, 6] },
  { key: 'manana', label: 'Mañana', range: [6, 12] },
  { key: 'tarde', label: 'Tarde', range: [12, 19] },
  { key: 'noche', label: 'Noche', range: [19, 24] },
];

export function toDateInput(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function shiftDay(value, amount) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateInput(date);
}

export function formatDayLabel(value) {
  const today = toDateInput(new Date());
  if (value === today) return 'Hoy';
  if (value === shiftDay(today, 1)) return 'Mañana';
  if (value === shiftDay(today, -1)) return 'Ayer';
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatShortDate(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return 'Sin fecha';
  return `${formatShortDate(value)} · ${formatTime(value)}`;
}

// La API espera "yyyy-MM-dd h:mma" (por ejemplo, 2026-11-25 8:00AM).
export function toApiDateTime(value) {
  const [date, time] = value.split('T');
  const [hours, minutes] = time.split(':');
  const hour = Number(hours);
  return `${date} ${hour % 12 || 12}:${minutes}${hour >= 12 ? 'PM' : 'AM'}`;
}

export function fullName(person) {
  return [person?.nombre, person?.apellidoPaterno, person?.apellidoMaterno].filter(Boolean).join(' ');
}

export function frequencyLabel(hours) {
  return hours === 24 ? 'Cada día' : `Cada ${hours} h`;
}

export function isOverdue(toma) {
  return toma.estado === 'PENDIENTE' && new Date(toma.fechaHoraProgramada).getTime() < Date.now();
}
