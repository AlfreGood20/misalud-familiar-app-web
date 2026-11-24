import { useEffect, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getEsquemasVacunacion } from '../../services/vaccinationService';

const vaccineColors = [
  '#dbeafe',
  '#fecaca',
  '#fed7aa',
  '#bbf7d0',
  '#e9d5ff',
  '#fde68a',
  '#a5f3fc',
  '#fbcfe8',
];

function formatAge(months) {
  if (months === 0) return 'Al nacer';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} años ${remainingMonths} meses`;
}

function OfficialVaccinationGuideModal({ open, onClose }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;

    async function loadGuide() {
      setLoading(true);
      try {
        const response = await getEsquemasVacunacion({ page, size: 3, nombreVacuna: query });
        if (!cancelled) {
          setItems(response.content ?? []);
          setPageInfo({
            number: response.page?.number ?? page,
            totalPages: response.page?.totalPages ?? 0,
            totalElements: response.page?.totalElements ?? 0,
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudo cargar la cartilla oficial.');
          console.error('Error al cargar esquema de vacunación:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGuide();
    return () => {
      cancelled = true;
    };
  }, [open, page, query]);

  if (!open) return null;

  const totalPages = Math.max(pageInfo.totalPages, 1);

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="vaccination-guide-title">
      <div className="modal-box h-[82vh] max-h-[82vh] w-[620px] max-w-[92vw] overflow-hidden bg-[#f4f7fb] p-0 shadow-2xl">
        <div className="flex h-full flex-col overflow-hidden p-3">
          <div className="mb-2 flex shrink-0 items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f7f4] text-[#126f7b] ring-1 ring-[#15919a]/10">
                <ClipboardDocumentCheckIcon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15919a]">Cartilla oficial</p>
                <h2 id="vaccination-guide-title" className="text-xl font-black text-[#19304a]">Esquema de vacunación</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Cerrar guía">
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <label className="input input-bordered mb-2 flex w-full shrink-0 items-center gap-2 bg-white">
            <MagnifyingGlassIcon className="size-5 text-[#15919a]" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="grow" placeholder="Buscar vacuna" />
          </label>

          <div className="h-[46vh] max-h-[46vh] min-h-0 shrink-0 overflow-x-hidden overflow-y-scroll rounded-xl border border-slate-200 bg-white shadow-sm [scrollbar-gutter:stable]">
            {loading ? (
              <div className="flex h-full items-center justify-center"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
            ) : items.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <ShieldCheckIcon className="mx-auto size-12 text-slate-300" aria-hidden="true" />
                  <h3 className="mt-3 font-bold text-[#19304a]">No se encontraron vacunas</h3>
                  <p className="mt-1 text-sm text-slate-500">Prueba con otro nombre.</p>
                </div>
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#9edb75] text-[#19304a]">
                    <th className="w-[17%] border border-[#19304a] px-2 py-3 text-center">Vacuna</th>
                    <th className="w-[25%] border border-[#19304a] px-2 py-3 text-center">Enfermedad que previene</th>
                    <th className="w-[13%] border border-[#19304a] px-2 py-3 text-center">Dosis</th>
                    <th className="w-[17%] border border-[#19304a] px-2 py-3 text-center">Edad / frecuencia</th>
                    <th className="w-[28%] border border-[#19304a] px-2 py-3 text-center">Contraindicaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, vaccineIndex) => {
                    const color = vaccineColors[vaccineIndex % vaccineColors.length];
                    return item.dosis.map((dose, doseIndex) => (
                      <tr key={dose.id} className="text-[#19304a]">
                        {doseIndex === 0 && (
                          <td
                            rowSpan={item.dosis.length}
                            className="border border-slate-500 px-3 py-3 text-center font-black"
                            style={{ backgroundColor: color }}
                          >
                            {item.vacuna.nombre}
                          </td>
                        )}
                        {doseIndex === 0 && (
                          <td
                            rowSpan={item.dosis.length}
                            className="border border-slate-400 px-3 py-3 font-semibold"
                            style={{ backgroundColor: `${color}55` }}
                          >
                            {item.vacuna.enfermedadPreviene}
                          </td>
                        )}
                        <td className="border border-slate-400 px-2 py-3 text-center font-bold">
                          {dose.esRefuerzo ? `REFUERZO ${dose.numeroDosis}` : `DOSIS ${dose.numeroDosis}`}
                        </td>
                        <td className="border border-slate-400 px-2 py-3 text-center font-semibold">
                          {formatAge(dose.edadRecomendadaMeses)}
                          {dose.intervaloMinimoDias ? (
                            <span className="mt-1 block text-[11px] font-normal text-slate-500">
                              Min. {dose.intervaloMinimoDias} días
                            </span>
                          ) : null}
                        </td>
                        {doseIndex === 0 && (
                          <td
                            rowSpan={item.dosis.length}
                            className="border border-slate-400 px-3 py-3 text-[11px] leading-relaxed text-slate-700"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            {item.vacuna.contraindicaciones || 'Sin contraindicaciones registradas'}
                          </td>
                        )}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-2 flex shrink-0 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2">
            <p className="text-xs font-bold text-slate-500">
              {pageInfo.totalElements} vacunas · Página {pageInfo.number + 1} de {totalPages}
            </p>
            <div className="join">
              <button type="button" className="btn btn-sm join-item" disabled={page === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftIcon className="size-4" /></button>
              <button type="button" className="btn btn-sm join-item" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRightIcon className="size-4" /></button>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Cerrar guía" onClick={onClose} />
    </div>
  );
}

export default OfficialVaccinationGuideModal;
