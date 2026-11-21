import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function MedicoFilters({ filters, specialties, onChange, onClear }) {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body p-5">
        <div className="mb-4 flex items-center gap-2 text-[#19304a]">
          <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
          <div>
            <h2 className="font-bold">Filtrar médicos</h2>
            <p className="text-xs font-normal text-slate-500">La búsqueda se actualiza mientras escribes.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="input input-bordered flex items-center gap-2 bg-white md:col-span-2">
            <MagnifyingGlassIcon className="size-5 text-slate-400" aria-hidden="true" />
            <input name="busqueda" value={filters.busqueda} onChange={onChange} className="grow" placeholder="Nombre, teléfono o correo" />
          </label>
          <select name="especialidad" value={filters.especialidad} onChange={onChange} className="select select-bordered bg-white">
            <option value="">Todas las especialidades</option>
            {specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.nombre}</option>)}
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClear} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95">Limpiar</button>
        </div>
      </div>
    </form>
  );
}

export default MedicoFilters;
