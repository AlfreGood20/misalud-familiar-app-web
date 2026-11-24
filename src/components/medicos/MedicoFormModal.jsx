import { AtSymbolIcon, CheckIcon, IdentificationIcon, PhoneIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Field({ label, icon, hint, ...props }) {
  return (
    <label className="label mb-3 block p-0">
      <span className="label-text mb-1.5 block font-bold text-[#29425d]">{label}</span>
      <span className="input input-bordered flex items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:shadow-md focus-within:shadow-[#15919a]/10 focus-within:outline-[#15919a]">
        {icon && <span className="text-[#15919a] [&>svg]:size-5">{icon}</span>}
        <input className="grow" {...props} />
      </span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function MedicoFormModal({
  open, value, specialties, submitting, onChange, onToggleSpecialty, onSubmit, onCancel,
}) {
  if (!open) return null;

  const field = (name) => ({ name, value: value[name], onChange });

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="medico-form-title">
      <form onSubmit={onSubmit} className="modal-box max-h-[92vh] max-w-2xl overflow-y-auto border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]"><IdentificationIcon className="size-6" /></span>
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Directorio médico</p>
                <h2 id="medico-form-title" className="text-xl font-bold text-[#19304a]">Nuevo médico</h2>
              </div>
            </div>
            <button type="button" onClick={onCancel} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar formulario">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Datos personales</p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Nombre" icon={<UserIcon />} required autoFocus {...field('nombre')} />
            <Field label="Apellido paterno" required {...field('apellidoPaterno')} />
            <Field label="Apellido materno" required {...field('apellidoMaterno')} />
            <Field label="Teléfono" type="tel" icon={<PhoneIcon />} inputMode="numeric" maxLength="20" minLength="10" hint="Solo números, mínimo 10 dígitos." required {...field('telefono')} />
          </div>
          <Field label="Correo electrónico (opcional)" type="email" icon={<AtSymbolIcon />} {...field('correo')} />

          <fieldset className="mb-4">
            <legend className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Especialidades</legend>
            <p className="mb-2 text-xs text-slate-500">Elige una o varias. {value.especialidadesIds.length > 0 && `${value.especialidadesIds.length} seleccionada${value.especialidadesIds.length > 1 ? 's' : ''}.`}</p>
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

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn btn-ghost transition-all duration-200 active:scale-95" disabled={submitting}>Cancelar</button>
            <button type="submit" disabled={submitting} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : 'Guardar médico'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onCancel} />
    </div>
  );
}

export default MedicoFormModal;
