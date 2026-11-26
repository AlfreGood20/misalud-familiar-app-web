import { CalendarDaysIcon, UserGroupIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { bloodTypes, relationships } from './memberOptions';

const sexOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
];

function bloodLabel(type) {
  if (type === 'SIN_DEFINIR') return 'Sin definir';
  return type.replace('_POSITIVO', '+').replace('_NEGATIVO', '−');
}

function getMaxBirthDate() {
  // La API exige una fecha anterior a hoy.
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function SectionTitle({ children }) {
  return <p className="mb-2 mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{children}</p>;
}

function Field({ label, icon, suffix, optional, ...props }) {
  return (
    <label className="label mb-3 block p-0">
      <span className="label-text mb-1.5 block font-bold text-[#29425d]">
        {label} {optional && <span className="font-normal text-slate-400">(opcional)</span>}
      </span>
      <span className="input input-bordered flex items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:shadow-md focus-within:shadow-[#15919a]/10 focus-within:outline-[#15919a]">
        {icon && <span className="text-[#15919a] [&>svg]:size-5">{icon}</span>}
        <input className="grow" {...props} />
        {suffix && <span className="text-xs font-bold text-slate-400">{suffix}</span>}
      </span>
    </label>
  );
}

function Chip({ selected, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`btn btn-sm rounded-full transition-all duration-200 active:scale-95 ${
        selected
          ? 'border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:bg-[#0b5d69]'
          : 'btn-outline border-[#b8d8d7] text-[#126f7b] hover:border-[#126f7b] hover:bg-[#eaf8f5] hover:text-[#126f7b]'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function MemberForm({ value, editing, submitting, onChange, onSubmit, onCancel }) {
  const field = (name) => ({ name, value: value[name], onChange });
  const setValue = (name, newValue) => onChange({ target: { name, value: newValue } });

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="member-form-title">
      <form onSubmit={onSubmit} className="modal-box max-h-[92vh] max-w-2xl overflow-y-auto border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]"><UserGroupIcon className="size-6" /></span>
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Familia</p>
                <h2 id="member-form-title" className="text-xl font-bold text-[#19304a]">{editing ? 'Actualizar integrante' : 'Nuevo integrante'}</h2>
              </div>
            </div>
            <button type="button" onClick={onCancel} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar formulario"><XMarkIcon className="size-5" /></button>
          </div>

          <SectionTitle>Datos personales</SectionTitle>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Nombre" icon={<UserIcon />} required autoFocus {...field('nombre')} />
            <Field label="Apellido paterno" {...field('apellidoPaterno')} />
            <Field label="Apellido materno" optional {...field('apellidoMaterno')} />
            <Field label="Fecha de nacimiento" type="date" icon={<CalendarDaysIcon />} max={getMaxBirthDate()} required {...field('fechaNacimiento')} />
          </div>

          <fieldset className="mb-3">
            <legend className="label-text mb-1.5 block font-bold text-[#29425d]">Sexo</legend>
            <div className="flex gap-2">
              {sexOptions.map((option) => (
                <Chip key={option.value} selected={value.sexo === option.value} onClick={() => setValue('sexo', option.value)}>{option.label}</Chip>
              ))}
            </div>
            <input tabIndex={-1} aria-hidden="true" className="sr-only" value={value.sexo} onChange={() => {}} required />
          </fieldset>

          <SectionTitle>Datos de salud</SectionTitle>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Peso" type="number" min="0" step="0.01" suffix="kg" optional {...field('peso')} />
            <Field label="Estatura" type="number" min="0" step="0.01" suffix="cm" optional {...field('estatura')} />
          </div>
          <fieldset className="mb-3">
            <legend className="label-text mb-1.5 block font-bold text-[#29425d]">Tipo de sangre</legend>
            <div className="flex flex-wrap gap-2">
              {bloodTypes.map((type) => (
                <Chip key={type} selected={value.tipoSangre === type} onClick={() => setValue('tipoSangre', type)}>{bloodLabel(type)}</Chip>
              ))}
            </div>
          </fieldset>

          <SectionTitle>Parentesco</SectionTitle>
          <label className="label mb-4 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Relación con el titular</span>
            <select
              className="select select-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              disabled={submitting || (editing && value.parentesco === 'TITULAR')}
              required
              {...field('parentesco')}
            >
              <option value="">Selecciona una opción</option>
              {relationships.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          {editing && value.parentesco === 'TITULAR' && (
            <p className="-mt-2 mb-4 rounded-xl bg-[#fff3df] px-3 py-2 text-xs font-medium text-[#8c5c15]" role="status">
              No puedes cambiar el parentesco porque este integrante es titular.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn btn-ghost transition-all duration-200 active:scale-95" disabled={submitting}>Cancelar</button>
            <button type="submit" disabled={submitting} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear integrante'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onCancel} />
    </div>
  );
}

export default MemberForm;
