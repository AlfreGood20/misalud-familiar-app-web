import {
  BeakerIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  formatCurrency, formatDate, getCategoryLabel, getFullName, getStatusInfo,
} from './estudioOptions';

function EstudioCard({
  study, onSelect, onResult, onEdit, onCancel, onDelete,
}) {
  const status = getStatusInfo(study.estado);
  const pending = study.estado === 'PENDIENTE';

  return (
    <article className="card border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-0 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]">
            <BeakerIcon className="size-6" aria-hidden="true" />
          </span>
          <span className={`badge border-0 text-xs font-bold ${status.badge}`}>{status.label}</span>
        </div>

        <button type="button" onClick={() => onSelect(study)} className="mt-4 text-left">
          <h3 className="line-clamp-2 text-lg font-bold text-[#19304a]" title={study.tipoEstudio}>{study.tipoEstudio}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <UserIcon className="size-4 text-[#15919a]" aria-hidden="true" />
            {getFullName(study.integrante)}
          </p>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded-lg bg-slate-50 p-2 text-slate-600">
            <CalendarDaysIcon className="mr-1 inline size-4 text-[#15919a]" aria-hidden="true" />{formatDate(study.fechaEstudio)}
          </span>
          <span className="rounded-lg bg-slate-50 p-2 text-slate-600">{getCategoryLabel(study.categoria)}</span>
        </div>
        <p className="mt-3 truncate text-xs text-slate-500">
          {study.laboratorio || 'Laboratorio sin especificar'} · {formatCurrency(study.costo)}
        </p>

        <div className="card-actions mt-4 flex-wrap gap-2 border-t border-slate-100 pt-4">
          {pending && (
            <button type="button" onClick={() => onResult(study)} className="btn btn-outline btn-sm flex-1 transition-all duration-200 active:scale-95">
              <ClipboardDocumentCheckIcon className="size-4" /> Cargar resultado
            </button>
          )}
          <button type="button" onClick={() => onEdit(study)} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Editar">
            <PencilSquareIcon className="size-4" />
          </button>
          {pending && (
            <button type="button" onClick={() => onCancel(study)} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cancelar estudio">
              <NoSymbolIcon className="size-4" />
            </button>
          )}
          <button type="button" onClick={() => onDelete(study)} className="btn btn-error btn-sm text-white transition-all duration-200 active:scale-95" aria-label="Eliminar">
            <TrashIcon className="size-4" />
          </button>
        </div>

        <button type="button" onClick={() => onSelect(study)} className="mt-3 flex items-center justify-end gap-1 text-xs font-bold text-[#126f7b]">
          Ver detalle <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}

export default EstudioCard;
