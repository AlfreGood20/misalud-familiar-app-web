import { XMarkIcon } from '@heroicons/react/24/outline';
import { getTodayDate, stockUnits } from './stockOptions';

// Crear: pide medicamento, cantidad, mínimo y caducidad (la unidad la define la API).
// Editar: pide cantidad, mínimo, unidad y caducidad.
function StockFormModal({
  open, medications, submitting, stock, editing, onClose, onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="stock-form-title">
      <form onSubmit={onSubmit} className="modal-box max-w-xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Botiquín familiar</p>
              <h2 id="stock-form-title" className="mt-1 text-xl font-bold text-[#19304a]">
                {editing ? 'Editar stock' : 'Añadir al stock'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {editing ? `Actualiza los datos de ${stock?.medicamento?.nombreComercial}.` : 'Registra un medicamento que tienes disponible.'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar formulario">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {!editing && (
            <label className="label mb-2 block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Medicamento</span>
              <select name="idMedicamento" className="select select-bordered w-full bg-white focus:outline-[#15919a]" required defaultValue="">
                <option value="" disabled>Selecciona un medicamento</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.nombreComercial} · {medication.sustanciaActiva} {medication.concentracion}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="label mb-2 block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Cantidad</span>
              <input type="number" name="cantidad" min={editing ? 0 : 1} step="1" defaultValue={stock?.cantidad ?? ''} className="input input-bordered w-full bg-white focus:outline-[#15919a]" required />
            </label>
            <label className="label mb-2 block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Cantidad mínima</span>
              <input type="number" name="cantidadMinima" min="0" step="1" defaultValue={stock?.cantidadMinima ?? 0} className="input input-bordered w-full bg-white focus:outline-[#15919a]" required />
            </label>
          </div>

          {editing && (
            <label className="label mb-2 block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Unidad</span>
              <select name="unidad" defaultValue={stock?.unidad} className="select select-bordered w-full bg-white focus:outline-[#15919a]" required>
                {stockUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
              </select>
            </label>
          )}

          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Fecha de caducidad</span>
            <input type="date" name="fechaCaducidad" min={editing ? undefined : getTodayDate()} defaultValue={stock?.fechaCaducidad ?? ''} className="input input-bordered w-full bg-white focus:outline-[#15919a]" required />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Añadir al stock'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onClose} />
    </div>
  );
}

export default StockFormModal;
