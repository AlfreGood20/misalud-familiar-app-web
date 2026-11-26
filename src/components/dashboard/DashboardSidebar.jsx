import { useEffect, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  BellAlertIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import useStockAlerts from '../stock/useStockAlerts';
import useVaccineAlerts from '../vacunacion/useVaccineAlerts';

const navigationItems = [
  { label: 'Resumen', icon: HomeIcon, to: '/dashboard' },
  { label: 'Integrantes', icon: UserGroupIcon, to: '/integrantes' },
  { label: 'Cuidadores', icon: ShieldCheckIcon, to: '/cuidadores' },
  { label: 'Consultas médicas', icon: CalendarDaysIcon, to: '/consultas' },
  { label: 'Médicos', icon: IdentificationIcon, to: '/medicos', adminOnly: true },
  { label: 'Medicamentos', icon: CubeIcon, to: '/medicamentos' },
  { label: 'Recetas y tomas', icon: DocumentTextIcon, to: '/recetas', adminOnly: true },
  { label: 'Stock', icon: ArchiveBoxIcon, to: '/stock' },
  { label: 'Vacunación', icon: BeakerIcon, to: '/vacunacion' },
  { label: 'Estudios de laboratorio', icon: ChartBarIcon, to: '/estudios', adminOnly: true },
  { label: 'Alertas', icon: BellAlertIcon, href: '/stock' },
];

function DashboardSidebar({ familyName, onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { alerts } = useStockAlerts();
  const { alerts: vaccineAlerts } = useVaccineAlerts();
  const alertCount = alerts.length + vaccineAlerts.length;

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((result) => {
      if (!cancelled) setUser(result);
    }).catch((error) => {
      if (!cancelled) {
        console.error('Error al cargar el usuario autenticado:', error);
      }
    });

    return () => { cancelled = true; };
  }, []);

  const visibleItems = navigationItems.filter((item) => !item.adminOnly || user?.rol === 'ADMIN');

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#0b2c3d] bg-gradient-to-b from-[#134660] to-[#0b2c3d] shadow-xl shadow-[#0b2c3d]/20 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r lg:border-[#0b2c3d]">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5 text-lg font-bold tracking-tight text-white lg:px-7">
        <img src="/logo-icon.svg" alt="MiSalud Familiar" className="size-9 rounded-xl" />
        MiSalud Familiar
      </div>

      <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto lg:overflow-x-hidden lg:px-4" aria-label="Navegación principal">
        <p className="hidden px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Menú principal</p>
        {visibleItems.map((item) => item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 active:scale-95 lg:w-full ${
              isActive ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`size-5 ${isActive ? 'text-[#7fe0d4]' : 'text-slate-400 group-hover:text-[#7fe0d4]'}`} aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => item.href && navigate(item.href)}
            className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white active:scale-95 lg:w-full"
          >
            <item.icon className="size-5 text-slate-400 group-hover:text-[#7fe0d4]" aria-hidden="true" />
            <span className="whitespace-nowrap">{item.label}</span>
            {item.label === 'Alertas' && alertCount > 0 && (
              <span className="badge badge-sm ml-auto bg-[#fff3df] text-[#bd7419]">{alertCount}</span>
            )}
          </button>
        ))}

        <p className="hidden px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Configuración</p>
        <button type="button" className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white active:scale-95 lg:w-full">
          <Cog6ToothIcon className="size-5 text-slate-400 group-hover:text-[#7fe0d4]" aria-hidden="true" />
          Configuración
        </button>
      </nav>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-200 active:scale-95">
          <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
      <button type="button" onClick={onLogout} className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/15 hover:text-red-200 lg:hidden">
        <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default DashboardSidebar;
