import { ArrowTopRightOnSquareIcon, BeakerIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  formatCurrency, formatDate, getCategoryLabel, getFullName, getStatusInfo,
} from './estudioOptions';

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#19304a]">{value || 'Sin información'}</p>
    </div>
  );
}

function TextBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#15919a]">{label}</p>
      <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{value || 'Sin información'}</p>
    </div>
  );
}

function EstudioDetailsModal({ study, onClose }) {
  if (!study) return null;

  const status = getStatusInfo(study.estado);

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="study-detail-title">
      <div className="modal-box max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e5f7f4] text-[#15919a]"><BeakerIcon className="size-5" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#15919a]">Laboratorio</p>
              <h2 id="study-detail-title" className="font-bold text-[#19304a]">Detalle del estudio</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar detalle"><XMarkIcon className="size-5" /></button>
        </div>

        <div className="max-h-[calc(90vh-6.5rem)] space-y-5 overflow-y-auto p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#15919a]">Estudio</p>
              <span className={`badge border-0 text-xs font-bold ${status.badge}`}>{status.label}</span>
            </div>
            <h3 className="mt-1 text-2xl font-bold text-[#19304a]">{study.tipoEstudio}</h3>
            <p className="mt-1 text-slate-500">{getFullName(study.integrante)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Categoría" value={getCategoryLabel(study.categoria)} />
            <Detail label="Fecha del estudio" value={formatDate(study.fechaEstudio)} />
            <Detail label="Laboratorio" value={study.laboratorio} />
            <Detail label="Costo" value={formatCurrency(study.costo)} />
            <Detail label="Consulta relacionada" value={study.consulta ? `${formatDate(study.consulta.fechaConsulta)} · ${study.consulta.motivo}` : 'Sin consulta relacionada'} />
            <Detail label="Registrado" value={formatDate(study.fechaRegistro)} />
          </div>

          <TextBlock label="Indicaciones" value={study.indicaciones} />
          <TextBlock label="Resultado" value={study.resultado} />
          <TextBlock label="Valores de referencia" value={study.valoresReferencia} />
          <TextBlock label="Observaciones" value={study.observaciones} />

          {study.archivoUrl && (
            <a href={study.archivoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm transition-all duration-200 active:scale-95">
              <ArrowTopRightOnSquareIcon className="size-4" /> Abrir archivo del resultado
            </a>
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Cerrar detalle" onClick={onClose} />
    </div>
  );
}

export default EstudioDetailsModal;
