import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import MemberCard from '../components/dashboard/MemberCard';
import MemberDetails from '../components/dashboard/MemberDetails';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import StockAlertsPanel from '../components/dashboard/StockAlertsPanel';
import useStockAlerts from '../components/stock/useStockAlerts';
import VaccineAlertsPanel from '../components/dashboard/VaccineAlertsPanel';
import useVaccineAlerts from '../components/vacunacion/useVaccineAlerts';
import { getDashboardData } from '../services/dashboardService';

const TOMA_STYLES = {
  TOMADA: { label: 'Completada', className: 'bg-[#e5f7f4] text-[#117b7b]' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-[#fff3df] text-[#bd7419]' },
  OMITIDA: { label: 'Omitida', className: 'bg-[#ffebeb] text-[#c84b55]' },
};

const CONSULTA_STYLES = {
  PROGRAMADA: { label: 'Programada', className: 'bg-[#eaf2ff] text-[#3a67ad]' },
  REALIZADA: { label: 'Realizada', className: 'bg-[#e5f7f4] text-[#117b7b]' },
  CANCELADA: { label: 'Cancelada', className: 'bg-[#ffebeb] text-[#c84b55]' },
};

const KPI_TONES = {
  teal: 'bg-[#e5f7f4] text-[#117b7b]',
  blue: 'bg-[#eaf2ff] text-[#3a67ad]',
  orange: 'bg-[#fff3df] text-[#bd7419]',
};

function MetricGroupCard({ icon, title, context, metrics, tone = 'teal' }) {
  return (
    <article className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${KPI_TONES[tone]}`}>
            {icon}
          </span>
          <div>
            <h2 className="font-bold text-[#19304a]">{title}</h2>
            <p className="text-xs text-slate-400">{context}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#19304a]">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function TodayTakesCard({ completed, total }) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <article className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#117b7b]">
            <ClockIcon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-[#19304a]">Tomas de hoy</h2>
            <p className="text-xs text-slate-400">Completadas de las programadas</p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-bold text-[#19304a]">
            {completed}<span className="text-xl text-slate-400">/{total}</span>
          </p>
          <p className="text-sm font-bold text-[#117b7b]">{percentage}%</p>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Porcentaje de tomas completadas hoy"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full rounded-full bg-[#15919a] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircleIcon className="size-4 text-[#15919a]" aria-hidden="true" />
          {completed} completadas de {total} programadas
        </p>
      </div>
    </article>
  );
}

function formatEnum(value) {
  if (typeof value !== 'string' || !value) return 'Sin información';
  const formatted = value.toLowerCase().replaceAll('_', ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatBloodType(value) {
  if (typeof value !== 'string' || !value) return 'Sin información';
  if (value.endsWith('_POSITIVO')) return `${value.replace('_POSITIVO', '')}+`;
  if (value.endsWith('_NEGATIVO')) return `${value.replace('_NEGATIVO', '')}-`;
  return formatEnum(value);
}

function formatDate(value, options = { dateStyle: 'long' }) {
  if (typeof value !== 'string' || !value) return 'Sin información';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return 'Sin información';
  return new Intl.DateTimeFormat('es-MX', options).format(date);
}

function formatTime(value) {
  if (typeof value !== 'string' || !value) return 'Hora sin definir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Hora sin definir';
  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function calculateAge(birthDate) {
  if (typeof birthDate !== 'string' || !birthDate) return null;
  const date = new Date(`${birthDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let age = today.getFullYear() - date.getFullYear();
  let months = today.getMonth() - date.getMonth();
  if (today.getDate() < date.getDate()) months -= 1;
  if (months < 0) {
    age -= 1;
    months += 12;
  }
  if (age < 0) return null;
  if (age > 0) return `${age} ${age === 1 ? 'año' : 'años'}`;
  if (months > 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;

  const days = Math.floor((today.getTime() - date.getTime()) / 86400000);
  return `${days} ${days === 1 ? 'día' : 'días'}`;
}

function prepareMember(member) {
  return {
    ...member,
    nombre: [member.nombre, member.apellidoPaterno, member.apellidoMaterno].filter(Boolean).join(' '),
    parentesco: formatEnum(member.parentesco),
    edad: calculateAge(member.fechaNacimiento),
    fechaNacimiento: formatDate(member.fechaNacimiento),
    fechaRegistro: formatDate(member.fechaRegistro),
    tipoSangre: formatBloodType(member.tipoSangre),
    sexo: formatEnum(member.sexo),
    alertas: 0,
  };
}

function getStatusPresentation(status, styles) {
  return styles[status] ?? {
    label: formatEnum(status),
    className: 'bg-slate-100 text-slate-600',
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { alerts: stockAlerts, loading: stockAlertsLoading } = useStockAlerts();
  const { alerts: vaccineAlerts, loading: vaccineAlertsLoading } = useVaccineAlerts();

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleLogout = () => {
    navigate('/', { replace: true });
  };

  const retryDashboard = () => {
    setLoading(true);
    setError(null);
    setReloadKey((current) => current + 1);
  };

  const familyName = dashboard?.nombreFamilia?.trim() || 'MiSalud Familiar';
  const familyLabel = /^familia(?:\s|$)/i.test(familyName) ? familyName : `Familia ${familyName}`;
  const members = dashboard?.integrantes.map(prepareMember) ?? [];

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName={familyName} onLogout={handleLogout} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        {loading ? (
          <div className="flex min-h-96 items-center justify-center" role="status" aria-label="Cargando dashboard">
            <span className="loading loading-spinner loading-lg text-[#15919a]" />
          </div>
        ) : error ? (
          <div className="alert alert-error mx-auto mt-12 max-w-2xl">
            <ExclamationTriangleIcon className="size-6 shrink-0" aria-hidden="true" />
            <div>
              <h1 className="font-bold">No se pudo cargar el dashboard</h1>
              <p className="text-sm">{error}</p>
            </div>
            <button type="button" className="btn btn-sm" onClick={retryDashboard}>Reintentar</button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#15919a]">Panel principal</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#19304a]">
                  ¡Hola, {familyLabel}! <span aria-hidden="true">👋</span>
                </h1>
                <p className="mt-2 text-slate-500">Aquí tienes un resumen del cuidado de tu familia.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/consultas', { state: { openCreateConsulta: true } })}
                  className="btn transition-all duration-200 active:scale-95 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg"
                >
                  <PlusIcon className="size-5" aria-hidden="true" /> Agendar Cita
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/recetas', { state: { openCreateReceta: true } })}
                  className="btn border border-[#126f7b] bg-white text-[#126f7b] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f1faf8] active:scale-95"
                >
                  <PlusIcon className="size-5" aria-hidden="true" /> Nueva Receta
                </button>
              </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Resumen familiar">
              <MetricGroupCard
                icon={<HeartIcon className="size-6" />}
                title="Familia"
                context="Resumen familiar"
                metrics={[
                  { label: 'Integrantes', value: dashboard.kpis.integrantesRegistrados },
                  { label: 'Consultas pendientes', value: dashboard.kpis.consultasPendientes },
                ]}
              />
              <MetricGroupCard
                icon={<CubeIcon className="size-6" />}
                title="Medicamentos"
                context="Inventario familiar"
                tone="orange"
                metrics={[
                  { label: 'En stock', value: dashboard.kpis.medicamentosEnStock },
                  { label: 'Por caducar', value: dashboard.kpis.medicamentosPorCaducar },
                ]}
              />
              <TodayTakesCard
                completed={dashboard.kpis.tomasHoyCompletadas}
                total={dashboard.kpis.tomasHoyTotales}
              />
            </section>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <StockAlertsPanel alerts={stockAlerts} loading={stockAlertsLoading} />
              <VaccineAlertsPanel alerts={vaccineAlerts} loading={vaccineAlertsLoading} />
            </div>

            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Tomas de hoy">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-bold text-[#19304a]">
                        <ClockIcon className="size-6 text-[#15919a]" aria-hidden="true" /> Tomas de hoy
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {dashboard.kpis.tomasHoyCompletadas} de {dashboard.kpis.tomasHoyTotales} completadas
                      </p>
                    </div>
                    <Link to="/recetas" className="btn btn-ghost btn-sm text-[#126f7b]">
                      Ver recetas
                    </Link>
                  </div>
                  {dashboard.tomasDeHoy.length === 0 ? (
                    <p className="rounded-xl bg-[#f1faf8] p-4 text-sm text-[#126f7b]">
                      No hay tomas programadas para hoy.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {dashboard.tomasDeHoy.map((toma) => {
                        const status = getStatusPresentation(toma.estado, TOMA_STYLES);
                        return (
                          <li key={toma.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#19304a]">
                                {toma.nombreMedicamento} {toma.concentracion && `· ${toma.concentracion}`}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {toma.nombreIntegrante} · Dosis {toma.dosis}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className={`badge badge-sm ${status.className}`}>{status.label}</span>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatTime(toma.fechaHoraProgramada)}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>

              <section className="card border border-slate-200 bg-white shadow-sm" aria-label="Próximas consultas">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-bold text-[#19304a]">
                        <CalendarDaysIcon className="size-6 text-[#15919a]" aria-hidden="true" /> Próximas consultas
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">Las siguientes citas médicas de tu familia.</p>
                    </div>
                    <Link to="/consultas" className="btn btn-ghost btn-sm text-[#126f7b]">
                      Ver consultas
                    </Link>
                  </div>
                  {dashboard.proximasConsultas.length === 0 ? (
                    <p className="rounded-xl bg-[#f1faf8] p-4 text-sm text-[#126f7b]">
                      No hay consultas próximas registradas.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {dashboard.proximasConsultas.map((consulta) => {
                        const status = getStatusPresentation(consulta.estado, CONSULTA_STYLES);
                        return (
                          <li key={consulta.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#19304a]">{consulta.motivo}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {consulta.nombrePaciente} · Dr. {consulta.nombreMedico}
                              </p>
                              <p className="mt-1 text-xs font-medium text-[#126f7b]">
                                {formatDate(consulta.fechaConsulta, { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                            <span className={`badge badge-sm shrink-0 ${status.className}`}>{status.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#19304a]">Integrantes de la familia</h2>
                  <p className="mt-1 text-sm text-slate-500">Selecciona una persona para consultar sus datos.</p>
                </div>
                <ClipboardDocumentListIcon className="size-7 text-[#15919a]" aria-hidden="true" />
              </div>
              {members.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                  Aún no hay integrantes registrados.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {members.map((member) => (
                    <MemberCard key={member.id} member={member} onSelect={setSelectedMember} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <MemberDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </main>
  );
}

export default DashboardPage;
