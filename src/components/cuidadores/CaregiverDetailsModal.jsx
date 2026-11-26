import {
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function CaregiverDetailsModal({ caregiver, loading, onClose, onEdit, onDelete }) {
  if (!caregiver) return null;

  const fullName = [caregiver.nombre, caregiver.apellidoPaterno, caregiver.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="caregiver-details-title">
      <div className="modal-box flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border border-slate-200 bg-white p-0">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#15919a]">Acceso de cuidadores</p>
            <h2 id="caregiver-details-title" className="text-lg font-bold text-[#19304a]">Detalle del cuidador</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm transition-all duration-200 active:scale-95" aria-label="Cerrar detalles">
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-1 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-[#15919a]" />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#15919a]">
                  <UserCircleIcon className="size-9" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#19304a]">{fullName || 'Cuidador'}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{caregiver.rol || 'Cuidador'}</p>
                </div>
                {caregiver.estado && (
                  <span className={`badge ml-auto ${caregiver.estado === 'ACTIVO' ? 'badge-success' : 'badge-ghost'}`}>
                    {caregiver.estado}
                  </span>
                )}
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Nombre', caregiver.nombre],
                  ['Apellido paterno', caregiver.apellidoPaterno],
                  ['Apellido materno', caregiver.apellidoMaterno],
                  ['Correo electrónico', caregiver.correo],
                  ['Teléfono', caregiver.telefono],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-bold text-[#19304a]">{value || 'Sin información'}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row">
              <button type="button" onClick={() => onEdit(caregiver)} className="btn flex-1 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:bg-[#0b5d69] active:scale-95">
                <PencilSquareIcon className="size-4" aria-hidden="true" /> Actualizar
              </button>
              <button type="button" onClick={() => onDelete(caregiver)} className="btn btn-error flex-1 text-white transition-all duration-200 active:scale-95">
                <TrashIcon className="size-4" aria-hidden="true" /> Eliminar
              </button>
            </div>
          </>
        )}
      </div>
      <button type="button" className="modal-backdrop" aria-label="Cerrar detalles del cuidador" onClick={onClose} />
    </div>
  );
}

export default CaregiverDetailsModal;
