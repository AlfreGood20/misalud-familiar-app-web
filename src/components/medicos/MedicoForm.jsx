import { AtSymbolIcon, CheckIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';

function MedicoForm({
  value, specialties, submitting, onChange, onToggleSpecialty, onSubmit, onCancel,
}) {
  const field = (name) => ({ name, value: value[name], onChange });

  return (
    <form onSubmit={onSubmit} className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#19304a]">Nuevo médico</h2>
            <p className="text-sm text-slate-500">Registra a un médico de confianza para tus consultas.</p>
          </div>
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95">Cancelar</button>
        </div>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Nombre" icon={<UserIcon />} required {...field('nombre')} />
          <Field label="Apellido paterno" required {...field('apellidoPaterno')} />
          <Field label="Apellido materno" required {...field('apellidoMaterno')} />
          <Field label="Teléfono" type="tel" icon={<PhoneIcon />} inputMode="numeric" maxLength="20" required {...field('telefono')} />
        </div>
        <Field label="Correo electrónico (opcional)" type="email" icon={<AtSymbolIcon />} {...field('correo')} />

        <fieldset className="mb-4">
          <legend className="label-text mb-1.5 block font-bold text-[#29425d]">Especialidades</legend>
          {specialties.length === 0 ? (
            <p className="text-sm text-slate-500">No hay especialidades disponibles.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => {
                const selected = value.especialidadesIds.includes(specialty.id);
                return (
                  <button
                    key={specialty.id}
                    type="button"
                    onClick={() => onToggleSpecialty(specialty.id)}
                    aria-pressed={selected}
                    className={`btn btn-sm rounded-full transition-all duration-200 active:scale-95 ${
                      selected
                        ? 'border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:bg-[#0b5d69]'
                        : 'btn-outline border-[#b8d8d7] text-[#126f7b] hover:border-[#126f7b] hover:bg-[#eaf8f5] hover:text-[#126f7b]'
                    }`}
                  >
                    {selected && <CheckIcon className="size-4" aria-hidden="true" />}
                    {specialty.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <button type="submit" disabled={submitting} className="btn w-full border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
          {submitting && <span className="loading loading-spinner loading-sm" />}
          {submitting ? 'Guardando...' : 'Guardar médico'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, icon, ...props }) {
  return (
    <label className="label mb-3 block p-0">
      <span className="label-text mb-1.5 block font-bold text-[#29425d]">{label}</span>
      <span className="input input-bordered flex items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:shadow-md focus-within:shadow-[#15919a]/10 focus-within:outline-[#15919a]">
        {icon && <span className="text-[#15919a] [&>svg]:size-5">{icon}</span>}
        <input className="grow" {...props} />
      </span>
    </label>
  );
}

export default MedicoForm;
