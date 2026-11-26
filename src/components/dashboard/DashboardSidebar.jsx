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
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, postLogout } from '../../services/authService';
import {
  ALERT_COUNT_UPDATED_EVENT,
  getUnreadAlertCount,
} from '../../services/alertService';

const navigationItems = [
  { label: 'Resumen', icon: HomeIcon, to: '/dashboard' },
  { label: 'Integrantes', icon: UserGroupIcon, to: '/integrantes' },
  { label: 'Consultas médicas', icon: CalendarDaysIcon, to: '/consultas' },
  { label: 'Médicos', icon: IdentificationIcon, to: '/medicos'},
  { label: 'Medicamentos', icon: CubeIcon, to: '/medicamentos' },
  { label: 'Recetas y tomas', icon: DocumentTextIcon, to: '/recetas'},
  { label: 'Stock', icon: ArchiveBoxIcon, to: '/stock' },
  { label: 'Vacunación', icon: BeakerIcon, to: '/vacunacion' },
  { label: 'Estudios de laboratorio', icon: ChartBarIcon, to: '/estudios' },
  { label: 'Alertas', icon: BellAlertIcon, to: '/alertas' },
];

function DashboardSidebar({ familyName, onLogout }) {
  const [user, setUser] = useState(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await postLogout();
      onLogout();
    } catch (error) {
      toast.error(error.message || 'No se pudo cerrar la sesión.');
      console.error('Error al cerrar sesión:', error);
      setLoggingOut(false);
    }
  };

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

  useEffect(() => {
    let cancelled = false;
    const handleCountUpdated = (event) => {
      if (Number.isInteger(event.detail) && event.detail >= 0) {
        setUnreadAlertCount(event.detail);
      }
    };

    window.addEventListener(ALERT_COUNT_UPDATED_EVENT, handleCountUpdated);
    getUnreadAlertCount()
      .then((count) => {
        if (!cancelled) setUnreadAlertCount(count);
      })
      .catch((error) => {
        if (!cancelled) console.error('Error al cargar el contador de alertas no leídas:', error);
      });

    return () => {
      cancelled = true;
      window.removeEventListener(ALERT_COUNT_UPDATED_EVENT, handleCountUpdated);
    };
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
        {visibleItems.map((item) => (
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
                {item.label === 'Alertas' && unreadAlertCount !== null && (
                  <span className="badge badge-sm ml-auto bg-[#fff3df] text-[#bd7419]">{unreadAlertCount}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <p className="hidden px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Configuración</p>
        <NavLink
          to="/configuracion"
          className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 active:scale-95 lg:w-full ${
            isActive ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {({ isActive }) => (
            <>
              <Cog6ToothIcon className={`size-5 ${isActive ? 'text-[#7fe0d4]' : 'text-slate-400 group-hover:text-[#7fe0d4]'}`} aria-hidden="true" />
              Configuración
            </>
          )}
        </NavLink>
      </nav>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-200 active:scale-95">
          {loggingOut ? <span className="loading loading-spinner loading-sm" /> : <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />}
          {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
      <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/15 hover:text-red-200 lg:hidden">
        {loggingOut ? <span className="loading loading-spinner loading-sm" /> : <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />}
        {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
    </aside>
  );
}

export default DashboardSidebar;
