import {
  ArchiveBoxXMarkIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  formatDate, getDaysToExpire, getStatusInfo, getUnitLabel, isLowStock,
} from './stockOptions';

function StockCard({
  stock, isAdmin, onSelect, onEdit, onAdjust, onDiscard, onDelete,
}) {
  const status = getStatusInfo(stock.estado);
  const lowStock = isLowStock(stock);
  const days = getDaysToExpire(stock.fechaCaducidad);
  const expiresSoon = stock.estado === 'DISPONIBLE' && days !== null && days >= 0 && days <= 30;
  const discarded = stock.estado === 'DESECHADO';

  return (
    <article className="card border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-0 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]">
            <CubeIcon className="size-6" aria-hidden="true" />
          </span>
          <span className={`badge badge-sm ${status.badge}`}>{status.label}</span>
        </div>

        <button type="button" onClick={() => onSelect(stock.id)} className="mt-4 text-left">
          <h3 className="text-lg font-bold text-[#19304a]">{stock.medicamento?.nombreComercial}</h3>
          <p className="text-sm text-slate-500">
            {stock.medicamento?.sustanciaActiva} · {stock.medicamento?.concentracion}
          </p>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded-lg bg-slate-50 p-2 text-slate-600">
            <span className="block text-slate-400">Cantidad</span>
            <strong className="text-sm text-[#19304a]">{stock.cantidad} {getUnitLabel(stock.unidad)}</strong>
          </span>
          <span className="rounded-lg bg-slate-50 p-2 text-slate-600">
            <span className="block text-slate-400">Mínimo</span>
            <strong className="text-sm text-[#19304a]">{stock.cantidadMinima} {getUnitLabel(stock.unidad)}</strong>
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDaysIcon className="size-4 text-[#15919a]" aria-hidden="true" />
          Caduca: {formatDate(stock.fechaCaducidad)}
        </p>

        {(lowStock || expiresSoon) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStock && (
              <span className="badge badge-warning badge-sm gap-1">
                <ExclamationTriangleIcon className="size-3" /> Stock bajo
              </span>
            )}
            {expiresSoon && (
              <span className="badge badge-warning badge-sm gap-1">
                <CalendarDaysIcon className="size-3" /> Caduca en {days} {days === 1 ? 'día' : 'días'}
              </span>
            )}
          </div>
        )}

        <div className="card-actions mt-4 flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={() => onAdjust(stock)} className="btn btn-outline btn-sm flex-1" disabled={discarded}>
            Ajustar cantidad
          </button>
          <button type="button" onClick={() => onEdit(stock)} className="btn btn-ghost btn-sm" aria-label="Editar">
            <PencilSquareIcon className="size-4" />
          </button>
          <button type="button" onClick={() => onDiscard(stock)} className="btn btn-ghost btn-sm" aria-label="Desechar" disabled={discarded}>
            <ArchiveBoxXMarkIcon className="size-4" />
          </button>
          {isAdmin && (
            <button type="button" onClick={() => onDelete(stock)} className="btn btn-error btn-sm text-white" aria-label="Eliminar">
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>

        <button type="button" onClick={() => onSelect(stock.id)} className="mt-3 flex items-center justify-end gap-1 text-xs font-bold text-[#126f7b]">
          Ver detalle <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}

export default StockCard;
