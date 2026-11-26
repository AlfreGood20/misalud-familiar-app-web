import {
  ChevronRightIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const settingsSections = [
  {
    title: 'Perfil y seguridad',
    description: 'Administra tu información personal, contraseña y opciones de seguridad.',
    icon: <UserCircleIcon className="size-6" aria-hidden="true" />,
    to: '/configuracion/perfil',
  },
  {
    title: 'Familia y hogar',
    description: 'Configura la información general de tu familia y hogar.',
    icon: <HomeIcon className="size-6" aria-hidden="true" />,
  },
];

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#15919a]">Preferencias</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
            <Cog6ToothIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Configuración
          </h1>
          <p className="mt-2 text-slate-500">Gestiona las opciones de tu cuenta y los accesos de tu familia.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settingsSections.map(({ title, description, icon, to }) => {
            const content = (
              <div className="card-body">
                <span className={`grid size-12 place-items-center rounded-2xl ${to ? 'bg-[#e5f7f4] text-[#126f7b]' : 'bg-slate-100 text-slate-400'}`}>
                  {icon}
                </span>
                <h2 className="mt-2 flex items-center justify-between text-lg font-bold text-[#19304a]">
                  {title}
                  {to && <ChevronRightIcon className="size-5 text-[#15919a]" aria-hidden="true" />}
                </h2>
                <p className="text-sm leading-6 text-slate-500">{description}</p>
                {!to && <span className="badge mt-2 w-fit border-0 bg-slate-100 text-slate-500">Próximamente</span>}
              </div>
            );

            return to ? (
              <Link key={title} to={to} className="card border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
                {content}
              </Link>
            ) : (
              <article key={title} className="card border border-slate-200 bg-white shadow-sm">
                {content}
              </article>
            );
          })}

          <Link to="/configuracion/cuidadores" className="card border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
            <div className="card-body">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b]">
                <ShieldCheckIcon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-2 flex items-center justify-between text-lg font-bold text-[#19304a]">
                Acceso de cuidadores
                <ChevronRightIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              </h2>
              <p className="text-sm leading-6 text-slate-500">Invita y administra a las personas que pueden ayudarte a cuidar la salud familiar.</p>
              <span className="btn mt-2 w-fit border-0 bg-[#126f7b] text-white">Administrar cuidadores</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
