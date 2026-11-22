import { useEffect, useState } from 'react';
import {
  BeakerIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import VaccinationCard from '../components/vacunacion/VaccinationCard';
import OfficialVaccinationGuideModal from '../components/vacunacion/OfficialVaccinationGuideModal';
import { getIntegrantes } from '../services/memberService';

function VacunacionPage() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getIntegrantes().then((result) => {
      if (!cancelled) setMembers(result ?? []);
    }).catch((error) => {
      if (!cancelled) {
        toast.error('No se pudieron cargar las cartillas de los integrantes.');
        console.error('Error al cargar integrantes para vacunación:', error);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCartilla = (member) => {
    sessionStorage.setItem('vacunacion.cartilla.integrante', JSON.stringify(member));
    navigate('/vacunacion/cartilla');
  };

  return (
    <main className="min-h-screen bg-[#dfe8f1] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={() => navigate('/', { replace: true })} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Prevención familiar</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <BeakerIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Vacunación
            </h1>
            <p className="mt-2 text-slate-500">Consulta las cartillas de vacunación de los integrantes de tu familia.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setGuideOpen(true)} className="btn btn-outline transition-all duration-200 active:scale-95 hover:-translate-y-0.5">
              <BookOpenIcon className="size-5 text-[#15919a]" aria-hidden="true" /> Guía oficial
            </button>
          </div>
        </div>

        <section id="cartillas-familiares" className="scroll-mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#19304a]">
                <ClipboardDocumentCheckIcon className="size-6 text-[#15919a]" aria-hidden="true" />
                Cartillas familiares
              </h2>
              <p className="mt-1 text-sm text-slate-500">Selecciona un integrante para revisar su historial de vacunación.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
          ) : members.length === 0 ? (
            <div className="card border border-dashed border-slate-300 bg-white">
              <div className="card-body items-center py-16 text-center">
                <BeakerIcon className="size-12 text-slate-300" />
                <h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay integrantes</h2>
                <p className="text-sm text-slate-500">Agrega integrantes para consultar sus cartillas de vacunación.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {members.map((member) => (
                <VaccinationCard key={member.id} member={member} onOpen={openCartilla} />
              ))}
            </div>
          )}
        </section>
      </div>

      <OfficialVaccinationGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </main>
  );
}

export default VacunacionPage;
