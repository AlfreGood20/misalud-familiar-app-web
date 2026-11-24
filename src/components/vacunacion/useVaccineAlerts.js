import { useEffect, useState } from 'react';
import { getIntegrantes } from '../../services/memberService';
import { getCartillaVacunacion } from '../../services/vaccinationService';

const CACHE_MS = 60000;
let cache = { time: 0, promise: null };

function fullName(member) {
  return [member.nombre, member.apellidoPaterno].filter(Boolean).join(' ');
}

// Consulta la cartilla de cada integrante y devuelve las dosis atrasadas o pendientes.
async function loadVaccineAlerts() {
  const members = (await getIntegrantes()) ?? [];
  const alerts = [];

  await Promise.all(members.map(async (member) => {
    const responses = await Promise.all(['ATRASADA', 'PENDIENTE'].map((estado) =>
      getCartillaVacunacion(member.id, { page: 0, size: 100, estado }).catch(() => ({ content: [] }))));

    const seen = new Set();
    responses.forEach((response) => {
      (response.content ?? []).forEach((item) => {
        (item.dosis ?? []).forEach((dose) => {
          if (dose.estado !== 'ATRASADA' && dose.estado !== 'PENDIENTE') return;
          const id = `${member.id}-${dose.id}`;
          if (seen.has(id)) return;
          seen.add(id);
          alerts.push({
            id,
            type: dose.estado,
            member,
            memberName: fullName(member),
            vaccine: item.vacuna?.nombre ?? 'Vacuna',
            dose: dose.numeroDosis,
            reinforcement: dose.esRefuerzo,
          });
        });
      });
    });
  }));

  // Atrasadas primero, luego por integrante.
  return alerts.sort((a, b) => (a.type === b.type ? a.memberName.localeCompare(b.memberName) : a.type === 'ATRASADA' ? -1 : 1));
}

function useVaccineAlerts() {
  const [state, setState] = useState({ alerts: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    if (!cache.promise || Date.now() - cache.time > CACHE_MS) {
      cache = { time: Date.now(), promise: loadVaccineAlerts() };
    }

    cache.promise
      .then((alerts) => { if (!cancelled) setState({ alerts, loading: false }); })
      .catch((error) => {
        cache = { time: 0, promise: null };
        if (!cancelled) {
          setState({ alerts: [], loading: false });
          console.error('Error al cargar alertas de vacunación:', error);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}

export default useVaccineAlerts;
