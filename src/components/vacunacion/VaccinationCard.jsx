import {
  CalendarDaysIcon,
  ChevronRightIcon,
  HeartIcon,
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

function getInitials(member) {
  return [member.nombre, member.apellidoPaterno]
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function VaccinationCard({ member, onOpen }) {
  const fullName = [member.nombre, member.apellidoPaterno, member.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => onOpen(member)}
      className="group card cursor-pointer border border-slate-200 bg-white text-left shadow-sm transition duration-300 starting:translate-y-3 starting:opacity-0 hover:-translate-y-1 hover:border-[#8dd5cd] hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#15919a] focus:ring-offset-2"
    >
      <div className="card-body gap-0 p-6">
        <div className="flex items-start gap-4">
          <span
            className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d4f1eb] to-[#b9e3ee] text-xl font-bold text-[#126f7b] transition duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            {getInitials(member)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Cartilla de vacunación</p>
            <h2 className="mt-1 truncate text-xl font-bold leading-tight text-[#19304a]" title={fullName}>{fullName}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#e5f7f4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#126f7b]">
                {displayValue(member.parentesco)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {getAge(member.fechaNacimiento)}
              </span>
            </div>
          </div>
          <ChevronRightIcon className="size-5 shrink-0 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-[#15919a]" />
        </div>

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
              <HeartIcon className="size-4 text-[#c84b55]" aria-hidden="true" />
              Tipo de sangre
            </p>
            <p className="mt-1 text-sm font-bold text-[#19304a]">{formatBloodType(member.tipoSangre)}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-500">Consultar historial de vacunas</span>
          <span className="flex items-center gap-1 text-sm font-bold text-[#126f7b]">
            Abrir cartilla <ChevronRightIcon className="size-4 transition duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}

export default VaccinationCard;
