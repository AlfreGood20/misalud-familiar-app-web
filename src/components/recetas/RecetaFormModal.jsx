import { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { fullName, toApiDateTime, toDateInput } from './recetaOptions';
import MedicationSearchInput from '../medicamentos/MedicationSearchInput';

const frequencyOptions = [4, 6, 8, 12, 24];
const fieldClass = 'input input-bordered h-11 w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

function defaultStart() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return `${toDateInput(date)}T${String(date.getHours()).padStart(2, '0')}:00`;
}

let nextKey = 1;
const newDetalle = () => ({
  key: nextKey++,
  idMedicamento: '',
  medicamentoSeleccionado: null,
  dosis: '',
  frecuenciaHoras: 8,
  duracionDias: '',
  fechaHoraInicio: defaultStart(),
});

function RecetaFormModal({ integrantes, defaultIntegrante, submitting, onClose, onSubmit }) {
  const [idIntegrante, setIdIntegrante] = useState(defaultIntegrante || '');
  const [fechaEmision, setFechaEmision] = useState(toDateInput(new Date()));
  const [indicaciones, setIndicaciones] = useState('');
  const [detalles, setDetalles] = useState(() => [newDetalle()]);

  const updateDetalle = (key, changes) => setDetalles((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!idIntegrante) return toast.error('Selecciona al integrante de la receta.');
    if (detalles.some((item) => !item.idMedicamento || !item.dosis.trim() || !item.fechaHoraInicio)) {
      return toast.error('Completa medicamento, dosis e inicio de cada medicamento.');
    }
    if (detalles.some((item) => Number(item.frecuenciaHoras) < 1 || (item.duracionDias !== '' && Number(item.duracionDias) < 1))) {
      return toast.error('La frecuencia y la duración deben ser mayores a 0.');
    }

    return onSubmit({
      idIntegrante: Number(idIntegrante),
      fechaEmision,
      indicaciones: indicaciones.trim() || null,
      detalles: detalles.map((item) => ({
        idMedicamento: Number(item.idMedicamento),
        dosis: item.dosis.trim(),
        frecuenciaHoras: Number(item.frecuenciaHoras),
        duracionDias: item.duracionDias === '' ? null : Number(item.duracionDias),
        fechaHoraInicio: toApiDateTime(item.fechaHoraInicio),
      })),
    });
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="receta-form-title">
      <form onSubmit={handleSubmit} className="modal-box max-w-2xl border border-slate-200 bg-white p-0 shadow-2xl transition duration-300 starting:translate-y-3 starting:opacity-0">
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b] ring-1 ring-[#15919a]/10"><DocumentTextIcon className="size-6" aria-hidden="true" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Nueva receta</p>
                <h2 id="receta-form-title" className="mt-1 text-xl font-bold text-[#19304a]">Registrar receta médica</h2>
                <p className="mt-1 text-sm text-slate-500">Las tomas se programan solas con la frecuencia que indiques.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar"><XMarkIcon className="size-5" /></button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#29425d]">Integrante</span>
              <select value={idIntegrante} onChange={(event) => setIdIntegrante(event.target.value)} className="select select-bordered h-11 w-full bg-white" required>
                <option value="">Selecciona…</option>
                {integrantes.map((member) => <option key={member.id} value={member.id}>{fullName(member)}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#29425d]">Fecha de emisión</span>
              <input type="date" value={fechaEmision} max={toDateInput(new Date())} onChange={(event) => setFechaEmision(event.target.value)} className={fieldClass} required />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-bold text-[#29425d]">Indicaciones del médico <span className="font-normal text-slate-400">(opcional)</span></span>
            <textarea value={indicaciones} onChange={(event) => setIndicaciones(event.target.value)} rows={2} className="textarea textarea-bordered w-full bg-white" placeholder="Ej. Tomar después de los alimentos" />
          </label>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="font-bold text-[#19304a]">Medicamentos</h3>
            <button type="button" onClick={() => setDetalles((current) => [...current, newDetalle()])} className="btn btn-ghost btn-sm text-[#126f7b] transition-all duration-200 active:scale-95"><PlusIcon className="size-4" /> Agregar</button>
          </div>

          <div className="mt-2 space-y-3">
            {detalles.map((item, index) => (
              <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-300 starting:translate-y-2 starting:opacity-0">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Medicamento {index + 1}</span>
                  {detalles.length > 1 && (
                    <button type="button" onClick={() => setDetalles((current) => current.filter((detail) => detail.key !== item.key))} className="btn btn-ghost btn-xs text-red-500 transition-all duration-200 active:scale-95" aria-label={`Quitar medicamento ${index + 1}`}><TrashIcon className="size-4" /></button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <MedicationSearchInput
                      inputId={`receta-medicamento-${item.key}`}
                      selectedMedication={item.medicamentoSeleccionado}
                      onSelect={(medication) => updateDetalle(item.key, {
                        idMedicamento: medication ? String(medication.id) : '',
                        medicamentoSeleccionado: medication,
                      })}
                    />
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-500">Dosis</span>
                    <input value={item.dosis} maxLength={100} onChange={(event) => updateDetalle(item.key, { dosis: event.target.value })} className={fieldClass} placeholder="Ej. 1 tableta" required />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-500">Primera toma</span>
                    <input type="datetime-local" value={item.fechaHoraInicio} onChange={(event) => updateDetalle(item.key, { fechaHoraInicio: event.target.value })} className={fieldClass} required />
                  </label>
                  <div className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-slate-500">Frecuencia</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {frequencyOptions.map((hours) => (
                        <button key={hours} type="button" onClick={() => updateDetalle(item.key, { frecuenciaHoras: hours })} className={`btn btn-sm transition-all duration-200 active:scale-95 ${Number(item.frecuenciaHoras) === hours ? 'border-0 bg-[#126f7b] text-white' : 'btn-outline border-slate-300 text-slate-600'}`}>
                          {hours === 24 ? 'Cada día' : `Cada ${hours} h`}
                        </button>
                      ))}
                      <input type="number" min="1" value={item.frecuenciaHoras} onChange={(event) => updateDetalle(item.key, { frecuenciaHoras: event.target.value })} className="input input-bordered input-sm w-20 bg-white" aria-label="Frecuencia en horas" />
                      <span className="text-xs text-slate-500">horas</span>
                    </div>
                  </div>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-bold text-slate-500">Duración en días <span className="font-normal text-slate-400">(vacío = sin fecha de fin)</span></span>
                    <input type="number" min="1" value={item.duracionDias} onChange={(event) => updateDetalle(item.key, { duracionDias: event.target.value })} className={fieldClass} placeholder="Ej. 7" />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-ghost transition-all duration-200 active:scale-95">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {submitting ? 'Guardando...' : 'Registrar receta'}
            </button>
          </div>
        </div>
      </form>
      <button type="button" className="modal-backdrop" aria-label="Cerrar" onClick={onClose} disabled={submitting} />
    </div>
  );
}

export default RecetaFormModal;
