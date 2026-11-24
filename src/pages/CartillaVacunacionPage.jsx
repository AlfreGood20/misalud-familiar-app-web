import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import VaccineApplicationModal from '../components/vacunacion/VaccineApplicationModal';
import {
  deleteVaccineApplication,
  getCartillaVacunacion,
  registerVaccineApplication,
  updateVaccineApplication,
} from '../services/vaccinationService';

const statusStyles = {
  APLICADA: 'bg-[#e5f7f4] text-[#126f7b]',
  ATRASADA: 'bg-[#fff0f0] text-[#b54b52]',
  PENDIENTE: 'bg-[#fff3df] text-[#bd7419]',
  FUTURA: 'bg-slate-100 text-slate-500',
};

function getAppliedCount(vaccine) {
  if (vaccine.dosisAplicadas !== undefined) return vaccine.dosisAplicadas;
  return vaccine.doses.filter((dose) => dose.status === 'APLICADA').length;
}

function getGeneralStatus(vaccine) {
  if (vaccine.esquemaCompleto) return { label: 'Esquema completo', style: 'text-[#126f7b] bg-[#e5f7f4]', accent: 'border-l-[#2f9e78]' };
  if (getAppliedCount(vaccine) === vaccine.doses.length) return { label: 'Esquema completo', style: 'text-[#126f7b] bg-[#e5f7f4]', accent: 'border-l-[#2f9e78]' };
  if (vaccine.doses.some((dose) => dose.status === 'ATRASADA')) return { label: 'Dosis atrasada', style: 'text-[#b54b52] bg-[#fff0f0]', accent: 'border-l-[#c84b55]' };
  if (vaccine.doses.some((dose) => dose.status === 'PENDIENTE')) return { label: 'Dosis pendiente', style: 'text-[#bd7419] bg-[#fff3df]', accent: 'border-l-[#d98b1f]' };
  return { label: 'Esquema pendiente', style: 'text-slate-600 bg-slate-100', accent: 'border-l-slate-300' };
}

function parseApplication(application) {
  if (!application) return { fecha: 'Sin registro', lote: 'Sin registro', lugar: 'Sin registro' };
  return {
    fecha: application.fechaAplicacion || 'Sin registro',
    lote: application.lote || 'Sin registro',
    lugar: application.lugarAplicacion || 'Sin registro',
  };
}

function formatAge(months) {
  if (months === 0) return 'Al nacer';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} años ${remainingMonths} meses`;
}

function VaccineAccordion({ vaccine, open, onToggle, onRegister, onEdit, onDelete }) {
  const applied = getAppliedCount(vaccine);
  const generalStatus = getGeneralStatus(vaccine);

  return (
    <article className={`overflow-hidden rounded-2xl border border-l-4 border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:border-[#8dd5cd] hover:shadow-md ${generalStatus.accent}`}>
      <button type="button" onClick={onToggle} className="grid w-full gap-4 p-5 text-left transition duration-200 hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_220px_180px_120px] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <ChevronDownIcon className={`mt-0.5 size-5 shrink-0 text-[#15919a] transition duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="font-bold text-[#19304a]">{vaccine.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{vaccine.disease}</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>Progreso</span><span>{applied} / {vaccine.doses.length}</span></div>
          <progress className="progress h-2 w-full text-[#15919a]" value={applied} max={vaccine.doses.length} aria-label={`Progreso de ${vaccine.name}`} />
        </div>
        <span className={`justify-self-start rounded-full px-3 py-1.5 text-center text-xs font-bold lg:justify-self-stretch ${generalStatus.style}`}>{generalStatus.label}</span>
        <span className="btn btn-outline btn-sm border-[#15919a]/30 text-[#126f7b] transition-all duration-200 lg:justify-self-end">{open ? 'Ocultar dosis' : 'Ver dosis'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 transition-all duration-300 starting:-translate-y-1 starting:opacity-0">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="table w-full text-sm">
              <thead><tr className="bg-[#f1faf8] text-xs text-[#126f7b]"><th>Dosis</th><th>Edad sugerida</th><th>Estado</th><th>Fecha</th><th>Lote</th><th>Lugar</th><th className="w-28 text-center">Acción</th></tr></thead>
              <tbody>
                {vaccine.doses.map((dose) => (
                  <tr key={dose.id} className="transition-colors duration-200 hover:bg-slate-50">
                    <td className="font-bold text-[#29425d]">{dose.reinforcement ? `Dosis ${dose.number} refuerzo` : `Dosis ${dose.number}`}</td>
                    <td>{dose.age}</td>
                    <td><span className={`badge border-0 text-xs font-bold capitalize ${statusStyles[dose.status]}`}>{dose.status.toLowerCase()}</span></td>
                    {(() => {
                      const application = parseApplication(dose.application);
                      return (
                        <>
                          <td className="text-xs text-slate-600">{application.fecha}</td>
                          <td className="text-xs text-slate-600">{application.lote}</td>
                          <td className="text-xs text-slate-600">{application.lugar}</td>
                        </>
                      );
                    })()}
                    <td>{dose.status === 'APLICADA'
                      ? <div className="flex justify-center gap-1"><button type="button" onClick={() => onEdit(vaccine, dose)} className="btn btn-ghost btn-sm text-[#126f7b] transition-all duration-200 active:scale-95" aria-label={`Editar dosis ${dose.number}`}><PencilSquareIcon className="size-4" /></button><button type="button" onClick={() => onDelete(vaccine, dose)} className="btn btn-ghost btn-sm text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95" aria-label={`Eliminar dosis ${dose.number}`}><TrashIcon className="size-4" /></button></div>
                      : <button type="button" onClick={() => onRegister(vaccine, dose)} className="btn btn-sm border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95"><PlusIcon className="size-4" /> Registrar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}

function CartillaVacunacionPage() {
  const navigate = useNavigate();
  const [member] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('vacunacion.cartilla.integrante')) || null;
    } catch {
      return null;
    }
  });
  const idIntegrante = member?.id;
  const fullName = [member?.nombre, member?.apellidoPaterno, member?.apellidoMaterno].filter(Boolean).join(' ') || 'Integrante';
  const parentesco = member?.parentesco ? member.parentesco.replaceAll('_', ' ') : '';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [openVaccines, setOpenVaccines] = useState([]);
  const [page, setPage] = useState(0);
  const [vaccines, setVaccines] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [applicationTarget, setApplicationTarget] = useState(null);
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!member) navigate('/vacunacion', { replace: true });
  }, [member, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setQuerySearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    if (!idIntegrante) {
      return undefined;
    }

    async function loadCartilla() {
      setLoading(true);
      try {
        const response = await getCartillaVacunacion(idIntegrante, {
          page,
          size: pageSize,
          nombreVacuna: querySearch,
          estado: status,
        });
        if (!cancelled) {
          setVaccines((response.content ?? []).map((item) => ({
            id: item.vacuna.id,
            name: item.vacuna.nombre,
            disease: item.vacuna.enfermedadPreviene,
            dosisAplicadas: item.dosisAplicadas,
            esquemaCompleto: item.esquemaCompleto,
            doses: (item.dosis ?? []).map((dose) => ({
              id: dose.id,
              number: dose.numeroDosis,
              age: formatAge(dose.edadRecomendadaMeses),
              status: dose.estado,
              reinforcement: dose.esRefuerzo,
              application: dose.aplicacion,
            })),
          })));
          setPageInfo({
            number: response.page?.number ?? page,
            totalPages: response.page?.totalPages ?? 0,
            totalElements: response.page?.totalElements ?? 0,
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudo cargar la cartilla de vacunación.');
          console.error('Error al cargar cartilla:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCartilla();
    return () => {
      cancelled = true;
    };
  }, [idIntegrante, page, querySearch, status, reloadKey]);

  const totalPages = Math.max(pageInfo.totalPages, 1);

  const handleRegisterApplication = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fechaAplicacion = formData.get('fechaAplicacion');
    const today = new Date();
    const todayPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (fechaAplicacion > todayPrefix) {
      toast.error('La fecha de aplicación no puede ser futura.');
      return;
    }

    setApplicationSubmitting(true);
    try {
      await registerVaccineApplication({
        idIntegrante: Number(idIntegrante),
        idVacuna: Number(applicationTarget.vaccine.id),
        numeroDosis: Number(applicationTarget.dose.number),
        fechaAplicacion,
        lote: formData.get('lote').trim(),
        lugarAplicacion: formData.get('lugarAplicacion').trim(),
      });
      toast.success('Aplicación de vacuna registrada.');
      setApplicationTarget(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('No se pudo registrar la aplicación de vacuna.');
      console.error('Error al registrar aplicación:', error);
    } finally {
      setApplicationSubmitting(false);
    }
  };

  const handleUpdateApplication = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fechaAplicacion = formData.get('fechaAplicacion');
    const today = new Date();
    const todayPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (fechaAplicacion > todayPrefix) {
      toast.error('La fecha de aplicación no puede ser futura.');
      return;
    }

    setApplicationSubmitting(true);
    try {
      await updateVaccineApplication(applicationTarget.dose.application.id, {
        fechaAplicacion,
        lote: formData.get('lote').trim(),
        lugarAplicacion: formData.get('lugarAplicacion').trim(),
      });
      toast.success('Aplicación de vacuna actualizada.');
      setApplicationTarget(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('No se pudo actualizar la aplicación de vacuna.');
      console.error('Error al actualizar aplicación:', error);
    } finally {
      setApplicationSubmitting(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteTarget?.dose?.application?.id) return;
    setDeleteSubmitting(true);
    try {
      await deleteVaccineApplication(deleteTarget.dose.application.id);
      toast.success('Aplicación de vacuna eliminada.');
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('No se pudo eliminar la aplicación de vacuna.');
      console.error('Error al eliminar aplicación:', error);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <button type="button" onClick={() => navigate('/vacunacion')} className="btn btn-ghost btn-sm mb-5 text-[#126f7b] transition-all duration-200 active:scale-95"><ArrowLeftIcon className="size-4" /> Volver a vacunación</button>

        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d4f1eb] to-[#b9e3ee] text-xl font-bold text-[#126f7b]" aria-hidden="true">
              {fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#15919a]">Cartilla individual</p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-[#19304a] sm:text-3xl">{fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {parentesco && <span className="rounded-full bg-[#e5f7f4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#126f7b]">{parentesco}</span>}
                <span className="text-sm text-slate-500">Consulta el progreso y registra las dosis de vacunación.</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#f1faf8] px-4 py-3 text-sm font-semibold text-[#126f7b]">
            <BeakerIcon className="size-5 text-[#15919a]" aria-hidden="true" />
            {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'vacuna' : 'vacunas'}
          </div>
        </section>

        <form onSubmit={(event) => event.preventDefault()} className="card mb-5 border border-slate-200 bg-white shadow-sm">
          <div className="card-body p-5">
            <div className="mb-4 flex items-center gap-2 text-[#19304a]">
              <FunnelIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              <div>
                <h2 className="font-bold">Filtrar vacunas</h2>
                <p className="text-xs font-normal text-slate-500">La búsqueda se actualiza mientras escribes.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
              <label className="input input-bordered flex w-full items-center gap-2 bg-white transition duration-200 hover:border-[#8dd5cd] focus-within:shadow-md focus-within:shadow-[#15919a]/10 focus-within:outline-[#15919a]">
                <MagnifyingGlassIcon className="size-5 shrink-0 text-[#15919a]" aria-hidden="true" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="min-w-0 grow" placeholder="Nombre de la vacuna" />
              </label>
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="select select-bordered w-full bg-white transition duration-200 hover:border-[#8dd5cd] focus:outline-[#15919a]">
                <option value="">Todos los estados</option>
                <option value="APLICADA">Aplicada</option>
                <option value="ATRASADA">Atrasada</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="FUTURA">Futura</option>
              </select>
            </div>
            <div className="mt-3 flex justify-end">
              <button type="button" onClick={() => { setSearch(''); setStatus(''); setPage(0); }} className="btn btn-ghost btn-sm transition-all duration-200 active:scale-95">Limpiar</button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
          ) : vaccines.length === 0 ? (
            <div className="card border border-dashed border-slate-300 bg-white"><div className="card-body items-center py-16 text-center"><BeakerIcon className="size-12 text-slate-300" /><h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay vacunas</h2><p className="text-sm text-slate-500">Prueba con otros filtros de búsqueda.</p></div></div>
          ) : (
            vaccines.map((vaccine) => (
              <VaccineAccordion
                key={vaccine.id}
                vaccine={vaccine}
                open={openVaccines.includes(vaccine.id)}
                onToggle={() => setOpenVaccines((current) => current.includes(vaccine.id) ? current.filter((id) => id !== vaccine.id) : [...current, vaccine.id])}
                onRegister={(selectedVaccine, selectedDose) => setApplicationTarget({ vaccine: selectedVaccine, dose: selectedDose })}
                onEdit={(selectedVaccine, selectedDose) => setApplicationTarget({ vaccine: selectedVaccine, dose: selectedDose, editing: true })}
                onDelete={(selectedVaccine, selectedDose) => setDeleteTarget({ vaccine: selectedVaccine, dose: selectedDose })}
              />
            ))
          )}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{pageInfo.totalElements === 0 ? 0 : pageInfo.number * pageSize + 1}–{Math.min((pageInfo.number + 1) * pageSize, pageInfo.totalElements)} de {pageInfo.totalElements} vacunas</p>
          <div className="join"><button type="button" className="btn btn-sm join-item transition-all duration-200 active:scale-95" disabled={page === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftIcon className="size-4" /> Anterior</button><button type="button" className="btn btn-sm join-item transition-all duration-200 active:scale-95" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Siguiente <ChevronRightIcon className="size-4" /></button></div>
        </div>
      </div>
      <VaccineApplicationModal
        open={applicationTarget !== null}
        vaccine={applicationTarget?.vaccine}
        dose={applicationTarget?.dose}
        memberName={fullName}
        submitting={applicationSubmitting}
        editing={applicationTarget?.editing ?? false}
        onClose={() => setApplicationTarget(null)}
        onSubmit={applicationTarget?.editing ? handleUpdateApplication : handleRegisterApplication}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar aplicación"
        message={`¿Seguro que deseas eliminar la aplicación de ${deleteTarget?.vaccine?.name ?? 'esta vacuna'}, dosis ${deleteTarget?.dose?.number ?? ''}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        loading={deleteSubmitting}
        onConfirm={handleDeleteApplication}
        onCancel={() => !deleteSubmitting && setDeleteTarget(null)}
      />
    </main>
  );
}

export default CartillaVacunacionPage;
