import { CalendarDaysIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function VaccineApplicationModal({
  open,
  vaccine,
  dose,
  memberName,
  submitting,
  editing,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="vaccine-application-title">
      <form onSubmit={onSubmit} className="modal-box max-w-md border border-slate-200 bg-white p-0 shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">{editing ? 'Actualización de vacunación' : 'Registro de vacunación'}</p>
              <h2 id="vaccine-application-title" className="mt-1 text-xl font-bold text-[#19304a]">{editing ? 'Editar aplicación' : 'Registrar aplicación'}</h2>
              <p className="mt-1 text-sm text-slate-500">{memberName}</p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar registro" disabled={submitting}>
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <div className="mb-4 grid gap-3 rounded-xl bg-[#f1faf8] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Vacuna</p>
              <p className="mt-1 font-bold text-[#19304a]">{vaccine?.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Dosis</p>
              <p className="mt-1 font-bold text-[#19304a]">{dose?.reinforcement ? `Dosis ${dose.number} - Refuerzo` : `Dosis ${dose.number}`}</p>
            </div>
          </div>

          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Fecha de aplicación</span>
            <span className="input input-bordered flex h-12 w-full items-center gap-2 bg-white">
              <CalendarDaysIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              <input type="date" name="fechaAplicacion" defaultValue={editing ? dose?.application?.fechaAplicacion : ''} max={getToday()} className="min-w-0 grow" required />
            </span>
          </label>

          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Lote</span>
            <input type="text" name="lote" defaultValue={editing ? dose?.application?.lote ?? '' : ''} className="input input-bordered h-12 w-full bg-white" placeholder="Ej. HEX-2091" required />
          </label>

          <label className="label mb-5 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Lugar de aplicación</span>
            <span className="input input-bordered flex h-12 w-full items-center gap-2 bg-white">
              <MapPinIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              <input type="text" name="lugarAplicacion" defaultValue={editing ? dose?.application?.lugarAplicacion ?? '' : ''} className="min-w-0 grow" placeholder="Ej. Centro de salud IMSS" required />
            </span>
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar aplicación'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar registro" onClick={onClose} disabled={submitting} />
    </div>
  );
}

export default VaccineApplicationModal;
