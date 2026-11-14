import { XMarkIcon } from '@heroicons/react/24/outline';

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function ConcludeConsultaModal({ open, submitting, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="conclude-consultation-title">
      <form onSubmit={onSubmit} className="modal-box max-w-xl border border-slate-200 bg-white p-0">
        <div className="card-body p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Cerrar consulta</p>
              <h2 id="conclude-consultation-title" className="mt-1 text-xl font-bold text-[#19304a]">Concluir consulta</h2>
              <p className="mt-1 text-xs text-slate-500">Ingresa los resultados y observaciones de la atención médica.</p>
            </div>
            <button type="button" onClick={onClose} className="btn transition-all duration-200 active:scale-95 btn-circle btn-ghost btn-sm" aria-label="Cerrar formulario">
              <XMarkIcon className="size-5" />
            </button>
          </div>
          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Diagnóstico</span>
            <textarea name="diagnostico" className="textarea textarea-bordered min-h-20 w-full bg-white focus:outline-[#15919a]" placeholder="Ej. Infección respiratoria, migraña o diagnóstico indicado por el médico" required />
          </label>
          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Notas</span>
            <textarea name="notas" className="textarea textarea-bordered min-h-20 w-full bg-white focus:outline-[#15919a]" placeholder="Agrega indicaciones, recomendaciones u observaciones importantes" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Costo</span>
              <input type="number" name="costo" min="0" step="0.01" className="input input-bordered w-full bg-white focus:outline-[#15919a]" placeholder="Ej. 500.00" required />
            </label>
            <label className="label block p-0">
              <span className="label-text mb-1.5 block font-bold text-[#29425d]">Próxima consulta</span>
              <input type="date" name="proximaConsulta" min={getTomorrowDate()} className="input input-bordered w-full bg-white focus:outline-[#15919a]" />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn transition-all duration-200 active:scale-95 btn-ghost" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn transition-all duration-200 active:scale-95 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : 'Concluir consulta'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onClose} />
    </div>
  );
}

export default ConcludeConsultaModal;
