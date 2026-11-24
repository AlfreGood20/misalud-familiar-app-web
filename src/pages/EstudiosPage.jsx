import { useEffect, useRef, useState } from 'react';
import {
  BeakerIcon, ChevronLeftIcon, ChevronRightIcon, LockClosedIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EstudioCard from '../components/estudios/EstudioCard';
import EstudioDetailsModal from '../components/estudios/EstudioDetailsModal';
import EstudioFilters from '../components/estudios/EstudioFilters';
import EstudioFormModal from '../components/estudios/EstudioFormModal';
import EstudioResultModal from '../components/estudios/EstudioResultModal';
import { getFullName, toUpdatePayload } from '../components/estudios/estudioOptions';
import { getCurrentUser } from '../services/authService';
import { getConsultas } from '../services/consultaService';
import {
  cargarResultadoEstudio, createEstudio, deleteEstudio, getEstudios, updateEstudio,
} from '../services/estudioService';
import { getIntegrantes } from '../services/memberService';

const initialFilters = {
  busqueda: '',
  integrante: '',
  categoria: '',
  estado: '',
  pendientes: false,
  page: 0,
  size: 9,
};

const emptyToNull = (value) => {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
};

async function requestEstudios(currentFilters) {
  const response = await getEstudios(currentFilters);
  const totalElements = response.page?.totalElements ?? 0;
  const totalPages = response.page?.totalPages || Math.ceil(totalElements / currentFilters.size);

  return {
    items: response.content ?? [],
    pageInfo: {
      number: response.page?.number ?? currentFilters.page,
      totalPages,
      totalElements,
    },
  };
}

function EstudiosPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [queryFilters, setQueryFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [integrantes, setIntegrantes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingStudy, setEditingStudy] = useState(null);
  const [resultStudy, setResultStudy] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const filtersInitialized = useRef(false);
  const {
    busqueda, integrante, categoria, estado, pendientes,
  } = filters;

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        const admin = user?.rol === 'ADMIN';
        setIsAdmin(admin);
        if (!admin) {
          setLoading(false);
          return;
        }
        const response = await getIntegrantes();
        if (!cancelled) {
          setIntegrantes((response ?? []).map((item) => ({ id: item.id, label: getFullName(item) })));
        }
      } catch (error) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
          toast.error('No se pudieron cargar los datos iniciales.');
          console.error('Error al cargar datos de estudios:', error);
        }
      }
    }

    loadUser();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!filtersInitialized.current) {
      filtersInitialized.current = true;
      return undefined;
    }

    const timer = setTimeout(() => {
      setQueryFilters((current) => ({
        ...current, busqueda, integrante, categoria, estado, pendientes, page: 0,
      }));
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda, integrante, categoria, estado, pendientes]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      try {
        const result = await requestEstudios(queryFilters);
        if (!cancelled) {
          setItems(result.items);
          setPageInfo(result.pageInfo);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudieron cargar los estudios.');
          console.error('Error al cargar estudios:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [queryFilters, reloadKey, isAdmin]);

  const reload = () => setReloadKey((current) => current + 1);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setQueryFilters(initialFilters);
  };

  // Consultas del integrante para vincularlas al estudio (se excluyen las canceladas).
  const loadConsultas = async (idIntegrante) => {
    if (!idIntegrante) {
      setConsultas([]);
      return;
    }
    try {
      const response = await getConsultas({ integrante: idIntegrante, page: 0, size: 50 });
      setConsultas((response.content ?? []).filter((item) => item.estado !== 'CANCELADA'));
    } catch (error) {
      setConsultas([]);
      toast.error('No se pudieron cargar las consultas del integrante.');
      console.error('Error al cargar consultas:', error);
    }
  };

  const openCreate = () => {
    setEditingStudy(null);
    setConsultas([]);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  };

  const openEdit = (study) => {
    setEditingStudy(study);
    setConsultas([]);
    loadConsultas(study.integrante?.id);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingStudy(null);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const common = {
      idConsulta: form.get('idConsulta') ? Number(form.get('idConsulta')) : null,
      fechaEstudio: form.get('fechaEstudio'),
      tipoEstudio: String(form.get('tipoEstudio')).trim(),
      categoria: form.get('categoria'),
      laboratorio: emptyToNull(form.get('laboratorio')),
      indicaciones: emptyToNull(form.get('indicaciones')),
      costo: form.get('costo') === '' ? null : Number(form.get('costo')),
    };

    setSubmitting(true);
    try {
      if (editingStudy) {
        await updateEstudio(editingStudy.idEstudio, {
          ...common,
          estado: editingStudy.estado,
          resultado: emptyToNull(form.get('resultado')),
          valoresReferencia: emptyToNull(form.get('valoresReferencia')),
          observaciones: emptyToNull(form.get('observaciones')),
          archivoUrl: emptyToNull(form.get('archivoUrl')),
        });
        toast.success('Estudio actualizado.');
      } else {
        await createEstudio({ ...common, idIntegrante: Number(form.get('idIntegrante')) });
        toast.success('Estudio registrado.');
      }
      closeForm();
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el estudio.');
      console.error('Error al guardar estudio:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    try {
      await cargarResultadoEstudio(resultStudy.idEstudio, {
        resultado: String(form.get('resultado')).trim(),
        valoresReferencia: emptyToNull(form.get('valoresReferencia')),
        observaciones: emptyToNull(form.get('observaciones')),
        archivoUrl: emptyToNull(form.get('archivoUrl')),
      });
      toast.success('Resultado guardado.');
      setResultStudy(null);
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el resultado.');
      console.error('Error al cargar resultado:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (confirmation.type === 'delete') {
        await deleteEstudio(confirmation.study.idEstudio);
        toast.success('Estudio eliminado.');
      } else {
        await updateEstudio(
          confirmation.study.idEstudio,
          toUpdatePayload(confirmation.study, { estado: 'CANCELADO' }),
        );
        toast.success('Estudio cancelado.');
      }
      setConfirmation(null);
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar la acción.');
      console.error('Error en acción de estudio:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => navigate('/', { replace: true });
  const currentPage = pageInfo.number + 1;
  const isDelete = confirmation?.type === 'delete';
  const confirmName = confirmation?.study?.tipoEstudio;

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={handleLogout} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Expediente clínico</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <BeakerIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Estudios de laboratorio
            </h1>
            <p className="mt-2 text-slate-500">Solicita, consulta y registra los resultados de los estudios clínicos de tu familia.</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">{pageInfo.totalElements} registrados</div>
              <button type="button" onClick={openCreate} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
                <PlusIcon className="size-5" /> Nuevo estudio
              </button>
            </div>
          )}
        </div>

        {isAdmin === false ? (
          <div className="card border border-dashed border-slate-300 bg-white">
            <div className="card-body items-center py-16 text-center">
              <LockClosedIcon className="size-12 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-[#19304a]">Solo el administrador puede gestionar estudios</h2>
              <p className="text-sm text-slate-500">Pídele al administrador de tu familia que registre o consulte los estudios.</p>
            </div>
          </div>
        ) : (
          <>
            <EstudioFilters filters={filters} integrantes={integrantes} onChange={handleFilterChange} onClear={handleClear} />

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
              ) : items.length === 0 ? (
                <div className="card border border-dashed border-slate-300 bg-white">
                  <div className="card-body items-center py-16 text-center">
                    <BeakerIcon className="size-12 text-slate-300" />
                    <h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay estudios registrados</h2>
                    <p className="text-sm text-slate-500">Registra uno nuevo o prueba con otros filtros de búsqueda.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((study) => (
                      <EstudioCard
                        key={study.idEstudio}
                        study={study}
                        onSelect={setSelectedStudy}
                        onResult={setResultStudy}
                        onEdit={openEdit}
                        onCancel={(item) => setConfirmation({ type: 'cancel', study: item })}
                        onDelete={(item) => setConfirmation({ type: 'delete', study: item })}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-sm text-slate-500">Página {currentPage} de {Math.max(pageInfo.totalPages, 1)}</p>
                    <div className="join">
                      <button type="button" className="btn btn-sm join-item" disabled={pageInfo.number === 0} onClick={() => setQueryFilters((current) => ({ ...current, page: current.page - 1 }))}><ChevronLeftIcon className="size-4" /></button>
                      <button type="button" className="btn btn-sm join-item" disabled={currentPage >= pageInfo.totalPages} onClick={() => setQueryFilters((current) => ({ ...current, page: current.page + 1 }))}><ChevronRightIcon className="size-4" /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <EstudioDetailsModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
      <EstudioFormModal
        key={formKey}
        open={formOpen}
        integrantes={integrantes}
        consultas={consultas}
        submitting={submitting}
        study={editingStudy}
        editing={Boolean(editingStudy)}
        onIntegranteChange={loadConsultas}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />
      <EstudioResultModal
        key={resultStudy?.idEstudio ?? 'result'}
        study={resultStudy}
        submitting={submitting}
        onClose={() => setResultStudy(null)}
        onSubmit={handleResultSubmit}
      />
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={isDelete ? 'Eliminar estudio' : 'Cancelar estudio'}
        message={isDelete
          ? `¿Eliminar "${confirmName}"? Esta acción no se puede deshacer.`
          : `¿Cancelar el estudio "${confirmName}"? Ya no podrás cargarle resultados.`}
        confirmLabel={isDelete ? 'Eliminar' : 'Cancelar estudio'}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => !submitting && setConfirmation(null)}
      />
    </main>
  );
}

export default EstudiosPage;
