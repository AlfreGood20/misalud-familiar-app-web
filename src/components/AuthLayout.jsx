import {
  CalendarDaysIcon,
  CubeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  { icon: UserGroupIcon, title: 'Seguimiento familiar', text: 'Expedientes de cada integrante en un solo lugar.' },
  { icon: CalendarDaysIcon, title: 'Citas y consultas', text: 'Agenda y concluye consultas sin perder el historial.' },
  { icon: CubeIcon, title: 'Botiquín bajo control', text: 'Existencias, mínimos y caducidades al día.' },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
      <img src="/logo-icon.svg" alt="MiSalud Familiar" className="size-9 rounded-xl" />
      <span>MiSalud Familiar</span>
    </div>
  );
}

function AuthLayout({ children, wide = false }) {
  return (
    <main className="grid min-h-screen bg-[#f4f7fb] lg:h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(460px,1.1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#167d83] via-[#12707c] to-[#0b4f68] p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:px-[clamp(36px,6vw,96px)]">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-[#b8f0df]/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-52 -right-44 size-[520px] rounded-full border border-white/15 motion-safe:animate-pulse" aria-hidden="true" />
        <div className="absolute -bottom-32 right-24 size-[260px] rounded-full border border-white/15" aria-hidden="true" />

        <div className="relative z-10 transition-all duration-700 starting:-translate-y-3 starting:opacity-0"><Brand /></div>

        <div className="relative z-10 max-w-[480px] transition-all delay-150 duration-700 starting:translate-y-4 starting:opacity-0">
          <span className="mb-4 block text-xs font-extrabold uppercase tracking-[0.13em] text-[#b8f0df]">
            Cuidado que conecta
          </span>
          <h1 className="max-w-[500px] text-5xl font-bold leading-tight tracking-[-0.06em]">
            Tu familia, su salud, siempre cerca.
          </h1>
          <p className="mt-6 max-w-[425px] text-base leading-7 text-[#d3f3ef]">
            Organiza citas, tratamientos y expedientes médicos en un solo lugar,
            con la tranquilidad de tener todo bajo control.
          </p>

          <ul className="mt-9 space-y-3">
            {features.map((feature) => (
              <li key={feature.title} className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm transition duration-300 hover:translate-x-1 hover:bg-white/15">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-[#b8f0df] transition duration-300 group-hover:scale-110">
                  <feature.icon className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{feature.title}</span>
                  <span className="block text-xs text-[#d3f3ef]">{feature.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 flex items-center gap-1.5 text-xs text-[#b8e6e2]">
          <ShieldCheckIcon className="size-4" aria-hidden="true" /> Información médica protegida
        </p>
      </section>

      <section className={`min-h-screen overflow-y-auto bg-gradient-to-b from-white to-[#f4f7fb] p-6 sm:p-8 ${wide ? '' : 'lg:grid lg:place-items-center'}`}>
        <div className={`mx-auto w-full py-2 transition-all duration-700 starting:translate-y-4 starting:opacity-0 sm:py-4 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <div className="mb-10 text-[#19304a] lg:hidden"><Brand /></div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-[#19304a]/5 sm:p-8">
            {children}
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheckIcon className="size-4 text-[#15919a]" aria-hidden="true" />
            Tus datos se mantienen protegidos y privados.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
