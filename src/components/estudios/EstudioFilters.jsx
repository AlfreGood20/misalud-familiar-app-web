import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { studyCategories, studyStatuses } from './estudioOptions';

function EstudioFilters({ filters, integrantes, onChange, onClear }) {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body p-5">
        <div className="mb-4 flex items-center gap-2 text-[#19304a]">
          <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
          <div>
            <h2 className="font-bold">Filtrar estudios</h2>
            <p className="text-xs font-normal text-slate-500">La búsqueda se actualiza mientras escribes.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="input input-bordered flex items-center gap-2 bg-white lg:col-span-2">
            <MagnifyingGlassIcon className="size-5 text-slate-400" aria-hidden="true" />
            <input name="busqueda" value={filters.busqueda} onChange={onChange} className="grow" placeholder="Nombre del estudio o laboratorio" />
          </label>
          <select name="integrante" value={filters.integrante} onChange={onChange} className="select select-bordered bg-white">
            <option value="">Todos los integrantes</option>
            {integrantes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <select name="categoria" value={filters.categoria} onChange={onChange} className="select select-bordered bg-white">
            <option value="">Todas las categorías</option>
            {studyCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <select name="estado" value={filters.estado} onChange={onChange} className="select select-bordered bg-white">
            <option value="">Todos los estados</option>
            {studyStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="label cursor-pointer justify-start gap-2 p-0">
            <input type="checkbox" name="pendientes" checked={filters.pendientes} onChange={onChange} className="checkbox checkbox-sm [--chkbg:#15919a] [--chkfg:white]" />
            <span className="label-text text-sm text-slate-600">Solo estudios pendientes</span>
          </label>
          <button type="button" onClick={onClear} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95">Limpiar</button>
        </div>
      </div>
    </form>
  );
}

export default EstudioFilters;
