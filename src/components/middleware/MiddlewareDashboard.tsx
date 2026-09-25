import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  RotateCcw, 
  Trash2, 
  Link as LinkIcon, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Cpu,
  Undo2,
  AlertTriangle,
  Presentation,
  RefreshCw,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  MiddlewareIntegration, 
  MiddlewareFormData, 
  IntegrationCategory, 
  IntegrationStatus,
  PLATAFORMAS_GRUPOS
} from '../../types/integration';
import { 
  getIntegrations, 
  saveIntegrations, 
  createIntegration, 
  updateIntegration, 
  deleteIntegration, 
  restoreIntegration,
  resetToDemoIntegrations, 
  clearAllIntegrations 
} from '../../utils/integrationStorage';
import { exportMiddlewareOnlyToPowerPoint } from '../../utils/exportToPowerPoint';
import { exportMiddlewareToExcel } from '../../utils/exportToExcel';
import { MiddlewareExecutiveSummary } from './MiddlewareExecutiveSummary';
import { MiddlewareCard } from './MiddlewareCard';
import { MiddlewareTable } from './MiddlewareTable';
import { MiddlewareFormModal } from './MiddlewareFormModal';
import { MiddlewareDetailModal } from './MiddlewareDetailModal';
import { DeleteIntegrationModal } from './DeleteIntegrationModal';
import { MiddlewarePresentationModal } from './MiddlewarePresentationModal';

export const MiddlewareDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<MiddlewareIntegration[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlataformaGrupo, setSelectedPlataformaGrupo] = useState<string>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<MiddlewareIntegration | null>(null);
  const [viewingIntegration, setViewingIntegration] = useState<MiddlewareIntegration | null>(null);
  const [deletingIntegration, setDeletingIntegration] = useState<MiddlewareIntegration | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [presentationInitialId, setPresentationInitialId] = useState<string | null>(null);
  
  // Toast & Undo State
  const [toast, setToast] = useState<{
    text: string;
    type?: 'success' | 'info';
    canUndo?: boolean;
  } | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<MiddlewareIntegration | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const data = getIntegrations();
    setIntegrations(data);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success', canUndo: boolean = false) => {
    setToast({ text, type, canUndo });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 5000);
  };

  // PowerPoint Export for Middleware
  const handleExportPowerPoint = async () => {
    if (integrations.length === 0) {
      showToast('No hay integraciones middleware registradas para exportar', 'info');
      return;
    }
    try {
      setIsExportingPptx(true);
      showToast('Generando presentación ejecutiva de Middleware (.pptx)...', 'info');
      const success = await exportMiddlewareOnlyToPowerPoint(integrations);
      if (success) {
        showToast('Presentación de Middleware descargada con éxito', 'success');
      }
    } catch (err) {
      console.error('Error generating middleware pptx:', err);
      showToast('Error al exportar la presentación', 'info');
    } finally {
      setIsExportingPptx(false);
    }
  };

  // Excel Export for Middleware
  const handleExportExcel = async () => {
    const listToExport = filteredIntegrations.length > 0 ? filteredIntegrations : integrations;
    if (listToExport.length === 0) {
      showToast('No hay integraciones middleware para exportar a Excel', 'info');
      return;
    }
    try {
      setIsExportingExcel(true);
      showToast('Generando libro Excel consolidado (.xlsx)...', 'info');
      await new Promise((resolve) => setTimeout(resolve, 150));
      const success = exportMiddlewareToExcel(listToExport);
      if (success) {
        showToast(`Reporte Excel descargado (${listToExport.length} integraciones)`, 'success');
      }
    } catch (err) {
      console.error('Error generating middleware Excel:', err);
      showToast('Error al exportar a Excel', 'info');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Open Presentation Modal
  const handleOpenPresentation = (integrationId?: string) => {
    if (integrations.length === 0) {
      showToast('No hay integraciones middleware para presentar', 'info');
      return;
    }
    setPresentationInitialId(integrationId || null);
    setIsPresentationOpen(true);
  };

  // CRUD Handlers
  const handleSaveIntegration = (formData: MiddlewareFormData, existingId?: string) => {
    if (existingId) {
      const updated = updateIntegration(existingId, formData);
      if (updated) {
        setIntegrations(getIntegrations());
        showToast(`Integración "${formData.nombre}" actualizada`);
      }
    } else {
      const created = createIntegration(formData);
      setIntegrations(getIntegrations());
      showToast(`Nueva integración "${formData.nombre}" registrada con éxito`);
    }
  };

  // Trigger custom delete modal
  const handleDeleteClick = (item: MiddlewareIntegration) => {
    setDeletingIntegration(item);
  };

  // Confirm delete from modal
  const handleConfirmDelete = () => {
    if (!deletingIntegration) return;
    const itemToDelete = deletingIntegration;
    deleteIntegration(itemToDelete.id);
    setIntegrations(getIntegrations());
    setRecentlyDeleted(itemToDelete);
    setDeletingIntegration(null);
    showToast(`Integración "${itemToDelete.nombre}" eliminada`, 'info', true);
  };

  // Undo delete action
  const handleUndoDelete = () => {
    if (!recentlyDeleted) return;
    restoreIntegration(recentlyDeleted);
    setIntegrations(getIntegrations());
    showToast(`Integración "${recentlyDeleted.nombre}" restaurada`, 'success');
    setRecentlyDeleted(null);
  };

  const handleResetDemo = () => {
    const demo = resetToDemoIntegrations();
    setIntegrations(demo);
    showToast('Integraciones de ejemplo cargadas', 'success');
  };

  const handleClearAllConfirm = () => {
    clearAllIntegrations();
    setIntegrations([]);
    setIsClearAllOpen(false);
    showToast('Sección de integraciones vaciada', 'info');
  };

  // Filtered list
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        (item.codigoApp && item.codigoApp.toLowerCase().includes(q)) ||
        (item.plataformaGrupo && item.plataformaGrupo.toLowerCase().includes(q)) ||
        (item.observacion && item.observacion.toLowerCase().includes(q)) ||
        (item.componentesRelacionados && item.componentesRelacionados.some((c) => c.toLowerCase().includes(q))) ||
        item.categoria.toLowerCase().includes(q) ||
        item.responsable.toLowerCase().includes(q) ||
        (item.desarrolladorACargo && item.desarrolladorACargo.toLowerCase().includes(q)) ||
        item.descripcion.toLowerCase().includes(q) ||
        (item.tecnologias && item.tecnologias.some((t) => t.toLowerCase().includes(q)));

      // Category
      const matchCategory = selectedCategory === 'all' || item.categoria === selectedCategory;

      // Status
      const matchStatus = selectedStatus === 'all' || item.estado === selectedStatus;

      // Plataforma / Grupo
      const matchPlataforma = selectedPlataformaGrupo === 'all' || item.plataformaGrupo === selectedPlataformaGrupo;

      return matchSearch && matchCategory && matchStatus && matchPlataforma;
    });
  }, [integrations, searchQuery, selectedCategory, selectedStatus, selectedPlataformaGrupo]);

  const categoriesList = ['all', 'E-Commerce', 'Identidad & KYC', 'Logística & Envíos', 'Pagos & Gateway', 'ERP / CRM', 'APIs & Microservicios'];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification with Undo */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.text}</span>

          {toast.canUndo && recentlyDeleted && (
            <button
              onClick={handleUndoDelete}
              className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Executive Summary Section (Exact Design from User Reference Image) */}
      <MiddlewareExecutiveSummary 
        integrations={integrations} 
        onExportPowerPoint={handleExportPowerPoint}
        isExporting={isExportingPptx}
      />

      {/* 2. Management & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Proyectos y Aplicaciones del Equipo Middleware</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro, avance porcentual, servicios y estado de conectores activos ({filteredIntegrations.length} de {integrations.length})
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reset Demo */}
          {integrations.length === 0 ? (
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Cargar Ejemplo</span>
            </button>
          ) : (
            <button
              onClick={() => setIsClearAllOpen(true)}
              title="Vaciar proyectos middleware"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* View Toggle (Cards vs Table) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en tarjetas"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Dedicated Excel Export Button for Middleware */}
          <button
            id="btn-export-middleware-excel"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            title="Descargar matriz consolidada de integraciones en Excel (.xlsx)"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isExportingExcel ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Generando Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel</span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  .XLSX
                </span>
              </>
            )}
          </button>

          {/* Executive Presentation / PowerPoint Mode Button */}
          <button
            id="btn-open-middleware-presentation"
            onClick={() => handleOpenPresentation()}
            title="Abrir Presentación Ejecutiva en Modo PowerPoint"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 hover:to-amber-600/30 active:from-orange-600/40 text-orange-300 border border-orange-500/40 hover:border-orange-500/60 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Presentation className="w-4 h-4 text-orange-400" />
            <span>Presentación Ejecutiva</span>
            <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              PowerPoint Mode
            </span>
          </button>

          {/* Quick Direct PPTX Download Button */}
          <button
            id="btn-export-middleware-pptx"
            onClick={handleExportPowerPoint}
            disabled={isExportingPptx}
            title="Descargar presentación (.pptx) directamente"
            className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 disabled:opacity-50"
          >
            {isExportingPptx ? (
              <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {/* Primary Action Button: + Registrar Integración */}
          <button
            id="btn-new-integration"
            onClick={() => {
              setEditingIntegration(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Integración</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por proyecto, código (MW-01), stack, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Category Pills & Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'Todas las Categorías' : cat}
              </button>
            ))}
          </div>

          <select
            value={selectedPlataformaGrupo}
            onChange={(e) => setSelectedPlataformaGrupo(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden max-w-[200px] truncate"
            title="Filtrar por Plataforma / Grupo"
          >
            <option value="all">Todas las Plataformas / Grupos</option>
            {PLATAFORMAS_GRUPOS.map((pg) => (
              <option key={pg} value={pg}>{pg}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="all">Todos los Estados</option>
            <option value="En Producción">En Producción</option>
            <option value="En Testing">En Testing</option>
            <option value="En Desarrollo">En Desarrollo</option>
            <option value="Planificado">Planificado</option>
          </select>
        </div>
      </div>

      {/* 4. Content List: Empty State, Cards Grid, or Table */}
      {integrations.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <LinkIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No hay integraciones ni proyectos registrados aún
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Ingresa las aplicaciones y conectores de tu equipo Middleware (ej: MercadoLibre, Renaper, Tienda Nube, Envío Nube, WooCommerce) o carga los ejemplos.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setEditingIntegration(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
            >
              + Ingresar Primera Integración
            </button>
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Cargar Proyectos de Ejemplo
            </button>
          </div>
        </div>
      ) : filteredIntegrations.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No se encontraron integraciones con los filtros seleccionados.
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="text-blue-400 underline ml-2 hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIntegrations.map((item) => (
            <MiddlewareCard
              key={item.id}
              integration={item}
              onView={(int) => setViewingIntegration(int)}
              onEdit={(int) => {
                setEditingIntegration(int);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteClick}
              onPresent={(int) => handleOpenPresentation(int.id)}
            />
          ))}
        </div>
      ) : (
        <MiddlewareTable
          integrations={filteredIntegrations}
          onView={(int) => setViewingIntegration(int)}
          onEdit={(int) => {
            setEditingIntegration(int);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteClick}
          onPresent={(int) => handleOpenPresentation(int.id)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteIntegrationModal
        isOpen={!!deletingIntegration}
        onClose={() => setDeletingIntegration(null)}
        onConfirm={handleConfirmDelete}
        integration={deletingIntegration}
      />

      {/* Clear All Confirmation Modal */}
      {isClearAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Vaciar todas las integraciones?</h3>
                <p className="text-xs text-slate-400">Se eliminarán los {integrations.length} proyectos registrados.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-6 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              Esta acción limpiará todas las aplicaciones cargadas para que puedas comenzar desde una lista en blanco.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClearAllOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearAllConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, vaciar lista</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <MiddlewareFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIntegration(null);
        }}
        onSubmit={handleSaveIntegration}
        initialData={editingIntegration}
      />

      {/* Detail Modal */}
      <MiddlewareDetailModal
        integration={viewingIntegration}
        onClose={() => setViewingIntegration(null)}
        onEdit={(int) => {
          setEditingIntegration(int);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteClick}
        onPresent={(int) => handleOpenPresentation(int.id)}
      />

      {/* Interactive PowerPoint Mode Presentation Modal for Middleware */}
      <MiddlewarePresentationModal
        isOpen={isPresentationOpen}
        onClose={() => {
          setIsPresentationOpen(false);
          setPresentationInitialId(null);
        }}
        integrations={filteredIntegrations.length > 0 ? filteredIntegrations : integrations}
        initialIntegrationId={presentationInitialId}
      />

    </div>
  );
};
