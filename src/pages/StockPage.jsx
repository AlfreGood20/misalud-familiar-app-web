import { useEffect, useRef, useState } from 'react';
import {
  ArchiveBoxIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StockAdjustModal from '../components/stock/StockAdjustModal';
import StockCard from '../components/stock/StockCard';
import StockDetailsModal from '../components/stock/StockDetailsModal';
import StockFilters from '../components/stock/StockFilters';
import StockFormModal from '../components/stock/StockFormModal';
import { getCurrentUser } from '../services/authService';
import { getMedicamentos } from '../services/medicationService';
import {
  createStock, deleteStock, getStock, getStockById, patchStock, updateStock,
} from '../services/stockService';

const initialFilters = {
  nombre: '',
  estado: '',
  bajoMinimo: false,
  page: 0,
  size: 9,
};

async function requestStock(currentFilters) {
  const response = await getStock(currentFilters);
  const totalElements = response.page?.totalElements ?? 0;
  const totalPages = response.page?.totalPages || Math.ceil(totalElements / currentFilters.size);

  return {
    items: response.content ?? [],
    pageInfo: {
      number: response.page?.number ?? currentFilters.page,
      totalPages,
      totalElements,
    },
  };
}

function StockPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [queryFilters, setQueryFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [medications, setMedications] = useState([]);
  const [adjustingStock, setAdjustingStock] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const filtersInitialized = useRef(false);
  const { nombre, estado, bajoMinimo } = filters;

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (!cancelled) setIsAdmin(user?.rol === 'ADMIN');
    }).catch((error) => console.error('Error al cargar el usuario autenticado:', error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!filtersInitialized.current) {
      filtersInitialized.current = true;
      return undefined;
    }

    const timer = setTimeout(() => {
      setQueryFilters((current) => ({
        ...current, nombre, estado, bajoMinimo, page: 0,
      }));
    }, 350);
    return () => clearTimeout(timer);
  }, [nombre, estado, bajoMinimo]);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      try {
        const result = await requestStock(queryFilters);
        if (!cancelled) {
          setItems(result.items);
          setPageInfo(result.pageInfo);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('No se pudo cargar el stock.');
          console.error('Error al cargar stock:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [queryFilters, reloadKey]);

  const reload = () => setReloadKey((current) => current + 1);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setQueryFilters(initialFilters);
  };

  const handleSelect = async (id) => {
    setDetailLoading(true);
    setSelectedStock({});
    try {
      setSelectedStock(await getStockById(id));
    } catch (error) {
      setSelectedStock(null);
      toast.error('No se pudo cargar el detalle del stock.');
      console.error('Error al cargar detalle de stock:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = async () => {
    setEditingStock(null);
    setFormOpen(true);
    if (medications.length > 0) return;
    try {
      const response = await getMedicamentos({ page: 0, size: 100, activo: true });
      setMedications(response.content ?? []);
    } catch (error) {
      toast.error('No se pudo cargar el catálogo de medicamentos.');
      console.error('Error al cargar medicamentos:', error);
    }
  };

  const openEdit = (stock) => {
    setEditingStock(stock);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingStock(null);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      if (editingStock) {
        await updateStock(editingStock.id, {
          cantidad: Number(form.get('cantidad')),
          cantidadMinima: Number(form.get('cantidadMinima')),
          unidad: form.get('unidad'),
          fechaCaducidad: form.get('fechaCaducidad'),
        });
        toast.success('Stock actualizado.');
      } else {
        await createStock({
          idMedicamento: Number(form.get('idMedicamento')),
          cantidad: Number(form.get('cantidad')),
          cantidadMinima: Number(form.get('cantidadMinima')),
          fechaCaducidad: form.get('fechaCaducidad'),
        });
        toast.success('Medicamento añadido al stock.');
      }
      closeForm();
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el stock.');
      console.error('Error al guardar stock:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (event) => {
    event.preventDefault();
    const cantidad = Number(new FormData(event.currentTarget).get('cantidad'));
    setSubmitting(true);
    try {
      await patchStock(adjustingStock.id, { cantidad });
      toast.success('Cantidad actualizada.');
      setAdjustingStock(null);
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la cantidad.');
      console.error('Error al ajustar cantidad:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (confirmation.type === 'delete') {
        await deleteStock(confirmation.stock.id);
        toast.success('Medicamento eliminado del stock.');
      } else {
        await patchStock(confirmation.stock.id, { estado: 'DESECHADO' });
        toast.success('Medicamento marcado como desechado.');
      }
      setConfirmation(null);
      reload();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar la acción.');
      console.error('Error en acción de stock:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => navigate('/', { replace: true });
  const currentPage = pageInfo.number + 1;
  const isDelete = confirmation?.type === 'delete';
  const confirmName = confirmation?.stock?.medicamento?.nombreComercial;

  return (
    <main className="min-h-screen bg-[#f4f7fb] lg:pl-72">
      <DashboardSidebar familyName="Familia García" onLogout={handleLogout} />
      <div className="mx-auto max-w-7xl px-5 py-8 transition-all duration-500 starting:translate-y-3 starting:opacity-0 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#15919a]">Botiquín familiar</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#19304a]">
              <ArchiveBoxIcon className="size-8 text-[#15919a]" aria-hidden="true" /> Stock de medicamentos
            </h1>
            <p className="mt-2 text-slate-500">Controla las existencias, mínimos y caducidades de los medicamentos de tu familia.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <ExclamationTriangleIcon className="size-5 text-[#15919a]" aria-hidden="true" />
              {pageInfo.totalElements} registrados
            </div>
            <button type="button" onClick={openCreate} className="btn transition-all duration-200 active:scale-95 border-0 bg-[#126f7b] text-white shadow-md shadow-[#126f7b]/20 hover:-translate-y-0.5 hover:bg-[#0b5d69] hover:shadow-lg">
              <PlusIcon className="size-5" /> Añadir al stock
            </button>
          </div>
        </div>

        <StockFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-[#15919a]" /></div>
          ) : items.length === 0 ? (
            <div className="card border border-dashed border-slate-300 bg-white">
              <div className="card-body items-center py-16 text-center">
                <ArchiveBoxIcon className="size-12 text-slate-300" />
                <h2 className="mt-3 text-lg font-bold text-[#19304a]">No hay medicamentos en el stock</h2>
                <p className="text-sm text-slate-500">Añade uno o prueba con otros filtros de búsqueda.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    isAdmin={isAdmin}
                    onSelect={handleSelect}
                    onEdit={openEdit}
                    onAdjust={setAdjustingStock}
                    onDiscard={(item) => setConfirmation({ type: 'discard', stock: item })}
                    onDelete={(item) => setConfirmation({ type: 'delete', stock: item })}
                  />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <p className="text-sm text-slate-500">Página {currentPage} de {Math.max(pageInfo.totalPages, 1)}</p>
                <div className="join">
                  <button type="button" className="btn transition-all duration-200 active:scale-95 btn-sm join-item" disabled={pageInfo.number === 0} onClick={() => setQueryFilters((current) => ({ ...current, page: current.page - 1 }))}><ChevronLeftIcon className="size-4" /></button>
                  <button type="button" className="btn transition-all duration-200 active:scale-95 btn-sm join-item" disabled={currentPage >= pageInfo.totalPages} onClick={() => setQueryFilters((current) => ({ ...current, page: current.page + 1 }))}><ChevronRightIcon className="size-4" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <StockDetailsModal stock={selectedStock} loading={detailLoading} onClose={() => setSelectedStock(null)} />
      <StockFormModal
        key={editingStock?.id ?? 'new'}
        open={formOpen}
        medications={medications}
        submitting={submitting}
        stock={editingStock}
        editing={Boolean(editingStock)}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />
      <StockAdjustModal
        key={adjustingStock?.id ?? 'adjust'}
        stock={adjustingStock}
        submitting={submitting}
        onClose={() => setAdjustingStock(null)}
        onSubmit={handleAdjustSubmit}
      />
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={isDelete ? 'Eliminar del stock' : 'Desechar medicamento'}
        message={isDelete
          ? `¿Eliminar ${confirmName} del stock? Esta acción no se puede deshacer.`
          : `¿Marcar ${confirmName} como desechado? Su cantidad pasará a 0.`}
        confirmLabel={isDelete ? 'Eliminar' : 'Desechar'}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmation(null)}
      />
    </main>
  );
}

export default StockPage;
