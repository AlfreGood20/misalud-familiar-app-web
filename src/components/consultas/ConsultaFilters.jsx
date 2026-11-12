import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const statuses = ['PROGRAMADA', 'REALIZADA', 'CANCELADA'];

function CheckboxGroup({ label, name, options, selectedValues, onChange }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 p-3">
      <legend className="px-1 text-sm font-bold text-[#19304a]">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.id} className="label cursor-pointer justify-start gap-2 p-1">
            <input
              type="checkbox"
              name={name}
              value={option.id}
              checked={selectedValues === option.id}
              onChange={onChange}
              className="checkbox checkbox-sm [--chkbg:#15919a] [--chkfg:white]"
            />
            <span className="label-text text-sm text-slate-600">
              {option.label}
              {option.detail && <span className="block text-xs text-slate-400">{option.detail}</span>}
            </span>
          </label>
        ))}
        {options.length === 0 && <p className="p-1 text-xs text-slate-400">No hay opciones disponibles.</p>}
      </div>
    </fieldset>
  );
}

function ConsultaFilters({
  filters, integrantes, medicos, catalogsLoading, onChange, onCheckboxChange, onClear,
}) {
  return (
    <form className="card border border-slate-200 bg-white shadow-sm" onSubmit={(event) => event.preventDefault()}>
      <div className="card-body p-5">
        <div className="mb-4 flex items-center gap-2 text-[#19304a]">
          <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
          <div>
            <h2 className="font-bold">Filtrar consultas</h2>
            <p className="text-xs font-normal text-slate-500">Explora las consultas de la familia por paciente, médico o fecha.</p>
          </div>
        </div>
        <div className="grid gap-3">
          <label className="input input-bordered flex w-full items-center gap-2 bg-white">
            <MagnifyingGlassIcon className="size-5 text-slate-400" aria-hidden="true" />
            <input name="busqueda" value={filters.busqueda} onChange={onChange} className="grow" placeholder="Buscar por motivo o diagnóstico" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxGroup
            label="Integrantes"
            name="integrante"
            options={integrantes}
            selectedValues={filters.integrante}
            onChange={onCheckboxChange}
          />
          <CheckboxGroup
            label="Médicos"
            name="medico"
            options={medicos}
            selectedValues={filters.medico}
            onChange={onCheckboxChange}
          />
        </div>
        {catalogsLoading && <p className="mt-2 text-xs text-slate-500">Cargando integrantes y médicos...</p>}
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="form-control">
            <span className="mb-1 text-xs font-semibold text-slate-500">Desde</span>
            <input type="date" name="fechaDesde" value={filters.fechaDesde} onChange={onChange} className="input input-bordered bg-white" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-xs font-semibold text-slate-500">Hasta</span>
            <input type="date" name="fechaHasta" value={filters.fechaHasta} onChange={onChange} className="input input-bordered bg-white" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-xs font-semibold text-slate-500">Estado</span>
            <select name="estado" value={filters.estado} onChange={onChange} className="select select-bordered bg-white">
              <option value="">Todos los estados</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <div className="flex items-end lg:col-span-2 lg:justify-end">
            <button type="button" onClick={onClear} className="btn btn-ghost btn-sm">Limpiar filtros</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ConsultaFilters;
