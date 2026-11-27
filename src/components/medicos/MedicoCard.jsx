import {
  AtSymbolIcon, PhoneIcon, TrashIcon,
} from '@heroicons/react/24/outline';

function getInitials(medico) {
  return [medico.nombre, medico.apellidoPaterno]
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function MedicoCard({ medico, onDelete }) {
  const fullName = [medico.nombre, medico.apellidoPaterno, medico.apellidoMaterno].filter(Boolean).join(' ');
  const specialties = medico.especialidades ?? [];

  return (
    <article className="card border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d4f1eb] to-[#b9e3ee] text-base font-bold text-[#126f7b]" aria-hidden="true">
            {getInitials(medico)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#19304a]" title={`Dr. ${fullName}`}>Dr. {fullName}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {specialties.length === 0 ? (
                <span className="badge badge-ghost badge-sm">Sin especialidad</span>
              ) : specialties.map((specialty) => (
                <span key={specialty.id} className="badge badge-sm border-0 bg-[#e5f7f4] text-[#126f7b]">{specialty.nombre}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="flex items-center gap-2"><PhoneIcon className="size-4 shrink-0 text-[#15919a]" aria-hidden="true" />{medico.telefono || 'Sin teléfono'}</p>
          <p className="flex items-center gap-2 break-all"><AtSymbolIcon className="size-4 shrink-0 text-[#15919a]" aria-hidden="true" />{medico.correo || 'Sin correo'}</p>
        </div>

        <div className="card-actions items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex gap-2">
            {medico.telefono && (
              <a href={`tel:${medico.telefono}`} className="btn btn-outline btn-sm transition-all duration-200 active:scale-95" aria-label={`Llamar a ${fullName}`}>
                <PhoneIcon className="size-4" /> Llamar
              </a>
            )}
            {medico.correo && (
              <a href={`mailto:${medico.correo}`} className="btn btn-outline btn-sm transition-all duration-200 active:scale-95" aria-label={`Escribir a ${fullName}`}>
                <AtSymbolIcon className="size-4" /> Correo
              </a>
            )}
          </div>
          {onDelete && <button type="button" onClick={() => onDelete(medico)} className="btn btn-ghost btn-sm text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95" aria-label={`Eliminar a ${fullName}`}>
            <TrashIcon className="size-4" /> Eliminar
          </button>}
        </div>
      </div>
    </article>
  );
}

export default MedicoCard;
