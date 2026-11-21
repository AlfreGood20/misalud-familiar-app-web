import {
  AtSymbolIcon, PhoneIcon, TrashIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

function MedicoCard({ medico, onDelete }) {
  const fullName = [medico.nombre, medico.apellidoPaterno, medico.apellidoMaterno].filter(Boolean).join(' ');
  const specialties = medico.especialidades ?? [];

  return (
    <article className="card border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]">
            <UserCircleIcon className="size-8" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#19304a]">Dr. {fullName}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {specialties.length === 0 ? (
                <span className="badge badge-ghost badge-sm">Sin especialidad</span>
              ) : specialties.map((specialty) => (
                <span key={specialty.id} className="badge badge-sm border-0 bg-[#e5f7f4] text-[#126f7b]">{specialty.nombre}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2"><PhoneIcon className="size-4 shrink-0 text-[#15919a]" aria-hidden="true" />{medico.telefono || 'Sin teléfono'}</p>
          <p className="flex items-center gap-2 break-all"><AtSymbolIcon className="size-4 shrink-0 text-[#15919a]" aria-hidden="true" />{medico.correo || 'Sin correo'}</p>
        </div>

        <div className="card-actions justify-end border-t border-slate-100 pt-4">
          <button type="button" onClick={() => onDelete(medico)} className="btn btn-error btn-sm text-white transition-all duration-200 active:scale-95">
            <TrashIcon className="size-4" /> Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export default MedicoCard;
