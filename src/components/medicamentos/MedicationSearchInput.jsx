import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getMedicamentos } from '../../services/medicationService';

function MedicationSearchInput({
  inputId,
  name,
  label = 'Medicamento',
  placeholder = 'Buscar por nombre del medicamento',
  selectedMedication,
  onSelect,
}) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef(null);
  const requestId = useRef(0);

  useEffect(() => () => {
    clearTimeout(debounceTimer.current);
    requestId.current += 1;
  }, []);

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    clearTimeout(debounceTimer.current);
    onSelect(null);
    setQuery(searchTerm);
    setOpen(true);
    setError(null);

    if (searchTerm.trim().length < 2) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await getMedicamentos({
          nombreComercial: searchTerm.trim(),
          activo: true,
          page: 0,
          size: 10,
        });
        if (requestId.current === currentRequestId) {
          if (!Array.isArray(response.content)) {
            throw new Error('La respuesta de medicamentos no tiene el formato esperado.');
          }
          setMatches(response.content);
        }
      } catch (searchError) {
        if (requestId.current === currentRequestId) {
          setMatches([]);
          setError('No se pudieron buscar medicamentos.');
          console.error('Error al buscar medicamentos:', searchError);
        }
      } finally {
        if (requestId.current === currentRequestId) setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (medication) => {
    setQuery('');
    setMatches([]);
    setOpen(false);
    onSelect(medication);
  };

  const selectedLabel = selectedMedication
    ? `${selectedMedication.nombreComercial}${selectedMedication.concentracion ? ` · ${selectedMedication.concentracion}` : ''}`
    : query;

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={selectedMedication?.id ?? ''} />}
      <label htmlFor={inputId} className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </label>
      <div className="input input-bordered flex h-11 w-full items-center gap-2 bg-white focus-within:outline-[#15919a]">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-[#15919a]" aria-hidden="true" />
        <input
          id={inputId}
          value={selectedLabel}
          onChange={handleSearchChange}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => setOpen(false)}
          className="min-w-0 grow"
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${inputId}-results`}
          required
        />
        {loading && <span className="loading loading-spinner loading-xs text-[#15919a]" aria-label="Buscando" />}
      </div>

      {open && query.trim().length >= 2 && (
        <ul
          id={`${inputId}-results`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {error ? (
            <li className="p-3 text-sm text-error" role="alert">{error}</li>
          ) : loading && matches.length === 0 ? (
            <li className="p-3 text-sm text-slate-500">Buscando medicamentos…</li>
          ) : matches.length === 0 ? (
            <li className="p-3 text-sm text-slate-500">No se encontraron medicamentos activos con ese nombre.</li>
          ) : (
            matches.map((medication) => (
              <li key={medication.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedMedication?.id === medication.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(medication)}
                  className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[#f1faf8]"
                >
                  <span className="block text-sm font-semibold text-[#19304a]">{medication.nombreComercial}</span>
                  {(medication.concentracion || medication.sustanciaActiva) && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {[medication.concentracion, medication.sustanciaActiva].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default MedicationSearchInput;
