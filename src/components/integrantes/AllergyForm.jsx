import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const allergyTypes = ['MEDICAMENTO', 'ALIMENTO', 'AMBIENTAL', 'CONTACTO', 'INSECTO', 'OTRA', 'SIN_DEFINIR'];
const severities = [
  { value: 'LEVE', label: 'Leve', active: 'border-0 bg-[#2f9e78] text-white shadow-md shadow-[#2f9e78]/20 hover:bg-[#278a68]' },
  { value: 'MODERADA', label: 'Moderada', active: 'border-0 bg-[#d98b1f] text-white shadow-md shadow-[#d98b1f]/20 hover:bg-[#bd7419]' },
  { value: 'GRAVE', label: 'Grave', active: 'border-0 bg-[#c84b55] text-white shadow-md shadow-[#c84b55]/20 hover:bg-[#b03e47]' },
];

const selectClass = 'select select-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

function AllergyForm({ allergies, allergyType, allergiesLoading, submitting, onTypeChange, onSubmit }) {
  const [data, setData] = useState({
    idAlergia: '',
    severidad: 'LEVE',
    observaciones: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
  };

  const handleTypeChange = (event) => {
    setData((current) => ({ ...current, idAlergia: '' }));
    onTypeChange(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      idAlergia: Number(data.idAlergia),
      severidad: data.severidad,
      observaciones: data.observaciones,
    });
    setData({ idAlergia: '', severidad: 'LEVE', observaciones: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-red-100 bg-red-50/50 p-4 transition duration-300 hover:border-red-200">
      <h4 className="font-bold text-[#19304a]">Agregar alergia</h4>
      <p className="text-xs text-slate-500">Elige el tipo, la alergia y qué tan fuerte es la reacción.</p>

      <div className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="label block p-0">
            <span className="label-text mb-1 block text-xs font-bold text-[#29425d]">Tipo</span>
            <select value={allergyType} onChange={handleTypeChange} className={selectClass} required>
              <option value="">Selecciona un tipo</option>
              {allergyTypes.map((type) => (
                <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="label block p-0">
            <span className="label-text mb-1 block text-xs font-bold text-[#29425d]">Alergia</span>
            <select
              name="idAlergia"
              value={data.idAlergia}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={!allergyType || allergiesLoading}
            >
              <option value="">
                {allergiesLoading ? 'Cargando alergias...' : allergyType ? 'Selecciona una alergia' : 'Primero selecciona un tipo'}
              </option>
              {allergies.map((allergy) => (
                <option key={allergy.id} value={allergy.id}>{allergy.nombre}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="label-text mb-1 block text-xs font-bold text-[#29425d]">Severidad</legend>
          <div className="flex flex-wrap gap-2">
            {severities.map((severity) => {
              const selected = data.severidad === severity.value;
              return (
                <button
                  key={severity.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setData((current) => ({ ...current, severidad: severity.value }))}
                  className={`btn btn-sm rounded-full transition-all duration-200 active:scale-95 ${
                    selected ? severity.active : 'btn-outline border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-white hover:text-slate-700'
                  }`}
                >
                  {severity.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="label block p-0">
          <span className="label-text mb-1 block text-xs font-bold text-[#29425d]">Observaciones <span className="font-normal text-slate-400">(opcional)</span></span>
          <textarea
            name="observaciones"
            value={data.observaciones}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]"
            placeholder="Ej. Provoca ronchas en la piel"
            rows="2"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || allergiesLoading || allergies.length === 0}
          className="btn btn-sm w-full border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95"
        >
          {submitting ? <span className="loading loading-spinner loading-xs" /> : <PlusIcon className="size-4" />}
          Guardar alergia
        </button>
      </div>
    </form>
  );
}

export default AllergyForm;
