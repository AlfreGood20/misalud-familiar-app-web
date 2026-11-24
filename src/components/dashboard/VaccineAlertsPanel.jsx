import { BeakerIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const alertStyles = {
  ATRASADA: { label: 'Atrasada', badge: 'bg-[#fff0f0] text-[#b54b52]' },
  PENDIENTE: { label: 'Pendiente', badge: 'bg-[#fff3df] text-[#bd7419]' },
};

const MAX_VISIBLE = 5;

function VaccineAlertsPanel({ alerts, loading }) {
  const navigate = useNavigate();

  const openCartilla = (member) => {
    sessionStorage.setItem('vacunacion.cartilla.integrante', JSON.stringify(member));
    navigate('/vacunacion/cartilla');
  };

  return (
    <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Alertas de vacunación">
      <div className="card-body p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#19304a]">
              <BeakerIcon className="size-6 text-[#15919a]" aria-hidden="true" /> Alertas de vacunación
            </h2>
            <p className="mt-1 text-sm text-slate-500">Dosis atrasadas o pendientes de los integrantes.</p>
          </div>
          <button type="button" onClick={() => navigate('/vacunacion')} className="btn btn-ghost btn-sm text-[#126f7b] transition-all duration-200 active:scale-95">
            Ver vacunación <ChevronRightIcon className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><span className="loading loading-spinner text-[#15919a]" /></div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#f1faf8] p-4 text-sm text-[#126f7b]">
            <CheckCircleIcon className="size-5" aria-hidden="true" /> Todo en orden, no hay vacunas atrasadas ni pendientes.
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.slice(0, MAX_VISIBLE).map((alert) => {
              const style = alertStyles[alert.type];
              return (
                <li key={alert.id}>
                  <button
                    type="button"
                    onClick={() => openCartilla(alert.member)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-left transition duration-200 hover:bg-[#f1faf8] active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#19304a]">{alert.memberName}</p>
                      <p className="text-xs text-slate-500">
                        {alert.vaccine} · {alert.reinforcement ? `Refuerzo ${alert.dose}` : `Dosis ${alert.dose}`}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>{style.label}</span>
                  </button>
                </li>
              );
            })}
            {alerts.length > MAX_VISIBLE && (
              <li className="px-1 text-xs text-slate-500">y {alerts.length - MAX_VISIBLE} alertas más en Vacunación.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

export default VaccineAlertsPanel;
