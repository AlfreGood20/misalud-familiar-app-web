import { useEffect, useState } from 'react';
import {
  CheckBadgeIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getTomasPorReceta } from '../../services/recetaService';
import { formatDateTime, formatShortDate, frequencyLabel, fullName, tomaStyles } from './recetaOptions';

function RecetaCard({ receta, onFinalizar, onDelete }) {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const detalles = receta.detalles ?? [];
  const total = detalles.reduce((sum, item) => sum + item.totalTomas, 0);
  const done = detalles.reduce((sum, item) => sum + item.tomasCompletadas, 0);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoadingSchedule(true);
    getTomasPorReceta(receta.id)
      .then((result) => { if (!cancelled) setSchedule(result ?? []); })
      .catch((error) => {
        if (!cancelled) {
          toast.error('No se pudo cargar el cronograma.');
          console.error('Error al cargar cronograma:', error);
        }
      })
      .finally(() => { if (!cancelled) setLoadingSchedule(false); });
    return () => { cancelled = true; };
  }, [open, receta.id, done]);

  return (
    <article className="card border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-0 p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${receta.activa ? 'bg-[#e5f7f4] text-[#126f7b]' : 'bg-slate-100 text-slate-400'}`}>
            <DocumentTextIcon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-bold text-[#19304a]">{fullName(receta.integrante) || 'Integrante'}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${receta.activa ? 'bg-[#e5f7f4] text-[#126f7b]' : 'bg-slate-100 text-slate-500'}`}>
                {receta.activa ? 'Activa' : 'Finalizada'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Emitida el {formatShortDate(receta.fechaEmision)} · {detalles.length} {detalles.length === 1 ? 'medicamento' : 'medicamentos'}</p>
          </div>
          <button type="button" onClick={() => setOpen((current) => !current)} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label={open ? 'Ocultar detalle' : 'Ver detalle'} aria-expanded={open}>
            <ChevronDownIcon className={`size-5 text-[#15919a] transition duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>Avance del tratamiento</span><span>{done} / {total} tomas</span></div>
          <progress className="progress h-2 w-full text-[#15919a]" value={done} max={total || 1} aria-label={`Avance ${percent}%`} />
        </div>

        {open && (
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 transition-all duration-300 starting:-translate-y-1 starting:opacity-0">
            {receta.indicaciones && (
              <p className="rounded-xl bg-[#f1faf8] p-3 text-sm text-[#29425d]"><span className="font-bold">Indicaciones: </span>{receta.indicaciones}</p>
            )}

            <ul className="space-y-2">
              {detalles.map((detalle) => (
                <li key={detalle.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-[#19304a]">
                    {detalle.medicamento?.nombreComercial} <span className="text-sm font-medium text-slate-500">{detalle.medicamento?.concentracion}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-semibold">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[#126f7b] ring-1 ring-slate-200">{detalle.dosis}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[#126f7b] ring-1 ring-slate-200">{frequencyLabel(detalle.frecuenciaHoras)}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[#126f7b] ring-1 ring-slate-200">{detalle.duracionDias ? `${detalle.duracionDias} días` : 'Sin fecha de fin'}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200">{detalle.tomasCompletadas}/{detalle.totalTomas} tomas</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Inicio: {formatDateTime(detalle.fechaHoraInicio)}</p>
                </li>
              ))}
            </ul>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Cronograma</h4>
              {loadingSchedule ? (
                <div className="flex justify-center py-4"><span className="loading loading-spinner text-[#15919a]" /></div>
              ) : schedule.length === 0 ? (
                <p className="text-sm text-slate-500">Esta receta no tiene tomas programadas.</p>
              ) : (
                <ul className="grid max-h-56 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                  {schedule.map((toma) => (
                    <li key={toma.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs">
                      <span className="min-w-0 truncate text-slate-600"><span className="font-bold text-[#29425d]">{toma.nombreMedicamento}</span> · {formatDateTime(toma.fechaHoraProgramada)}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tomaStyles[toma.estado].badge}`}>{tomaStyles[toma.estado].label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {receta.activa ? (
            <button type="button" onClick={() => onFinalizar(receta)} className="btn btn-ghost btn-sm text-[#bd7419] transition-all duration-200 hover:bg-[#fff3df] active:scale-95">
              <StopCircleIcon className="size-4" /> Finalizar tratamiento
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400"><CheckBadgeIcon className="size-4" /> Tratamiento cerrado</span>
          )}
          {onDelete && <button type="button" onClick={() => onDelete(receta)} className="btn btn-ghost btn-sm text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95">
            <TrashIcon className="size-4" /> Eliminar
          </button>}
        </div>
      </div>
    </article>
  );
}

export default RecetaCard;
