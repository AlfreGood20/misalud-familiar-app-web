import { ArrowRightIcon, CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

function CaregiverCard({ caregiver, onToggleStatus, onDetails }) {
  const isActive = caregiver.estado === 'ACTIVO';
  const fullName = [caregiver.nombre, caregiver.apellidoPaterno, caregiver.apellidoMaterno].filter(Boolean).join(' ');

  return (
    <article className="card gap-0 border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <button type="button" onClick={() => onDetails(caregiver)} aria-label={`Ver detalles de ${fullName || 'cuidador'}`} className="card-body w-full cursor-pointer gap-4 p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#19304a]">{fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">{caregiver.correo}</p>
          </div>
          <span className={`badge ${isActive ? 'badge-success' : 'badge-ghost'}`}>
            {caregiver.estado}
          </span>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p><span className="font-semibold">Teléfono:</span> {caregiver.telefono || 'Sin teléfono'}</p>
          <p><span className="font-semibold">Rol:</span> {caregiver.rol}</p>
        </div>
        <span className="mt-1 flex items-center gap-1 text-sm font-bold text-[#126f7b]">
          Ver detalles <ArrowRightIcon className="size-4" aria-hidden="true" />
        </span>
      </button>
      <div className="px-5 pb-5">
        <button type="button" onClick={() => onToggleStatus(caregiver)} className="btn w-full transition-all duration-200 active:scale-95 btn-outline btn-sm">
          {isActive ? <NoSymbolIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
          {isActive ? 'Poner inactivo' : 'Activar'}
        </button>
      </div>
    </article>
  );
}

export default CaregiverCard;
