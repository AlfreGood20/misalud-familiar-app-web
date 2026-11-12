import { XMarkIcon } from '@heroicons/react/24/outline';

const statusStyles = {
  PROGRAMADA: 'bg-[#e5f7f4] text-[#126f7b]',
  REALIZADA: 'bg-[#e8f1ff] text-[#2e68a5]',
  CANCELADA: 'bg-[#fff0f0] text-[#b54b52]',
};

function formatDate(value) {
  if (!value) return 'Sin definir';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return 'Sin definir';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#29425d]">{value || 'Sin definir'}</dd>
    </div>
  );
}

function ConsultaDetailsModal({
  consulta, loading, actionLoading, onClose, onEdit, onConclude, onCancel,
}) {
  if (!consulta) return null;

  const patient = consulta.paciente;
  const doctor = consulta.medico;
  const patientName = patient
    ? [patient.nombre, patient.apellidoPaterno, patient.apellidoMaterno].filter(Boolean).join(' ')
    : consulta.nombrePaciente;
  const doctorName = doctor
    ? [doctor.nombre, doctor.apellidoPaterno, doctor.apellidoMaterno].filter(Boolean).join(' ')
    : consulta.nombreMedico;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="consultation-details-title">
      <div className="modal-box max-w-2xl border border-slate-200 bg-white p-0">
        <div className="card-body p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Detalle de consulta</p>
              <h2 id="consultation-details-title" className="mt-1 text-2xl font-bold text-[#19304a]">{consulta.motivo}</h2>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar detalle">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-[#15919a]" />
            </div>
          ) : (
            <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`badge border-0 font-bold ${statusStyles[consulta.estado] ?? statusStyles.PROGRAMADA}`}>
              {consulta.estado}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f1faf8] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#15919a]">Paciente</p>
              <p className="mt-1 font-bold text-[#19304a]">{patientName || 'Sin definir'}</p>
              <p className="mt-1 text-sm text-slate-500">{patient?.parentesco?.replaceAll('_', ' ') || 'Sin parentesco definido'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#15919a]">Médico</p>
              <p className="mt-1 font-bold text-[#19304a]">{doctorName || 'Sin definir'}</p>
              <p className="mt-1 text-sm text-slate-500">{doctor?.especialidades?.map((item) => item.nombre).join(', ') || 'Sin especialidad definida'}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2">
            <InfoItem label="Fecha y hora" value={formatDateTime(consulta.fechaConsulta)} />
            <InfoItem label="Próxima consulta" value={formatDate(consulta.proximaConsulta)} />
            <InfoItem label="Costo" value={consulta.costo === null || consulta.costo === undefined ? 'Sin definir' : `$${consulta.costo}`} />
            <InfoItem label="Fecha de registro" value={formatDateTime(consulta.fechaRegistro)} />
          </dl>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Diagnóstico</p>
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{consulta.diagnostico || 'Sin diagnóstico registrado'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Notas</p>
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{consulta.notas || 'Sin notas registradas'}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {consulta.estado === 'PROGRAMADA' && (
              <>
                <button type="button" onClick={onEdit} className="btn min-w-32 btn-outline" disabled={actionLoading}>Editar</button>
                <button type="button" onClick={onCancel} className="btn min-w-32 btn-outline btn-error" disabled={actionLoading}>Cancelar consulta</button>
                <button type="button" onClick={onConclude} className="btn min-w-32 border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]" disabled={actionLoading}>Concluir consulta</button>
              </>
            )}
          </div>
            </>
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Cerrar detalle" onClick={onClose} />
    </div>
  );
}

export default ConsultaDetailsModal;
