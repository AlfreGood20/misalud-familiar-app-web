import { CalendarDaysIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const statusStyles = {
  PROGRAMADA: {
    badge: 'bg-[#e5f7f4] text-[#126f7b]',
    border: 'border-[#8dd5cd]',
    dot: 'bg-[#15919a]',
  },
  REALIZADA: {
    badge: 'bg-[#e8f1ff] text-[#2e68a5]',
    border: 'border-[#a9c8ef]',
    dot: 'bg-[#4b8ed8]',
  },
  CANCELADA: {
    badge: 'bg-[#fff0f0] text-[#b54b52]',
    border: 'border-[#efb5b5]',
    dot: 'bg-[#d6676e]',
  },
};

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function ConsultaCard({ consulta, onSelect }) {
  const styles = statusStyles[consulta.estado] ?? statusStyles.PROGRAMADA;

  return (
    <button type="button" onClick={() => onSelect(consulta)} className={`card h-full min-h-72 w-full cursor-pointer border bg-white text-left shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:shadow-md ${styles.border}`}>
      <div className="card-body flex h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className={`size-2.5 rounded-full ${styles.dot}`} aria-hidden="true" />
            Consulta médica
          </div>
          <span className={`badge border-0 text-xs font-bold ${styles.badge}`}>{consulta.estado}</span>
        </div>
        <h2 className="mt-4 line-clamp-2 min-h-14 text-lg font-bold text-[#19304a]" title={consulta.motivo}>{consulta.motivo}</h2>
        <div className="mt-3 min-h-14 space-y-2 text-sm text-slate-600">
          <p><UserIcon className="mr-2 inline size-4 text-[#15919a]" aria-hidden="true" />Paciente: <strong>{consulta.nombrePaciente}</strong></p>
          <p><UserIcon className="mr-2 inline size-4 text-[#15919a]" aria-hidden="true" />Médico: <strong>{consulta.nombreMedico || 'Sin definir'}</strong></p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2.5 py-2"><CalendarDaysIcon className="mr-1 inline size-4 text-[#15919a]" aria-hidden="true" />{formatDate(consulta.fechaConsulta)}</span>
          <span className="rounded-lg bg-slate-50 px-2.5 py-2"><ClockIcon className="mr-1 inline size-4 text-[#15919a]" aria-hidden="true" />{formatTime(consulta.fechaConsulta)}</span>
        </div>
      </div>
    </button>
  );
}

export default ConsultaCard;
