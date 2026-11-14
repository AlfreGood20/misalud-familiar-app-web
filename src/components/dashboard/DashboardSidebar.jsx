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
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';

const navigationItems = [
  { label: 'Resumen', icon: HomeIcon, to: '/dashboard' },
  { label: 'Integrantes', icon: UserGroupIcon, to: '/integrantes' },
  { label: 'Cuidadores', icon: ShieldCheckIcon, to: '/cuidadores' },
  { label: 'Consultas médicas', icon: CalendarDaysIcon, to: '/consultas' },
  { label: 'Medicamentos', icon: CubeIcon, to: '/medicamentos' },
  { label: 'Stock', icon: ArchiveBoxIcon, to: '/stock' },
  { label: 'Vacunas', icon: BeakerIcon },
  { label: 'Estudios de laboratorio', icon: ChartBarIcon },
  { label: 'Alertas', icon: BellAlertIcon, badge: 1 },
];

function DashboardSidebar({ familyName, onLogout }) {
  const [user, setUser] = useState(null);

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

  const fullName = user
    ? [user.nombre, user.apellidoPaterno, user.apellidoMaterno].filter(Boolean).join(' ')
    : familyName || 'Usuario';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=d4f1eb&color=126f7b&bold=true`;
  const role = user?.rol?.replaceAll('_', ' ') || 'Administrador';

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5 text-lg font-bold tracking-tight text-[#19304a] lg:px-7">
        <img src="/logo-icon.svg" alt="MiSalud Familiar" className="size-9 rounded-xl" />
        MiSalud Familiar
      </div>

      <div className="hidden px-5 py-5 lg:block">
        <div className="flex items-center gap-3 rounded-2xl bg-[#f1faf8] p-3">
          <img src={avatarUrl} alt={`Avatar de ${fullName}`} className="size-10 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#19304a]">{role}</p>
            <p className="truncate text-xs text-slate-500">{user?.correo || 'Sesión activa'}</p>
          </div>
        </div>
      </div>

      <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto lg:overflow-x-hidden lg:px-4" aria-label="Navegación principal">
        <p className="hidden px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Menú principal</p>
        {navigationItems.map((item) => item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition lg:w-full ${
              isActive ? 'bg-[#e5f7f4] text-[#126f7b]' : 'text-slate-500 hover:bg-slate-50 hover:text-[#126f7b]'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`size-5 ${isActive ? 'text-[#15919a]' : 'text-slate-400 group-hover:text-[#15919a]'}`} aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ) : (
          <button
            key={item.label}
            type="button"
            className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#126f7b] lg:w-full"
          >
            <item.icon className="size-5 text-slate-400 group-hover:text-[#15919a]" aria-hidden="true" />
            <span className="whitespace-nowrap">{item.label}</span>
            {item.badge && <span className="badge badge-sm ml-auto bg-[#fff3df] text-[#bd7419]">{item.badge}</span>}
          </button>
        ))}

        <p className="hidden px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Configuración</p>
        <button type="button" className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#126f7b] lg:w-full">
          <Cog6ToothIcon className="size-5 text-slate-400 group-hover:text-[#15919a]" aria-hidden="true" />
          Configuración
        </button>
      </nav>

      <div className="hidden border-t border-slate-100 p-4 lg:block">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600">
          <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
      <button type="button" onClick={onLogout} className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 lg:hidden">
        <ArrowRightOnRectangleIcon className="size-5" aria-hidden="true" />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default DashboardSidebar;
