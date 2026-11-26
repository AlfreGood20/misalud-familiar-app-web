import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ForwardIcon,
  MoonIcon,
  ArrowUturnLeftIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { dayPeriods, formatDayLabel, formatTime, isOverdue, toDateInput, tomaStyles } from './recetaOptions';

const periodIcons = {
  madrugada: MoonIcon,
  manana: SunIcon,
  tarde: SunIcon,
  noche: MoonIcon,
};

function TomaItem({ toma, highlighted, updating, onChange }) {
  const overdue = isOverdue(toma);
  const style = tomaStyles[toma.estado];

  return (
    <li className="relative pl-7">
      <span className={`absolute left-0 top-5 size-3 rounded-full ring-4 ring-white ${overdue ? 'bg-[#c84b55]' : style.dot}`} aria-hidden="true" />
      <div
        className={`rounded-2xl border p-3.5 transition duration-300 starting:translate-y-2 starting:opacity-0 hover:border-[#8dd5cd] hover:shadow-sm ${
          highlighted ? 'border-[#15919a] bg-[#f1faf8] shadow-sm' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#126f7b]">
              <ClockIcon className="size-4" aria-hidden="true" /> {formatTime(toma.fechaHoraProgramada)}
              {highlighted && <span className="rounded-full bg-[#15919a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Siguiente</span>}
            </p>
            <p className="mt-1 truncate font-bold text-[#19304a]">
              {toma.nombreMedicamento} {toma.concentracion && <span className="text-sm font-medium text-slate-500">{toma.concentracion}</span>}
            </p>
            <p className="text-xs text-slate-500">{toma.dosis} · {toma.nombreIntegrante}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${overdue ? 'bg-[#fff0f0] text-[#b54b52]' : style.badge}`}>
            {overdue ? 'Retrasada' : style.label}
          </span>
        </div>

        {toma.estado === 'TOMADA' && toma.fechaHoraReal && (
          <p className="mt-2 text-xs text-slate-500">Registrada a las {formatTime(toma.fechaHoraReal)}</p>
        )}

        {toma.estado !== 'CANCELADA' && (
          <div className="mt-3 flex flex-wrap gap-2">
            {toma.estado === 'PENDIENTE' ? (
              <>
                <button type="button" disabled={updating} onClick={() => onChange(toma, 'TOMADA')} className="btn btn-sm border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
                  {updating ? <span className="loading loading-spinner loading-xs" /> : <CheckIcon className="size-4" />} Tomada
                </button>
                <button type="button" disabled={updating} onClick={() => onChange(toma, 'OMITIDA')} className="btn btn-ghost btn-sm text-slate-600 transition-all duration-200 active:scale-95">
                  <ForwardIcon className="size-4" /> Omitir
                </button>
              </>
            ) : (
              <button type="button" disabled={updating} onClick={() => onChange(toma, 'PENDIENTE')} className="btn btn-ghost btn-sm text-slate-600 transition-all duration-200 active:scale-95">
                <ArrowUturnLeftIcon className="size-4" /> Deshacer
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function AgendaTomas({ day, onDayChange, tomas, loading, updatingId, onChangeEstado }) {
  const active = tomas.filter((toma) => toma.estado !== 'CANCELADA');
  const taken = active.filter((toma) => toma.estado === 'TOMADA').length;
  const percent = active.length === 0 ? 0 : Math.round((taken / active.length) * 100);
  const next = active.find((toma) => toma.estado === 'PENDIENTE' && !isOverdue(toma));
  const today = toDateInput(new Date());

  const grouped = dayPeriods
    .map((period) => ({
      ...period,
      items: tomas.filter((toma) => {
        const hour = new Date(toma.fechaHoraProgramada).getHours();
        return hour >= period.range[0] && hour < period.range[1];
      }),
    }));

  return (
    <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Agenda de tomas">
      <div className="card-body gap-0 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Agenda de tomas</p>
            <h2 className="mt-1 text-xl font-bold capitalize text-[#19304a]">{formatDayLabel(day)}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onDayChange(-1)} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Día anterior"><ChevronLeftIcon className="size-5" /></button>
            <button type="button" onClick={() => onDayChange(0)} disabled={day === today} className="btn btn-outline btn-sm border-[#15919a]/30 text-[#126f7b] transition-all duration-200 active:scale-95">Hoy</button>
            <button type="button" onClick={() => onDayChange(1)} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Día siguiente"><ChevronRightIcon className="size-5" /></button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#f1faf8] p-4">
          <div className="radial-progress shrink-0 text-[#15919a]" style={{ '--value': percent, '--size': '4.5rem', '--thickness': '6px' }} role="progressbar" aria-valuenow={percent} aria-label="Avance del día">
            <span className="text-sm font-bold text-[#19304a]">{percent}%</span>
          </div>
          <div>
            <p className="font-bold text-[#19304a]">{taken} de {active.length} {active.length === 1 ? 'toma' : 'tomas'} registradas</p>
            <p className="text-sm text-slate-500">
              {active.length === 0
                ? 'No hay tomas programadas para este día.'
                : next ? `Próxima: ${next.nombreMedicamento} a las ${formatTime(next.fechaHoraProgramada)}` : 'No quedan tomas por venir en este día.'}
            </p>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
          ) : (
            <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {grouped.map((period) => {
                const PeriodIcon = periodIcons[period.key];
                return (
                  <section key={period.key} className="min-w-0" aria-label={period.label}>
                    <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      <PeriodIcon className="size-4 text-[#15919a]" aria-hidden="true" />
                      {period.label}
                    </h3>
                    {period.items.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">Sin tomas programadas</p>
                    ) : (
                      <ul className="relative space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
                        {period.items.map((toma) => (
                          <TomaItem
                            key={toma.id}
                            toma={toma}
                            highlighted={next?.id === toma.id}
                            updating={updatingId === toma.id}
                            onChange={onChangeEstado}
                          />
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AgendaTomas;
