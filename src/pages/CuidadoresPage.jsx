import { useEffect, useState } from 'react';
import { PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import CaregiverCard from '../components/cuidadores/CaregiverCard';
import CaregiverDetailsModal from '../components/cuidadores/CaregiverDetailsModal';
import CaregiverForm from '../components/cuidadores/CaregiverForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  createCuidador, deleteCuidador, getCuidadorById, getCuidadores, updateCuidador, updateCuidadorEstado,
} from '../services/caregiverService';

const emptyCaregiver = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  contrasena: '',
};

const getCaregiverId = (caregiver) => caregiver.idCuidador ?? caregiver.id;

function CuidadoresPage() {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState(emptyCaregiver);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCaregivers = async () => {
    try {
      setCaregivers(await getCuidadores());
    } catch (error) {
      toast.error('No se pudieron cargar los cuidadores.');
      console.error('Error al cargar cuidadores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getCuidadores().then((result) => {
      if (!cancelled) setCaregivers(result);
    }).catch((error) => {
      if (!cancelled) {
        toast.error('No se pudieron cargar los cuidadores.');
        console.error('Error al cargar cuidadores:', error);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingCaregiver) {
        await updateCuidador(getCaregiverId(editingCaregiver), formData);
        toast.success('Cuidador actualizado.');
      } else {
        await createCuidador(formData);
        toast.success('Cuidador creado.');
      }
      setFormVisible(false);
      setEditingCaregiver(null);
      setFormData(emptyCaregiver);
      await loadCaregivers();
    } catch (error) {
      toast.error(error.message || (editingCaregiver ? 'No se pudo actualizar el cuidador.' : 'No se pudo crear el cuidador.'));
      console.error(editingCaregiver ? 'Error al actualizar cuidador:' : 'Error al crear cuidador:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const askStatusChange = (caregiver) => {
    const nextStatus = caregiver.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setConfirmation({
      type: 'status',
      id: getCaregiverId(caregiver),
      nextStatus,
      title: nextStatus === 'ACTIVO' ? 'Activar cuidador' : 'Inactivar cuidador',
      message: `¿Seguro que deseas ${nextStatus === 'ACTIVO' ? 'activar' : 'poner como inactivo'} a ${caregiver.nombre}?`,
      confirmLabel: nextStatus === 'ACTIVO' ? 'Activar' : 'Poner inactivo',
      loadingLabel: nextStatus === 'ACTIVO' ? 'Activando...' : 'Actualizando...',
    });
  };

  const askDelete = (caregiver) => {
    setConfirmation({
      type: 'delete',
      id: getCaregiverId(caregiver),
      title: 'Eliminar cuidador',
      message: `¿Seguro que deseas eliminar a ${caregiver.nombre || 'este cuidador'}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      loadingLabel: 'Eliminando...',
    });
    setSelectedCaregiver(null);
  };

  const handleEditCaregiver = (caregiver) => {
    setFormData({
      nombre: caregiver.nombre ?? '',
      apellidoPaterno: caregiver.apellidoPaterno ?? '',
      apellidoMaterno: caregiver.apellidoMaterno ?? '',
      correo: caregiver.correo ?? '',
      telefono: caregiver.telefono ?? '',
      contrasena: '',
    });
    setEditingCaregiver(caregiver);
    setSelectedCaregiver(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormVisible(false);
    setEditingCaregiver(null);
    setFormData(emptyCaregiver);
  };

  const handleShowDetails = async (caregiver) => {
    const id = caregiver.idCuidador ?? caregiver.id;
    if (id === undefined || id === null) {
      toast.error('No se pudo identificar al cuidador.');
      return;
    }

    setSelectedCaregiver(caregiver);
    setDetailsLoading(true);
    try {
      setSelectedCaregiver(await getCuidadorById(id));
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los detalles del cuidador.');
      console.error('Error al cargar detalles del cuidador:', error);
      setSelectedCaregiver(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmation) return;
    setActionLoading(true);
    try {
      if (confirmation.type === 'status') {
        // CONSUMO DE API: PATCH /usuarios/cuidadores/{idCuidador}/estado.
        await updateCuidadorEstado(confirmation.id, confirmation.nextStatus);
        toast.success('Estado del cuidador actualizado.');
      } else {
        // CONSUMO DE API: DELETE /usuarios/cuidadores/{idCuidador}.
        await deleteCuidador(confirmation.id);
        toast.success('Cuidador eliminado.');
      }
      setConfirmation(null);
      await loadCaregivers();
    } catch (error) {
      toast.error(confirmation.type === 'status'
        ? 'No se pudo actualizar el estado.'
        : 'No se pudo eliminar el cuidador.');
      console.error('Error en acción de cuidador:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Configuración</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-[#19304a]">
              <ShieldCheckIcon className="size-8 text-[#15919a]" /> Cuidadores
            </h1>
            <p className="mt-2 text-slate-500">Administra quién puede ayudarte a cuidar la salud familiar.</p>
          </div>
          <button onClick={() => { setEditingCaregiver(null); setFormData(emptyCaregiver); setFormVisible(true); }} className="btn transition-all duration-200 active:scale-95 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg">
            <PlusIcon className="size-5" /> Agregar cuidador
          </button>
        </div>
        {formVisible && (
          <CaregiverForm
            value={formData}
            editing={editingCaregiver !== null}
            submitting={submitting}
            onChange={(event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        )}
        {loading ? (
          <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
        ) : caregivers.length === 0 ? (
          <div className="card bg-white"><div className="card-body items-center py-16 text-center">
            <ShieldCheckIcon className="size-12 text-slate-300" />
            <h2 className="text-lg font-bold">No hay cuidadores registrados</h2>
            <p className="text-sm text-slate-500">Agrega una persona de confianza para comenzar.</p>
          </div></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {caregivers.map((caregiver) => (
              <CaregiverCard key={getCaregiverId(caregiver)} caregiver={caregiver} onToggleStatus={askStatusChange} onDetails={handleShowDetails} />
            ))}
          </div>
        )}
      </div>
      <CaregiverDetailsModal
        key={`${selectedCaregiver?.idCuidador ?? selectedCaregiver?.id ?? 'caregiver'}-${detailsLoading ? 'loading' : 'loaded'}`}
        caregiver={selectedCaregiver}
        loading={detailsLoading}
        onClose={() => setSelectedCaregiver(null)}
        onEdit={handleEditCaregiver}
        onDelete={askDelete}
      />
      <ConfirmDialog
        open={confirmation !== null}
        title={confirmation?.title}
        message={confirmation?.message}
        confirmLabel={confirmation?.confirmLabel}
        loadingLabel={confirmation?.loadingLabel}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => !actionLoading && setConfirmation(null)}
      />
    </main>
  );
}

export default CuidadoresPage;
