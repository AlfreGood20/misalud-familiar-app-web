import { useEffect, useState } from 'react';
import { LockClosedIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import MedicoCard from '../components/medicos/MedicoCard';
import MedicoFilters from '../components/medicos/MedicoFilters';
import MedicoForm from '../components/medicos/MedicoForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getCurrentUser } from '../services/authService';
import { getEspecialidades } from '../services/especialidadService';
import { createMedico, deleteMedico, getMedicos } from '../services/medicoService';

const emptyMedico = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  especialidadesIds: [],
};

const initialFilters = { busqueda: '', especialidad: '' };

function normalize(text) {
  return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function MedicosPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState(emptyMedico);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        const admin = user?.rol === 'ADMIN';
        setIsAdmin(admin);
        if (!admin) {
          setLoading(false);
          return;
        }

        const [medicosResponse, specialtiesResponse] = await Promise.all([getMedicos(), getEspecialidades()]);
        if (!cancelled) {
          setMedicos(medicosResponse ?? []);
          setSpecialties(specialtiesResponse ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudieron cargar los médicos.');
          console.error('Error al cargar médicos:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const reloadMedicos = async () => {
    try {
      setMedicos(await getMedicos());
    } catch (error) {
      toast.error('No se pudo actualizar la lista de médicos.');
      console.error('Error al recargar médicos:', error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = name === 'telefono' ? value.replace(/\D/g, '').slice(0, 20) : value;
    setFormData((current) => ({ ...current, [name]: normalizedValue }));
  };

  const toggleSpecialty = (id) => {
    setFormData((current) => ({
      ...current,
      especialidadesIds: current.especialidadesIds.includes(id)
        ? current.especialidadesIds.filter((item) => item !== id)
        : [...current.especialidadesIds, id],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.especialidadesIds.length === 0) {
      toast.error('Selecciona al menos una especialidad.');
      return;
    }

    setSubmitting(true);
    try {
      await createMedico({
        ...formData,
        correo: formData.correo.trim() || null,
      });
      toast.success('Médico registrado.');
      setFormVisible(false);
      setFormData(emptyMedico);
      await reloadMedicos();
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar el médico.');
      console.error('Error al crear médico:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await deleteMedico(toDelete.id);
      toast.success('Médico eliminado.');
      setToDelete(null);
      await reloadMedicos();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el médico.');
      console.error('Error al eliminar médico:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const search = normalize(filters.busqueda);
  const visibleMedicos = medicos.filter((medico) => {
    const text = normalize([medico.nombre, medico.apellidoPaterno, medico.apellidoMaterno, medico.telefono, medico.correo].join(' '));
    const matchesText = !search || text.includes(search);
    const matchesSpecialty = !filters.especialidad
      || (medico.especialidades ?? []).some((specialty) => String(specialty.id) === filters.especialidad);
    return matchesText && matchesSpecialty;
  });

  const deleteName = toDelete
    ? [toDelete.nombre, toDelete.apellidoPaterno, toDelete.apellidoMaterno].filter(Boolean).join(' ')
    : '';

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Configuración</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <UserGroupIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Médicos
            </h1>
            <p className="mt-2 text-slate-500">Administra los médicos de tu familia y sus especialidades.</p>
          </div>
          {isAdmin && (
            <button type="button" onClick={() => { setFormData(emptyMedico); setFormVisible(true); }} className="btn border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg active:scale-95">
              <PlusIcon className="size-5" /> Agregar médico
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
        ) : !isAdmin ? (
          <div className="card border border-dashed border-slate-300 bg-white">
            <div className="card-body items-center py-16 text-center">
              <LockClosedIcon className="size-12 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-[#19304a]">Solo el administrador puede gestionar médicos</h2>
              <p className="text-sm text-slate-500">Pídele al administrador de tu familia que registre o elimine médicos.</p>
            </div>
          </div>
        ) : (
          <>
            {formVisible && (
              <div className="mb-6">
                <MedicoForm
                  value={formData}
                  specialties={specialties}
                  submitting={submitting}
                  onChange={handleFormChange}
                  onToggleSpecialty={toggleSpecialty}
                  onSubmit={handleSubmit}
                  onCancel={() => setFormVisible(false)}
                />
              </div>
            )}

            <MedicoFilters
              filters={filters}
              specialties={specialties}
              onChange={handleFilterChange}
              onClear={() => setFilters(initialFilters)}
            />

            <div className="mt-8">
              {visibleMedicos.length === 0 ? (
                <div className="card border border-dashed border-slate-300 bg-white">
                  <div className="card-body items-center py-16 text-center">
                    <UserGroupIcon className="size-12 text-slate-300" />
                    <h2 className="mt-3 text-lg font-bold text-[#19304a]">
                      {medicos.length === 0 ? 'No hay médicos registrados' : 'Sin resultados'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {medicos.length === 0 ? 'Agrega un médico para poder asignarlo a tus consultas.' : 'Prueba con otros filtros de búsqueda.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleMedicos.map((medico) => (
                    <MedicoCard key={medico.id} medico={medico} onDelete={setToDelete} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar médico"
        message={`¿Seguro que deseas eliminar a ${deleteName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => !actionLoading && setToDelete(null)}
      />
    </main>
  );
}

export default MedicosPage;
