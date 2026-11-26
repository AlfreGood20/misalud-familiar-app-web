import { useEffect, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BeakerIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getIntegrantes } from '../services/memberService';
import {
  deleteAlerta,
  getAlertas,
  getUnreadAlertCount,
  markAllAlertasAsRead,
  markAlertaAsRead,
  publishUnreadAlertCount,
} from '../services/alertService';

const PAGE_SIZE = 15;

const ALERT_TYPES = [
  { value: 'CADUCIDAD', label: 'Caducidad' },
  { value: 'STOCK_BAJO', label: 'Stock bajo' },
  { value: 'TOMA_PENDIENTE', label: 'Toma pendiente' },
  { value: 'CONSULTA_PROXIMA', label: 'Próxima consulta' },
  { value: 'VACUNA_PROXIMA', label: 'Próxima vacuna' },
  { value: 'BIENVENIDA', label: 'Bienvenida' },
];

const ALERT_PRESENTATION = {
  CADUCIDAD: {
    label: 'Caducidad',
    icon: ExclamationTriangleIcon,
    color: 'bg-[#ffebeb] text-[#c84b55]',
  },
  STOCK_BAJO: {
    label: 'Stock bajo',
    icon: ArchiveBoxIcon,
    color: 'bg-[#fff3df] text-[#bd7419]',
  },
  TOMA_PENDIENTE: {
    label: 'Toma pendiente',
    icon: ClockIcon,
    color: 'bg-[#fff3df] text-[#bd7419]',
  },
  CONSULTA_PROXIMA: {
    label: 'Próxima consulta',
    icon: CalendarDaysIcon,
    color: 'bg-[#eaf2ff] text-[#3a67ad]',
  },
  VACUNA_PROXIMA: {
    label: 'Próxima vacuna',
    icon: BeakerIcon,
    color: 'bg-[#e5f7f4] text-[#117b7b]',
  },
  BIENVENIDA: {
    label: 'Bienvenida',
    icon: BellAlertIcon,
    color: 'bg-[#eaf2ff] text-[#3a67ad]',
  },
};

const INITIAL_FILTERS = {
  idIntegrante: '',
  tipo: '',
  soloNoLeidas: false,
};

function formatDateTime(value) {
  if (!value) return 'Fecha sin definir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha sin definir';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getMemberName(member) {
  return [member.nombre, member.apellidoPaterno, member.apellidoMaterno].filter(Boolean).join(' ');
}

function AlertCard({ alert, onMarkRead, onDelete, mutationLoading }) {
  const presentation = ALERT_PRESENTATION[alert.tipo] ?? {
    label: alert.tipo,
    icon: BellAlertIcon,
    color: 'bg-slate-100 text-slate-600',
  };
  const AlertIcon = presentation.icon;

  return (
    <article className={`card border bg-white shadow-sm ${alert.leida ? 'border-slate-200' : 'border-[#8dd5cd]'}`}>
      <div className="card-body flex-row items-start gap-4 p-4 sm:p-5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${presentation.color}`}>
          <AlertIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-[#19304a]">{presentation.label}</h2>
            <span className={`badge badge-sm ${alert.leida ? 'badge-ghost' : 'bg-[#e5f7f4] text-[#117b7b]'}`}>
              {alert.leida ? 'Leída' : 'No leída'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{alert.mensaje}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{alert.nombreIntegrante || (alert.idIntegrante != null ? 'Integrante' : 'Familia')}</span>
              <time dateTime={alert.fechaGeneracion}>{formatDateTime(alert.fechaGeneracion)}</time>
            </div>
            <div className="flex flex-wrap gap-2">
              {!alert.leida && (
                <button
                  type="button"
                  onClick={() => onMarkRead(alert)}
                  disabled={mutationLoading}
                  className="btn btn-ghost btn-xs text-[#126f7b]"
                  aria-label={`Marcar como leída: ${presentation.label}`}
                >
                  <CheckIcon className="size-4" aria-hidden="true" /> Marcar leída
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(alert)}
                disabled={mutationLoading}
                className="btn btn-ghost btn-xs text-error"
                aria-label={`Eliminar alerta: ${presentation.label}`}
              >
                <TrashIcon className="size-4" aria-hidden="true" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AlertasPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [unreadAlertCount, setUnreadAlertCount] = useState(null);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let active = true;
    getIntegrantes()
      .then((response) => {
        if (!Array.isArray(response)) throw new Error('La respuesta de integrantes no tiene el formato esperado.');
        if (active) setMembers(response);
      })
      .catch((requestError) => {
        if (active) {
          setMembersError(requestError.message);
          console.error('Error al cargar integrantes para las alertas:', requestError);
        }
      })
      .finally(() => {
        if (active) setMembersLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getUnreadAlertCount()
      .then((count) => {
        if (active) setUnreadAlertCount(count);
      })
      .catch((requestError) => {
        if (active) console.error('Error al cargar el contador de alertas no leídas:', requestError);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getAlertas({ ...filters, page, size: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setAlerts(response.content);
        setPageInfo({
          number: response.page.number ?? page,
          totalPages: response.page.totalPages ?? 0,
          totalElements: response.page.totalElements ?? 0,
        });
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          console.error('Error al cargar alertas:', requestError);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, page, reloadKey]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLoading(true);
    setError(null);
    setFilters((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setLoading(true);
    setError(null);
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const handlePageChange = (nextPage) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((current) => current + 1);
  };

  const updateUnreadCount = (count) => {
    const safeCount = Math.max(0, count);
    setUnreadAlertCount(safeCount);
    publishUnreadAlertCount(safeCount);
  };

  const syncUnreadCount = async (fallbackCount) => {
    updateUnreadCount(fallbackCount);
    try {
      updateUnreadCount(await getUnreadAlertCount());
    } catch (requestError) {
      console.error('Error al sincronizar el contador de alertas no leídas:', requestError);
    }
  };

  const handleMarkRead = async (alert) => {
    setMutationLoading(true);
    try {
      await markAlertaAsRead(alert.id);
      await syncUnreadCount((unreadAlertCount ?? 0) - 1);

      const remainingAlerts = alerts.filter((item) => item.id !== alert.id);
      if (filters.soloNoLeidas) {
        const totalElements = Math.max(pageInfo.totalElements - 1, 0);
        const totalPages = Math.ceil(totalElements / PAGE_SIZE);
        setAlerts(remainingAlerts);
        setPageInfo((current) => ({ ...current, totalElements, totalPages }));
        if (page > 0 && remainingAlerts.length === 0) {
          setLoading(true);
          setPage((current) => current - 1);
        }
      } else {
        setAlerts((current) => current.map((item) => (
          item.id === alert.id ? { ...item, leida: true } : item
        )));
      }

      toast.success('Alerta marcada como leída.');
    } catch (requestError) {
      toast.error(requestError.message || 'No se pudo marcar la alerta como leída.');
      console.error('Error al marcar alerta como leída:', requestError);
    } finally {
      setMutationLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMutationLoading(true);
    try {
      await markAllAlertasAsRead();
      await syncUnreadCount(0);
      if (filters.soloNoLeidas) {
        setAlerts([]);
        setPageInfo({ number: 0, totalPages: 0, totalElements: 0 });
        setPage(0);
      } else {
        setAlerts((current) => current.map((alert) => ({ ...alert, leida: true })));
      }
      toast.success('Todas las alertas se marcaron como leídas.');
    } catch (requestError) {
      toast.error(requestError.message || 'No se pudieron marcar todas las alertas como leídas.');
      console.error('Error al marcar todas las alertas como leídas:', requestError);
    } finally {
      setMutationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setMutationLoading(true);
    try {
      await deleteAlerta(deleteTarget.id);
      if (!deleteTarget.leida) await syncUnreadCount((unreadAlertCount ?? 0) - 1);

      const remainingAlerts = alerts.filter((alert) => alert.id !== deleteTarget.id);
      const totalElements = Math.max(pageInfo.totalElements - 1, 0);
      const totalPages = Math.ceil(totalElements / PAGE_SIZE);
      setPageInfo((current) => ({ ...current, totalElements, totalPages }));
      setDeleteTarget(null);

      if (page > 0 && remainingAlerts.length === 0) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        setAlerts(remainingAlerts);
      }

      toast.success('Alerta eliminada.');
    } catch (requestError) {
      toast.error(requestError.message || 'No se pudo eliminar la alerta.');
      console.error('Error al eliminar alerta:', requestError);
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="MiSalud Familiar" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Centro de notificaciones</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <BellAlertIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Alertas
            </h1>
            <p className="mt-2 text-slate-500">Revisa las notificaciones más recientes de tu familia.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadAlertCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={mutationLoading}
                className="btn border-0 bg-[#126f7b] text-white hover:bg-[#0b5d69]"
              >
                <CheckIcon className="size-5" aria-hidden="true" /> Marcar todas como leídas
              </button>
            )}
            <button type="button" onClick={handleRetry} className="btn btn-outline border-slate-300 bg-white text-[#126f7b]">
              <ArrowPathIcon className="size-5" aria-hidden="true" /> Actualizar
            </button>
          </div>
        </div>

        <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Filtros de alertas">
          <div className="card-body gap-4 p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-1.5 font-semibold text-[#29425d]">Integrante</span>
                <select
                  name="idIntegrante"
                  value={filters.idIntegrante}
                  onChange={handleFilterChange}
                  disabled={membersLoading}
                  className="select select-bordered w-full bg-white"
                >
                  <option value="">Toda la familia</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{getMemberName(member)}</option>
                  ))}
                </select>
                {membersError && <span className="mt-1 text-xs text-error">{membersError}</span>}
              </label>

              <label className="form-control">
                <span className="label-text mb-1.5 font-semibold text-[#29425d]">Tipo de alerta</span>
                <select
                  name="tipo"
                  value={filters.tipo}
                  onChange={handleFilterChange}
                  className="select select-bordered w-full bg-white"
                >
                  <option value="">Todos los tipos</option>
                  {ALERT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#29425d]">
                <input
                  type="checkbox"
                  name="soloNoLeidas"
                  checked={filters.soloNoLeidas}
                  onChange={handleFilterChange}
                  className="checkbox checkbox-sm border-slate-300 checked:border-[#126f7b] checked:bg-[#126f7b]"
                />
                Solo no leídas
              </label>
              <button type="button" onClick={handleClearFilters} className="btn btn-ghost btn-sm text-[#126f7b]">
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-16" role="status" aria-label="Cargando alertas">
              <span className="loading loading-spinner loading-lg text-[#15919a]" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <ExclamationTriangleIcon className="size-6 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-bold">No se pudieron cargar las alertas</h2>
                <p className="text-sm">{error}</p>
              </div>
              <button type="button" className="btn btn-sm" onClick={handleRetry}>Reintentar</button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="card border border-dashed border-slate-300 bg-white">
              <div className="card-body items-center py-16 text-center">
                <BellAlertIcon className="size-12 text-slate-300" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay notificaciones</h2>
                <p className="text-sm text-slate-500">No encontramos alertas con los filtros seleccionados.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'notificación' : 'notificaciones'}
                </p>
                <p className="text-xs text-slate-400">Ordenadas de más reciente a más antigua</p>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkRead={handleMarkRead}
                    onDelete={setDeleteTarget}
                    mutationLoading={mutationLoading}
                  />
                ))}
              </div>
              {pageInfo.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Página {pageInfo.number + 1} de {pageInfo.totalPages}
                  </p>
                  <div className="join">
                    <button
                      type="button"
                      className="btn btn-sm join-item"
                      disabled={pageInfo.number === 0 || loading}
                      onClick={() => handlePageChange(pageInfo.number - 1)}
                      aria-label="Página anterior"
                    >
                      <ChevronLeftIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm join-item"
                      disabled={pageInfo.number + 1 >= pageInfo.totalPages || loading}
                      onClick={() => handlePageChange(pageInfo.number + 1)}
                      aria-label="Página siguiente"
                    >
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar alerta"
        message="Esta notificación se eliminará permanentemente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        loading={mutationLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => !mutationLoading && setDeleteTarget(null)}
      />
    </main>
  );
}

export default AlertasPage;
