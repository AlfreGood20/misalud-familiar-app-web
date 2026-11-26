import { useState } from 'react';
import { BeakerIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDate, studyCategories } from './estudioOptions';

const inputClass = 'input input-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:shadow-md focus:shadow-[#15919a]/10 focus:outline-[#15919a]';
const selectClass = 'select select-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';
const textareaClass = 'textarea textarea-bordered min-h-20 w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

function Label({ text, optional, children }) {
  return (
    <label className="label mb-2 block p-0">
      <span className="label-text mb-1.5 block font-bold text-[#29425d]">
        {text} {optional && <span className="font-normal text-slate-400">(opcional)</span>}
      </span>
      {children}
    </label>
  );
}

// Crear: pide integrante y datos del estudio. Editar: además permite capturar resultados,
// porque la API reemplaza todos los campos al actualizar.
function EstudioFormModal({
  open, integrantes, consultas, submitting, study, editing, defaultIntegrante, defaultConsulta, onIntegranteChange, onClose, onSubmit,
}) {
  const [integranteId, setIntegranteId] = useState(String(study?.integrante?.id ?? defaultIntegrante ?? ''));
  const [consultaId, setConsultaId] = useState(String(study?.consulta?.id ?? defaultConsulta ?? ''));
  if (!open) return null;

  const handleIntegrante = (event) => {
    setIntegranteId(event.target.value);
    setConsultaId('');
    onIntegranteChange(event.target.value);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="study-form-title">
      <form onSubmit={onSubmit} className="modal-box max-h-[92vh] max-w-2xl overflow-y-auto border border-slate-200 bg-white p-0 shadow-sm">
        <div className="card-body p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]"><BeakerIcon className="size-6" /></span>
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Laboratorio</p>
                <h2 id="study-form-title" className="text-xl font-bold text-[#19304a]">{editing ? 'Editar estudio' : 'Nuevo estudio'}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar formulario">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {!editing && (
            <Label text="Integrante">
              <select name="idIntegrante" className={selectClass} required value={integranteId} onChange={handleIntegrante}>
                <option value="" disabled>Selecciona un integrante</option>
                {integrantes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Label>
          )}

          <div className="grid gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label text="Nombre del estudio">
                <input name="tipoEstudio" defaultValue={study?.tipoEstudio ?? ''} maxLength={150} className={inputClass} placeholder="Ej. Biometría hemática completa" required />
              </Label>
            </div>
            <Label text="Categoría">
              <select name="categoria" defaultValue={study?.categoria ?? ''} className={selectClass} required>
                <option value="" disabled>Selecciona una categoría</option>
                {studyCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Label>
            <Label text="Fecha del estudio">
              <input type="date" name="fechaEstudio" defaultValue={study?.fechaEstudio ?? ''} className={inputClass} required />
            </Label>
            <Label text="Laboratorio" optional>
              <input name="laboratorio" defaultValue={study?.laboratorio ?? ''} maxLength={200} className={inputClass} placeholder="Nombre del laboratorio" />
            </Label>
            <Label text="Costo" optional>
              <input type="number" name="costo" min="0" step="0.01" defaultValue={study?.costo ?? ''} className={inputClass} placeholder="0.00" />
            </Label>
          </div>

          <Label text="Consulta relacionada" optional>
            <select name="idConsulta" value={consultaId} onChange={(event) => setConsultaId(event.target.value)} className={selectClass} disabled={!editing && !integranteId}>
              <option value="">Sin consulta relacionada</option>
              {consultas.map((consulta) => (
                <option key={consulta.id} value={consulta.id}>
                  {formatDate(consulta.fechaConsulta)} · {consulta.motivo}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Indicaciones" optional>
            <textarea name="indicaciones" defaultValue={study?.indicaciones ?? ''} maxLength={255} className={textareaClass} placeholder="Ej. Ayuno mínimo de 8 horas" />
          </Label>

          {editing && (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-[#19304a]">Resultados</h3>
              <p className="mb-3 text-xs text-slate-500">Al capturar un resultado, el estudio pasa a Realizado.</p>
              <Label text="Resultado" optional>
                <textarea name="resultado" defaultValue={study?.resultado ?? ''} className={textareaClass} />
              </Label>
              <Label text="Valores de referencia" optional>
                <textarea name="valoresReferencia" defaultValue={study?.valoresReferencia ?? ''} className={textareaClass} />
              </Label>
              <Label text="Observaciones" optional>
                <textarea name="observaciones" defaultValue={study?.observaciones ?? ''} className={textareaClass} />
              </Label>
              <Label text="Enlace al archivo" optional>
                <input type="url" name="archivoUrl" defaultValue={study?.archivoUrl ?? ''} maxLength={500} className={inputClass} placeholder="https://..." />
              </Label>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost transition-all duration-200 active:scale-95" disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar estudio'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar formulario" onClick={onClose} />
    </div>
  );
}

export default EstudioFormModal;
