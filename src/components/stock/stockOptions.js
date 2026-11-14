export const stockStatuses = [
  { value: 'DISPONIBLE', label: 'Disponible', badge: 'badge-success' },
  { value: 'AGOTADO', label: 'Agotado', badge: 'badge-warning' },
  { value: 'CADUCADO', label: 'Caducado', badge: 'badge-error' },
  { value: 'DESECHADO', label: 'Desechado', badge: 'badge-ghost' },
];

export const stockUnits = [
  { value: 'TABLETAS', label: 'Tabletas' },
  { value: 'CAPSULAS', label: 'Cápsulas' },
  { value: 'ML', label: 'ml' },
  { value: 'GRAMOS', label: 'Gramos' },
  { value: 'DOSIS', label: 'Dosis' },
  { value: 'PIEZAS', label: 'Piezas' },
  { value: 'OTRA', label: 'Otra' },
];

export function getStatusInfo(status) {
  return stockStatuses.find((item) => item.value === status) ?? { label: status, badge: 'badge-ghost' };
}

export function getUnitLabel(unit) {
  return stockUnits.find((item) => item.value === unit)?.label ?? unit ?? '';
}

export function isLowStock(stock) {
  return stock.estado === 'DISPONIBLE' && stock.cantidad <= stock.cantidadMinima;
}

export const EXPIRING_DAYS = 30;

// Convierte el listado de stock en alertas: agotado, caducado, stock bajo o por caducar.
export function buildStockAlerts(items) {
  const alerts = [];

  items.forEach((stock) => {
    const days = getDaysToExpire(stock.fechaCaducidad);

    if (stock.estado === 'AGOTADO') {
      alerts.push({ id: `${stock.id}-agotado`, type: 'AGOTADO', message: 'Medicamento agotado', stock });
    } else if (stock.estado === 'CADUCADO') {
      alerts.push({ id: `${stock.id}-caducado`, type: 'CADUCADO', message: 'Medicamento caducado', stock });
    } else if (stock.estado === 'DISPONIBLE') {
      if (stock.cantidad <= stock.cantidadMinima) {
        alerts.push({
          id: `${stock.id}-bajo`,
          type: 'BAJO',
          message: `Stock bajo: ${stock.cantidad} de ${stock.cantidadMinima} mínimos`,
          stock,
        });
      }
      if (days !== null && days <= EXPIRING_DAYS) {
        alerts.push({
          id: `${stock.id}-porcaducar`,
          type: 'POR_CADUCAR',
          message: days <= 0 ? 'Caduca hoy' : `Caduca en ${days} ${days === 1 ? 'día' : 'días'}`,
          stock,
        });
      }
    }
  });

  return alerts;
}

export function getTodayDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

// Convierte `YYYY-MM-DD` a fecha legible sin desfase por zona horaria.
export function formatDate(value) {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function getDaysToExpire(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((new Date(year, month - 1, day) - start) / 86400000);
}
