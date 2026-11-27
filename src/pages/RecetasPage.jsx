import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import AgendaTomas from '../components/recetas/AgendaTomas';
import RecetaCard from '../components/recetas/RecetaCard';
import RecetaFormModal from '../components/recetas/RecetaFormModal';
import { fullName, shiftDay, toDateInput } from '../components/recetas/recetaOptions';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useAuth from '../auth/useAuth';
import { isAdminRole } from '../auth/roles';
import { getIntegrantes } from '../services/memberService';
import {
  createReceta,
  deleteReceta,
  finalizarReceta,
  getRecetas,
  getTomas,
  updateTomaEstado,
} from '../services/recetaService';

const statusTabs = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Finalizadas' },
  { value: '', label: 'Todas' },
];

const PAGE_SIZE = 6;

function RecetasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.rol);
  const openCreateRequest = useRef(Boolean(location.state?.openCreateReceta));
  const [integrantes, setIntegrantes] = useState([]);
  const [idIntegrante, setIdIntegrante] = useState(() => (
    location.state?.idIntegrante ? String(location.state.idIntegrante) : ''
  ));

  const [day, setDay] = useState(() => toDateInput(new Date()));
  const [tomas, setTomas] = useState([]);
  const [loadingTomas, setLoadingTomas] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [recetas, setRecetas] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [activa, setActiva] = useState('true');
  const [search, setSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [loadingRecetas, setLoadingRecetas] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toFinalize, setToFinalize] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateReceta) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const members = await getIntegrantes();
        if (cancelled) return;
        setIntegrantes(members ?? []);
        if (openCreateRequest.current) {
          setFormOpen(true);
          openCreateRequest.current = false;
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudo cargar la información inicial.');
          console.error('Error al iniciar recetas:', error);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setQuerySearch(search); setPage(0); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoadingTomas(true);
    getTomas({ fechaInicio: day, fechaFin: day, idIntegrante })
      .then((response) => { if (!cancelled) setTomas(response.content ?? []); })
      .catch((error) => {
        if (!cancelled) {
          toast.error('No se pudo cargar la agenda de tomas.');
          console.error('Error al cargar tomas:', error);
        }
      })
      .finally(() => { if (!cancelled) setLoadingTomas(false); });
    return () => { cancelled = true; };
  }, [day, idIntegrante, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setLoadingRecetas(true);
    getRecetas({ page, size: PAGE_SIZE, idIntegrante, activa, busqueda: querySearch })
      .then((response) => {
        if (cancelled) return;
        setRecetas(response.content ?? []);
        setPageInfo({
          number: response.page?.number ?? page,
          totalPages: response.page?.totalPages ?? 0,
          totalElements: response.page?.totalElements ?? 0,
        });
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error('No se pudieron cargar las recetas.');
          console.error('Error al cargar recetas:', error);
        }
      })
      .finally(() => { if (!cancelled) setLoadingRecetas(false); });
    return () => { cancelled = true; };
  }, [page, idIntegrante, activa, querySearch, reloadKey]);

  const handleDayChange = (amount) => setDay((current) => (amount === 0 ? toDateInput(new Date()) : shiftDay(current, amount)));

  const handleChangeEstado = async (toma, estado) => {
    setUpdatingId(toma.id);
    try {
      const updated = await updateTomaEstado(toma.id, estado);
      setTomas((current) => current.map((item) => (item.id === toma.id ? updated : item)));
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la toma.');
      console.error('Error al actualizar toma:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createReceta(payload);
      toast.success('Receta registrada y tomas programadas.');
      setFormOpen(false);
      setActiva('true');
      setPage(0);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar la receta.');
      console.error('Error al crear receta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (action, successMessage, errorMessage, close) => {
    setActionLoading(true);
    try {
      await action();
      toast.success(successMessage);
      close(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(error.message || errorMessage);
      console.error(errorMessage, error);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(pageInfo.totalPages, 1);
  const fieldClass = 'transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]';

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Tratamientos</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <ClipboardDocumentListIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Recetas y tomas
            </h1>
            <p className="mt-2 text-slate-500">Lleva la agenda de medicamentos del día y las recetas de tu familia en un solo lugar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setFormOpen(true)} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              <PlusIcon className="size-5" /> Nueva receta
            </button>
          </div>
        </div>

        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[#19304a]">Filtrar por integrante</p>
                  <p className="text-sm text-slate-500">Se aplica a la agenda y a las recetas.</p>
                </div>
              </div>
              <select
                value={idIntegrante}
                onChange={(event) => { setIdIntegrante(event.target.value); setPage(0); }}
                className={`select select-bordered w-full bg-white sm:w-auto ${fieldClass}`}
                aria-label="Filtrar por integrante"
              >
                <option value="">Toda la familia</option>
                {integrantes.map((member) => <option key={member.id} value={member.id}>{fullName(member)}</option>)}
              </select>
            </div>
            <AgendaTomas day={day} onDayChange={handleDayChange} tomas={tomas} loading={loadingTomas} updatingId={updatingId} onChangeEstado={handleChangeEstado} />

            <section aria-label="Recetas">
              <div className="card mb-4 border border-slate-200 bg-white shadow-sm">
                <div className="card-body gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Recetas médicas</p>
                      <h2 className="mt-1 text-xl font-bold text-[#19304a]">{pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'receta' : 'recetas'}</h2>
                    </div>
                    <div role="tablist" className="flex gap-1 rounded-xl bg-slate-100 p-1">
                      {statusTabs.map((tab) => (
                        <button key={tab.label} type="button" role="tab" aria-selected={activa === tab.value} onClick={() => { setActiva(tab.value); setPage(0); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${activa === tab.value ? 'bg-white text-[#126f7b] shadow-sm' : 'text-slate-500 hover:text-[#126f7b]'}`}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className={`input input-bordered flex w-full items-center gap-2 bg-white ${fieldClass}`}>
                    <MagnifyingGlassIcon className="size-5 shrink-0 text-[#15919a]" aria-hidden="true" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 grow" placeholder="Buscar por medicamento o indicaciones" />
                  </label>
                </div>
              </div>

              {loadingRecetas && recetas.length === 0 ? (
                <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
              ) : recetas.length === 0 ? (
                <div className="card border border-dashed border-slate-300 bg-white">
                  <div className="card-body items-center py-14 text-center">
                    <DocumentTextIcon className="size-12 text-slate-300" />
                    <h3 className="mt-3 text-lg font-bold text-[#19304a]">No hay recetas</h3>
                    <p className="text-sm text-slate-500">Registra una receta o prueba con otros filtros.</p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 transition-opacity duration-200 md:grid-cols-2 2xl:grid-cols-3 ${loadingRecetas ? 'opacity-60' : ''}`}>
                  {recetas.map((receta) => (
                    <RecetaCard key={receta.id} receta={receta} onFinalizar={setToFinalize} onDelete={isAdmin ? setToDelete : undefined} />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Página {pageInfo.number + 1} de {totalPages}</p>
                <div className="join">
                  <button type="button" className="btn btn-sm join-item transition-all duration-200 active:scale-95" disabled={page === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftIcon className="size-4" /> Anterior</button>
                  <button type="button" className="btn btn-sm join-item transition-all duration-200 active:scale-95" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Siguiente <ChevronRightIcon className="size-4" /></button>
                </div>
              </div>
            </section>
        </div>
      </div>

      {formOpen && (
        <RecetaFormModal
          integrantes={integrantes}
          defaultIntegrante={idIntegrante}
          submitting={submitting}
          onClose={() => !submitting && setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      <ConfirmDialog
        open={toFinalize !== null}
        title="Finalizar tratamiento"
        message="Las tomas pendientes de esta receta se cancelarán y se conservará el historial de las ya realizadas."
        confirmLabel="Finalizar"
        loadingLabel="Finalizando..."
        loading={actionLoading}
        onConfirm={() => runAction(() => finalizarReceta(toFinalize.id), 'Tratamiento finalizado.', 'No se pudo finalizar la receta.', setToFinalize)}
        onCancel={() => !actionLoading && setToFinalize(null)}
      />
      {isAdmin && <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar receta"
        message="Se eliminará la receta con sus medicamentos y todas sus tomas programadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        loading={actionLoading}
        onConfirm={() => runAction(() => deleteReceta(toDelete.id), 'Receta eliminada.', 'No se pudo eliminar la receta.', setToDelete)}
        onCancel={() => !actionLoading && setToDelete(null)}
      />}
    </main>
  );
}

export default RecetasPage;
