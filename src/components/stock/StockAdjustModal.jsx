import { XMarkIcon } from '@heroicons/react/24/outline';
import { getUnitLabel } from './stockOptions';

// Ajuste rápido de cantidad (PATCH /stock/{id} con solo `cantidad`).
function StockAdjustModal({ stock, submitting, onClose, onSubmit }) {
  if (!stock) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="stock-adjust-title">
      <form onSubmit={onSubmit} className="modal-box max-w-sm border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Ajustar cantidad</p>
              <h2 id="stock-adjust-title" className="mt-1 text-lg font-bold text-[#19304a]">{stock.medicamento?.nombreComercial}</h2>
              <p className="mt-1 text-xs text-slate-500">
                Actual: {stock.cantidad} {getUnitLabel(stock.unidad)}. Con 0 el medicamento pasa a agotado.
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <label className="label mb-3 block p-0">
            <span className="label-text mb-1.5 block font-bold text-[#29425d]">Nueva cantidad</span>
            <input type="number" name="cantidad" min="0" step="1" defaultValue={stock.cantidad} className="input input-bordered w-full bg-white focus:outline-[#15919a]" required autoFocus />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar" onClick={onClose} />
    </div>
  );
}

export default StockAdjustModal;
