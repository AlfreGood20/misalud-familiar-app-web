import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { stockStatuses } from './stockOptions';

function StockFilters({ filters, onChange, onClear }) {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body p-5">
        <div className="mb-4 flex items-center gap-2 text-[#19304a]">
          <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
          <div>
            <h2 className="font-bold">Filtrar stock</h2>
            <p className="text-xs font-normal text-slate-500">La búsqueda se actualiza mientras escribes.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="input input-bordered flex items-center gap-2 bg-white md:col-span-2">
            <MagnifyingGlassIcon className="size-5 text-slate-400" aria-hidden="true" />
            <input name="nombre" value={filters.nombre} onChange={onChange} className="grow" placeholder="Nombre comercial o sustancia activa" />
          </label>
          <select name="estado" value={filters.estado} onChange={onChange} className="select select-bordered bg-white">
            <option value="">Todos (sin desechados)</option>
            {stockStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="label cursor-pointer justify-start gap-2 p-0">
            <input type="checkbox" name="bajoMinimo" checked={filters.bajoMinimo} onChange={onChange} className="checkbox checkbox-sm [--chkbg:#15919a] [--chkfg:white]" />
            <span className="label-text text-sm text-slate-600">Solo con stock igual o menor al mínimo</span>
          </label>
          <button type="button" onClick={onClear} className="btn btn-ghost btn-sm">Limpiar</button>
        </div>
      </div>
    </form>
  );
}

export default StockFilters;
