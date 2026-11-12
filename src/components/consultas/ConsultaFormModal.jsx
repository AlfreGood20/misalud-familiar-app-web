import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';

function toInputDate(value) {
  if (!value) return '';
  const normalizedValue = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2})(AM|PM)$/i);
  if (normalizedValue) {
    const [, date, rawHours, minutes, period] = normalizedValue;
    let hours = Number(rawHours);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return `${date}T${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getCurrentDateTime() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function ConsultaFormModal({
  open, integrantes, medicos, submitting, consulta, editing, onClose, onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="new-consultation-title">
      <form onSubmit={onSubmit} className="modal-box max-w-xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Agenda familiar</p>
              <h2 id="new-consultation-title" className="mt-1 text-xl font-bold text-[#19304a]">{editing ? 'Editar consulta' : 'Nueva consulta'}</h2>
              <p className="mt-1 text-xs text-slate-500">{editing ? 'Actualiza los datos de la consulta médica.' : 'Completa los datos para agendar una consulta médica.'}</p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar formulario">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Integrante</span>
            <select name="idIntegrante" className="select select-bordered w-full bg-white focus:outline-[#15919a]" required defaultValue={consulta?.paciente?.id ?? ''}>
              <option value="" disabled>Selecciona un integrante</option>
              {integrantes.map((integrante) => <option key={integrante.id} value={integrante.id}>{integrante.label}</option>)}
            </select>
          </label>

          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Médico <span className="font-normal text-slate-400">(opcional)</span></span>
            <select name="idMedico" className="select select-bordered w-full bg-white focus:outline-[#15919a]" defaultValue={consulta?.medico?.id ?? ''}>
              <option value="">Sin médico definido</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  {medico.label}{medico.detail ? ` - ${medico.detail}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Fecha y hora</span>
            <span className="input input-bordered flex items-center gap-2 bg-white focus-within:outline-[#15919a]">
              <CalendarDaysIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              <input type="datetime-local" name="fechaConsulta" min={getCurrentDateTime()} className="grow" defaultValue={toInputDate(consulta?.fechaConsulta)} required />
            </span>
          </label>

          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Motivo de consulta</span>
            <textarea name="motivo" defaultValue={consulta?.motivo ?? ''} className="textarea textarea-bordered min-h-20 w-full bg-white focus:outline-[#15919a]" placeholder="Describe el motivo de la consulta" required />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Guardar consulta'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onClose} />
    </div>
  );
}

export default ConsultaFormModal;
