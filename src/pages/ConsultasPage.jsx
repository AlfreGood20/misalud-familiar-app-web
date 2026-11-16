import { useEffect, useState } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ConsultaCard from '../components/consultas/ConsultaCard';
import ConsultaDetailsModal from '../components/consultas/ConsultaDetailsModal';
import ConsultaFormModal from '../components/consultas/ConsultaFormModal';
import ConcludeConsultaModal from '../components/consultas/ConcludeConsultaModal';
import ConsultaFilters from '../components/consultas/ConsultaFilters';
import { getIntegrantes } from '../services/memberService';
import { getMedicos } from '../services/medicoService';
import {
  cancelConsulta, concludeConsulta, createConsulta, getConsultaById, getConsultas, updateConsulta,
} from '../services/consultaService';

const initialFilters = {
  busqueda: '',
  integrante: '',
  medico: '',
  estado: '',
  fechaDesde: '',
  fechaHasta: '',
};

function formatConsultaDate(value) {
  const [date, time] = value.split('T');
  const [hours, minutes] = time.split(':');
  const numericHours = Number(hours);
  const period = numericHours >= 12 ? 'PM' : 'AM';
  const displayHours = numericHours % 12 || 12;

  return `${date} ${displayHours}:${minutes}${period}`;
}

function isTodayOrFuture(value) {
  return new Date(value).getTime() >= Date.now();
}

function isFutureDate(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`).getTime() > today.getTime();
}

function ConsultasPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [integrantes, setIntegrantes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [consultasLoading, setConsultasLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [concludeOpen, setConcludeOpen] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      try {
        const [integrantesResponse, medicosResponse] = await Promise.all([
          getIntegrantes(),
          getMedicos(),
        ]);

        if (!cancelled) {
          setIntegrantes((integrantesResponse ?? []).map((integrante) => ({
            id: integrante.id,
            label: [integrante.nombre, integrante.apellidoPaterno, integrante.apellidoMaterno]
              .filter(Boolean)
              .join(' '),
          })));
          setMedicos((medicosResponse ?? []).map((medico) => ({
            id: medico.id,
            label: [medico.nombre, medico.apellidoPaterno, medico.apellidoMaterno]
              .filter(Boolean)
              .join(' '),
            detail: medico.especialidades?.map((especialidad) => especialidad.nombre).join(', '),
          })));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudieron cargar integrantes y médicos.');
          console.error('Error al cargar catálogos de consultas:', error);
        }
      } finally {
        if (!cancelled) setCatalogsLoading(false);
      }
    }

    loadCatalogs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConsultas() {
      setConsultasLoading(true);
      try {
        const response = await getConsultas({ ...filters, page, size: pageSize });
        if (!cancelled) {
          setConsultas(response.content ?? []);
          setPageInfo({
            number: response.page?.number ?? page,
            totalPages: response.page?.totalPages ?? 0,
            totalElements: response.page?.totalElements ?? 0,
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudieron cargar las consultas.');
          console.error('Error al cargar consultas:', error);
        }
      } finally {
        if (!cancelled) setConsultasLoading(false);
      }
    }

    loadConsultas();
    return () => {
      cancelled = true;
    };
  }, [filters, page, refreshToken]);

  const totalPages = Math.max(pageInfo.totalPages, 1);

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPage(0);
  };

  const handleCheckboxChange = (event) => {
    const { name, value } = event.target;
    const numericValue = Number(value);
    setFilters((current) => {
      if (event.target.checked && current[name] && current[name] !== numericValue) {
        return current;
      }

      return {
        ...current,
        [name]: event.target.checked ? numericValue : '',
      };
    });
    setPage(0);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setPage(0);
  };

  const handleSelectConsulta = async (consulta) => {
    setSelectedConsulta(consulta);
    setDetailLoading(true);
    try {
      const detail = await getConsultaById(consulta.id);
      setSelectedConsulta(detail);
    } catch (error) {
      setSelectedConsulta(null);
      toast.error('No se pudo cargar el detalle de la consulta.');
      console.error('Error al cargar detalle de consulta:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateConsulta = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (!isTodayOrFuture(formData.get('fechaConsulta'))) {
          toast.error('La fecha de consulta debe ser hoy o una fecha futura.');
          return;
        }

        setActionSubmitting(true);
        try {
          await updateConsulta(editingConsulta.id, {
            idIntegrante: Number(formData.get('idIntegrante')),
            idMedico: formData.get('idMedico') ? Number(formData.get('idMedico')) : null,
            fechaConsulta: formatConsultaDate(formData.get('fechaConsulta')),
            motivo: formData.get('motivo').trim(),
          });
          toast.success('Consulta actualizada correctamente.');
          setEditingConsulta(null);
          setSelectedConsulta(null);
          setRefreshToken((current) => current + 1);
        } catch (error) {
          toast.error('No se pudo actualizar la consulta.');
          console.error('Error al actualizar consulta:', error);
        } finally {
          setActionSubmitting(false);
        }
  };

  const handleConcludeConsulta = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const proximaConsulta = formData.get('proximaConsulta');
        if (proximaConsulta && !isFutureDate(proximaConsulta)) {
          toast.error('La próxima consulta debe ser posterior a hoy.');
          return;
        }

        setActionSubmitting(true);
        try {
          await concludeConsulta(selectedConsulta.id, {
            diagnostico: formData.get('diagnostico').trim(),
            notas: formData.get('notas').trim(),
            costo: Number(formData.get('costo')),
            proximaConsulta: proximaConsulta || null,
          });
          toast.success('Consulta concluida correctamente.');
          setConcludeOpen(false);
          setSelectedConsulta(null);
          setRefreshToken((current) => current + 1);
        } catch (error) {
          toast.error('No se pudo concluir la consulta.');
          console.error('Error al concluir consulta:', error);
        } finally {
          setActionSubmitting(false);
        }
  };

  const handleCancelConsulta = async () => {
        setActionSubmitting(true);
        try {
          await cancelConsulta(selectedConsulta.id);
          toast.success('Consulta cancelada correctamente.');
          setSelectedConsulta(null);
          setRefreshToken((current) => current + 1);
        } catch (error) {
          toast.error('No se pudo cancelar la consulta.');
          console.error('Error al cancelar consulta:', error);
        } finally {
          setActionSubmitting(false);
        }
  };

  const handleCreateConsulta = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fechaConsulta = formData.get('fechaConsulta');

    if (!isTodayOrFuture(fechaConsulta)) {
      toast.error('La fecha de consulta debe ser hoy o una fecha futura.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        idIntegrante: Number(formData.get('idIntegrante')),
        idMedico: formData.get('idMedico') ? Number(formData.get('idMedico')) : null,
        fechaConsulta: formatConsultaDate(fechaConsulta),
        motivo: formData.get('motivo').trim(),
      };
      console.log('Payload enviado para crear consulta:', payload);
      await createConsulta(payload);
      toast.success('Consulta creada correctamente.');
      setFormOpen(false);
      setPage(0);
      setRefreshToken((current) => current + 1);
    } catch (error) {
      toast.error('No se pudo crear la consulta.');
      console.error('Error al crear consulta:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Salud familiar</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <CalendarDaysIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Consultas médicas
            </h1>
            <p className="mt-2 text-slate-500">Consulta y organiza las citas médicas de los integrantes de tu familia.</p>
          </div>
          <button type="button" onClick={() => setFormOpen(true)} className="btn transition-all duration-200 active:scale-95 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg">
            <PlusIcon className="size-5" aria-hidden="true" /> Nueva consulta
          </button>
        </div>

        <ConsultaFilters
          filters={filters}
          integrantes={integrantes}
          medicos={medicos}
          catalogsLoading={catalogsLoading}
          onChange={handleFilterChange}
          onCheckboxChange={handleCheckboxChange}
          onClear={handleClear}
        />

        <div className="mt-8">
          {consultasLoading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
          ) : consultas.length === 0 ? (
            <div className="card border border-dashed border-slate-300 bg-white">
              <div className="card-body items-center py-16 text-center">
                <CalendarDaysIcon className="size-12 text-slate-300" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay consultas</h2>
                <p className="text-sm text-slate-500">Prueba con otros filtros de búsqueda.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {consultas.map((consulta) => <ConsultaCard key={consulta.id} consulta={consulta} onSelect={handleSelectConsulta} />)}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <p className="text-sm text-slate-500">Página {pageInfo.number + 1} de {totalPages}</p>
                <div className="join">
                  <button type="button" className="btn transition-all duration-200 active:scale-95 btn-sm join-item" disabled={pageInfo.number === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftIcon className="size-4" /></button>
                  <button type="button" className="btn transition-all duration-200 active:scale-95 btn-sm join-item" disabled={pageInfo.number + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRightIcon className="size-4" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ConsultaDetailsModal
        consulta={selectedConsulta}
        loading={detailLoading}
        actionLoading={actionSubmitting}
        onClose={() => setSelectedConsulta(null)}
        onEdit={() => { setEditingConsulta(selectedConsulta); setSelectedConsulta(null); }}
        onConclude={() => setConcludeOpen(true)}
        onCancel={handleCancelConsulta}
      />
      <ConsultaFormModal
        open={formOpen}
        integrantes={integrantes}
        medicos={medicos}
        submitting={formSubmitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateConsulta}
      />
      <ConsultaFormModal
        key={editingConsulta?.id ?? 'edit-consulta'}
        open={editingConsulta !== null}
        integrantes={integrantes}
        medicos={medicos}
        submitting={actionSubmitting}
        consulta={editingConsulta}
        editing
        onClose={() => setEditingConsulta(null)}
        onSubmit={handleUpdateConsulta}
      />
      <ConcludeConsultaModal
        open={concludeOpen}
        submitting={actionSubmitting}
        onClose={() => setConcludeOpen(false)}
        onSubmit={handleConcludeConsulta}
      />
    </main>
  );
}

export default ConsultasPage;
