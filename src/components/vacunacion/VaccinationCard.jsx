import {
  CalendarDaysIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

function formatDate(value) {
  if (!value) return 'Sin información';
  const [year, month, day] = value.slice(0, 10).split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function displayValue(value) {
  return value ? value.replaceAll('_', ' ') : 'Sin información';
}

function getAge(fechaNacimiento) {
  if (!fechaNacimiento) return 'Edad sin definir';
  const birthDate = new Date(`${fechaNacimiento.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return 'Edad sin definir';

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (today.getDate() < birthDate.getDate()) months = Math.max(months - 1, 0);

  if (years > 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  if (months > 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;

  const days = Math.max(Math.floor((today - birthDate) / 86400000), 0);
  return `${days} ${days === 1 ? 'día' : 'días'}`;
}

function formatBloodType(value) {
  if (!value) return 'Sin definir';
  return value.replaceAll('_', ' ').replace(' POSITIVO', '+').replace(' NEGATIVO', '-');
}

function VaccinationCard({ member, onOpen }) {
  const fullName = [member.nombre, member.apellidoPaterno, member.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => onOpen(member)}
      className="group card min-h-72 cursor-pointer border border-slate-200 bg-white text-left shadow-sm transition duration-300 starting:translate-y-3 starting:opacity-0 hover:-translate-y-1 hover:border-[#8dd5cd] hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#15919a] focus:ring-offset-2"
    >
      <div className="card-body p-6">
        <div className="flex items-start gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b] ring-1 ring-[#15919a]/10">
            <UserCircleIcon className="size-9" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Cartilla de vacunación</p>
            <h2 className="mt-1 text-xl font-bold leading-tight text-[#19304a]">{fullName}</h2>
            <span className="mt-2 inline-flex rounded-full bg-[#f1faf8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#126f7b]">
              {displayValue(member.parentesco)}
            </span>
          </div>
          <ChevronRightIcon className="size-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#15919a]" />
        </div>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          {displayValue(member.parentesco)} • {getAge(member.fechaNacimiento)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDaysIcon className="size-4 text-[#15919a]" aria-hidden="true" />
              Fecha de nacimiento
            </p>
            <p className="mt-1 text-sm font-bold text-[#19304a]">{formatDate(member.fechaNacimiento)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-base leading-none" aria-hidden="true">🩸</span>
              Tipo de sangre
            </p>
            <p className="mt-1 text-sm font-bold text-[#19304a]">{formatBloodType(member.tipoSangre)}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-500">Consultar historial de vacunas</span>
          <span className="flex items-center gap-1 text-sm font-bold text-[#126f7b]">
            Abrir cartilla <ChevronRightIcon className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

export default VaccinationCard;
