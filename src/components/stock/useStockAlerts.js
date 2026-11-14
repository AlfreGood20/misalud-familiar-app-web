import { useEffect, useState } from 'react';
import { getStock } from '../../services/stockService';
import { buildStockAlerts } from './stockOptions';

// Carga el stock (sin desechados) y lo convierte en alertas.
// Con un solo rol sin acceso o error de red, devuelve una lista vacía.
function useStockAlerts() {
  const [state, setState] = useState({ alerts: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    getStock({ page: 0, size: 100 })
      .then((response) => {
        if (!cancelled) setState({ alerts: buildStockAlerts(response.content ?? []), loading: false });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ alerts: [], loading: false });
          console.error('Error al cargar alertas de stock:', error);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}

export default useStockAlerts;
