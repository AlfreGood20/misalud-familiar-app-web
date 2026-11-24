import { ClipboardDocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const textareaClass = 'textarea textarea-bordered min-h-24 w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

// Carga de resultado (PATCH /estudios-laboratorio/{id}/resultado).
function EstudioResultModal({ study, submitting, onClose, onSubmit }) {
  if (!study) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="study-result-title">
      <form onSubmit={onSubmit} className="modal-box max-h-[92vh] max-w-xl overflow-y-auto border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]"><ClipboardDocumentCheckIcon className="size-6" /></span>
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Cargar resultado</p>
                <h2 id="study-result-title" className="text-lg font-bold text-[#19304a]">{study.tipoEstudio}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Resultado</span>
            <textarea name="resultado" className={textareaClass} placeholder="Ej. Hemoglobina: 14.2 g/dL" required autoFocus />
          </label>
          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Valores de referencia <span className="font-normal text-slate-400">(opcional)</span></span>
            <textarea name="valoresReferencia" className={textareaClass} placeholder="Ej. Hemoglobina: 13.5 - 17.5 g/dL" />
          </label>
          <label className="label mb-2 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Observaciones <span className="font-normal text-slate-400">(opcional)</span></span>
            <textarea name="observaciones" className={textareaClass} />
          </label>
          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Enlace al archivo <span className="font-normal text-slate-400">(opcional)</span></span>
            <input type="url" name="archivoUrl" maxLength={500} className="input input-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]" placeholder="https://..." />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost transition-all duration-200 active:scale-95" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : 'Guardar resultado'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar" onClick={onClose} />
    </div>
  );
}

export default EstudioResultModal;
