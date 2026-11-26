import {
  CalendarDaysIcon,
  BeakerIcon,
  HeartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function MemberDetails({ member, onClose }) {
  if (!member) return null;

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box max-w-lg">
        <button type="button" onClick={onClose} className="btn transition-all duration-200 active:scale-95 btn-circle btn-ghost btn-sm absolute right-3 top-3">
          <XMarkIcon className="size-5" aria-label="Cerrar detalles" />
        </button>
        <div className="mb-6 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]">
            <HeartIcon className="size-9" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#15919a]">{member.parentesco}</p>
            <h2 className="text-2xl font-bold text-[#19304a]">{member.nombre}</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={<CalendarDaysIcon />} label="Fecha de nacimiento" value={member.fechaNacimiento} />
          <Detail icon={<HeartIcon />} label="Edad" value={member.edad || 'Sin información'} />
          <Detail icon={<BeakerIcon />} label="Tipo de sangre" value={member.tipoSangre || 'Sin información'} />
          <Detail icon={<HeartIcon />} label="Sexo" value={member.sexo || 'Sin información'} />
          <Detail icon={<BeakerIcon />} label="Peso" value={member.peso != null ? `${member.peso} kg` : 'Sin información'} />
          <Detail icon={<HeartIcon />} label="Estatura" value={member.estatura != null ? `${member.estatura} cm` : 'Sin información'} />
          <Detail icon={<CalendarDaysIcon />} label="Registro" value={member.fechaRegistro || 'Sin información'} />
        </div>
        <div className="modal-action">
          <button type="button" className="btn transition-all duration-200 active:scale-95 btn-outline" onClick={onClose}>Cerrar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-[#15919a]">
        <span className="[&>svg]:size-4">{icon}</span>
        <span className="text-xs font-bold">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#19304a]">{value}</p>
    </div>
  );
}

export default MemberDetails;
