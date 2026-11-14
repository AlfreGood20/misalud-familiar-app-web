import { BellAlertIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const alertStyles = {
  AGOTADO: { label: 'Agotado', badge: 'badge-warning' },
  CADUCADO: { label: 'Caducado', badge: 'badge-error' },
  BAJO: { label: 'Stock bajo', badge: 'badge-warning' },
  POR_CADUCAR: { label: 'Por caducar', badge: 'badge-warning' },
};

const MAX_VISIBLE = 5;

function StockAlertsPanel({ alerts, loading }) {
  return (
    <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Alertas de stock">
      <div className="card-body p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#19304a]">
              <BellAlertIcon className="size-6 text-[#15919a]" aria-hidden="true" /> Alertas de stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">Medicamentos agotados, caducados, bajo el mínimo o por caducar.</p>
          </div>
          <Link to="/stock" className="btn transition-all duration-200 active:scale-95 btn-ghost btn-sm text-[#126f7b]">Ver stock <ChevronRightIcon className="size-4" /></Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><span className="loading loading-spinner text-[#15919a]" /></div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#f1faf8] p-4 text-sm text-[#126f7b]">
            <CheckCircleIcon className="size-5" aria-hidden="true" /> Todo en orden, no hay alertas de stock.
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.slice(0, MAX_VISIBLE).map((alert) => {
              const style = alertStyles[alert.type];
              return (
                <li key={alert.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#19304a]">{alert.stock.medicamento?.nombreComercial}</p>
                    <p className="text-xs text-slate-500">{alert.message}</p>
                  </div>
                  <span className={`badge badge-sm shrink-0 ${style.badge}`}>{style.label}</span>
                </li>
              );
            })}
            {alerts.length > MAX_VISIBLE && (
              <li className="px-1 text-xs text-slate-500">y {alerts.length - MAX_VISIBLE} alertas más en Stock.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

export default StockAlertsPanel;
