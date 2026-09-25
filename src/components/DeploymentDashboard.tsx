import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getDeployments, 
  saveDeployments,
  createDeployment, 
  updateDeployment, 
  deleteDeployment, 
  deleteMultipleDeployments, 
  resetToDemoData, 
  clearAllDeployments,
  calculateKPIs 
} from '../utils/storage';
import { 
  isSupabaseConfigured,
  fetchDeploymentsFromSupabase,
  insertDeploymentToSupabase,
  updateDeploymentInSupabase,
  deleteDeploymentFromSupabase,
  deleteMultipleDeploymentsFromSupabase,
  mapDeploymentToRow
} from '../utils/supabase';
import { exportDeploymentsToExcel, exportMiddlewareToExcel } from '../utils/exportToExcel';
import { 
  DeploymentRecord, 
  DeploymentFormData, 
  DeploymentFilterState, 
  SortField, 
  SortDirection,
  DeploymentStatus 
} from '../types/deployment';

import { Navbar } from './Navbar';
import { KpiOverview } from './KpiOverview';
import { DeploymentCharts } from './DeploymentCharts';
import { DeploymentFilters } from './DeploymentFilters';
import { DeploymentTable } from './DeploymentTable';
import { DeploymentFormModal } from './DeploymentFormModal';
import { DeploymentDetailModal } from './DeploymentDetailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SupabaseModal } from './SupabaseModal';
import { ChangeProductModal } from './ChangeProductModal';
import { PresentationModal } from './PresentationModal';
import { exportDeploymentsToPowerPoint } from '../utils/exportToPowerPoint';
import { MiddlewareDashboard } from './middleware/MiddlewareDashboard';
import { GeminiChatbot } from './GeminiChatbot';
import { GeminiConnectionModal } from './GeminiConnectionModal';
import { getIntegrations } from '../utils/integrationStorage';
import { MiddlewareIntegration } from '../types/integration';
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  FileSpreadsheet, 
  Database, 
  Plus, 
  Sparkles, 
  RotateCcw,
  RefreshCw,
  Presentation
} from 'lucide-react';

export const DeploymentDashboard: React.FC = () => {
  // Main Data State
  const [records, setRecords] = useState<DeploymentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'deployments' | 'middleware'>('deployments');
  const [integrationsCount, setIntegrationsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isGeminiGuideOpen, setIsGeminiGuideOpen] = useState(false);
  const [middlewareRecords, setMiddlewareRecords] = useState<MiddlewareIntegration[]>(() => getIntegrations());
  const [presentationCustomRecords, setPresentationCustomRecords] = useState<DeploymentRecord[] | null>(null);
  const [editingRecord, setEditingRecord] = useState<DeploymentRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<DeploymentRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<DeploymentRecord | null>(null);
  const [changingProductRecord, setChangingProductRecord] = useState<DeploymentRecord | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);

  // Filter State
  const initialFilters: DeploymentFilterState = {
    searchQuery: '',
    selectedProduct: '',
    selectedType: '',
    selectedStatus: '',
    selectedImpact: '',
    gddQuery: '',
    datePreset: 'all',
    startDate: '',
    endDate: '',
  };
  const [filters, setFilters] = useState<DeploymentFilterState>(initialFilters);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('fechaImplementacion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load records from Supabase if configured, otherwise from localStorage
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    if (configured) {
      try {
        const supaRecords = await fetchDeploymentsFromSupabase();
        setRecords(supaRecords);
        saveDeployments(supaRecords); // sync local cache
        showToast('Conectado a Supabase: Datos sincronizados en vivo', 'success');
      } catch (err: any) {
        console.warn('Could not fetch from Supabase, fallback to local storage:', err);
        const local = getDeployments();
        setRecords(local);
        showToast('Modo sin conexión o tabla no inicializada en Supabase', 'info');
      }
    } else {
      const local = getDeployments();
      setRecords(local);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const mw = getIntegrations();
    setMiddlewareRecords(mw);
    setIntegrationsCount(mw.length);
  }, [loadData]);

  useEffect(() => {
    const mw = getIntegrations();
    setMiddlewareRecords(mw);
    setIntegrationsCount(mw.length);
  }, [activeTab]);

  // Available unique products
  const availableProducts = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.producto) set.add(r.producto);
    });
    return Array.from(set).sort();
  }, [records]);

  // Last GDD number helper
  const lastGddNumber = useMemo(() => {
    if (records.length === 0) return undefined;
    return records[0]?.numeroGDD;
  }, [records]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(records);
  }, [records]);

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<DeploymentFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    showToast('Filtros restablecidos', 'info');
  };

  // Quick preset filter from KPI cards
  const handleKpiFilterPreset = (type: 'all' | 'pending' | 'hotfix' | 'thisMonth' | 'recent') => {
    if (type === 'all') {
      setFilters(initialFilters);
    } else if (type === 'pending') {
      setFilters({ ...initialFilters, selectedStatus: 'Pendiente' });
    } else if (type === 'hotfix') {
      setFilters({ ...initialFilters, selectedType: 'Hotfix' });
    } else if (type === 'thisMonth') {
      setFilters({ ...initialFilters, datePreset: 'thisMonth' });
    } else if (type === 'recent') {
      setFilters({ ...initialFilters, datePreset: 'last7days' });
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted records
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Global Search (across product, project, gdd, details, author, ticket)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.producto.toLowerCase().includes(q) ||
          r.proyecto.toLowerCase().includes(q) ||
          r.numeroGDD.toLowerCase().includes(q) ||
          r.detalle.toLowerCase().includes(q) ||
          r.autor.toLowerCase().includes(q) ||
          (r.jiraTicket && r.jiraTicket.toLowerCase().includes(q)) ||
          (r.aprobadoPor && r.aprobadoPor.toLowerCase().includes(q))
      );
    }

    // GDD direct search
    if (filters.gddQuery.trim()) {
      const q = filters.gddQuery.toLowerCase();
      result = result.filter((r) => r.numeroGDD.toLowerCase().includes(q));
    }

    // Product Filter
    if (filters.selectedProduct) {
      result = result.filter((r) => r.producto === filters.selectedProduct);
    }

    // Type Filter
    if (filters.selectedType) {
      result = result.filter((r) => r.tipo === filters.selectedType);
    }

    // Status Filter
    if (filters.selectedStatus) {
      result = result.filter((r) => r.estado === filters.selectedStatus);
    }

    // Impact Filter
    if (filters.selectedImpact) {
      result = result.filter((r) => r.impacto === filters.selectedImpact);
    }

    // Date Filtering
    const now = new Date();
    if (filters.datePreset === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      result = result.filter((r) => r.fechaImplementacion.startsWith(todayStr));
    } else if (filters.datePreset === 'last7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter((r) => new Date(r.fechaImplementacion) >= sevenDaysAgo);
    } else if (filters.datePreset === 'thisMonth') {
      const year = now.getFullYear();
      const month = now.getMonth();
      result = result.filter((r) => {
        const d = new Date(r.fechaImplementacion);
        return !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
      });
    } else if (filters.datePreset === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = lastMonth.getFullYear();
      const month = lastMonth.getMonth();
      result = result.filter((r) => {
        const d = new Date(r.fechaImplementacion);
        return !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
      });
    } else if (filters.datePreset === 'custom') {
      if (filters.startDate) {
        result = result.filter((r) => r.fechaImplementacion.slice(0, 10) >= filters.startDate);
      }
      if (filters.endDate) {
        result = result.filter((r) => r.fechaImplementacion.slice(0, 10) <= filters.endDate);
      }
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';

      if (sortField === 'fechaImplementacion') {
        const timeA = new Date(valA).getTime() || 0;
        const timeB = new Date(valB).getTime() || 0;
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

    return result;
  }, [records, filters, sortField, sortDirection]);

  // CRUD Operations
  const handleSaveDeployment = async (formData: DeploymentFormData, existingId?: string) => {
    if (existingId) {
      if (isSupabaseConfigured()) {
        try {
          const updated = await updateDeploymentInSupabase(existingId, formData);
          setRecords((prev) => prev.map((item) => (item.id === existingId ? updated : item)));
          updateDeployment(existingId, formData);
          showToast(`Registro ${formData.numeroGDD} actualizado en Supabase`);
          if (viewingRecord?.id === existingId) setViewingRecord(updated);
          return;
        } catch (err) {
          console.error('Supabase update failed:', err);
        }
      }
      const updated = updateDeployment(existingId, formData);
      if (updated) {
        setRecords(getDeployments());
        showToast(`Registro ${formData.numeroGDD} actualizado localmente`);
        if (viewingRecord?.id === existingId) setViewingRecord(updated);
      }
    } else {
      if (isSupabaseConfigured()) {
        try {
          const created = await insertDeploymentToSupabase(formData);
          setRecords((prev) => [created, ...prev]);
          saveDeployments([created, ...getDeployments()]);
          showToast(`Nuevo pase ${formData.numeroGDD} guardado en Supabase`, 'success');
          return;
        } catch (err) {
          console.error('Supabase insert failed:', err);
        }
      }
      const created = createDeployment(formData);
      setRecords(getDeployments());
      showToast(`Nuevo pase ${formData.numeroGDD} registrado con éxito`, 'success');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: DeploymentStatus) => {
    if (isSupabaseConfigured()) {
      try {
        const updated = await updateDeploymentInSupabase(id, { estado: newStatus });
        setRecords((prev) => prev.map((item) => (item.id === id ? updated : item)));
        updateDeployment(id, { estado: newStatus });
        if (viewingRecord?.id === id) setViewingRecord(updated);
        showToast(`Estado actualizado a "${newStatus}" en Supabase`);
        return;
      } catch (err) {
        console.error('Supabase status update failed:', err);
      }
    }

    const updated = updateDeployment(id, { estado: newStatus });
    if (updated) {
      setRecords(getDeployments());
      if (viewingRecord?.id === id) setViewingRecord(updated);
      showToast(`Estado actualizado a "${newStatus}"`);
    }
  };

  const handleConfirmChangeProduct = async (
    targetRecordId: string | null,
    oldProductName: string,
    newProductName: string,
    applyToAll: boolean
  ) => {
    if (applyToAll) {
      // Find all records with this product name
      const matching = records.filter((r) => r.producto === oldProductName);
      
      if (isSupabaseConfigured()) {
        for (const item of matching) {
          try {
            await updateDeploymentInSupabase(item.id, { producto: newProductName });
          } catch (err) {
            console.warn('Supabase product rename error for ID:', item.id, err);
          }
        }
      }

      matching.forEach((item) => {
        updateDeployment(item.id, { producto: newProductName });
      });

      setRecords((prev) =>
        prev.map((r) => (r.producto === oldProductName ? { ...r, producto: newProductName } : r))
      );

      if (viewingRecord && viewingRecord.producto === oldProductName) {
        setViewingRecord({ ...viewingRecord, producto: newProductName });
      }

      showToast(`${matching.length} despliegues actualizados al producto "${newProductName}"`, 'success');
    } else if (targetRecordId) {
      if (isSupabaseConfigured()) {
        try {
          const updated = await updateDeploymentInSupabase(targetRecordId, { producto: newProductName });
          setRecords((prev) => prev.map((item) => (item.id === targetRecordId ? updated : item)));
          updateDeployment(targetRecordId, { producto: newProductName });
          if (viewingRecord?.id === targetRecordId) setViewingRecord(updated);
          showToast(`Producto actualizado a "${newProductName}"`);
          return;
        } catch (err) {
          console.error('Supabase product update error:', err);
        }
      }

      const updated = updateDeployment(targetRecordId, { producto: newProductName });
      if (updated) {
        setRecords(getDeployments());
        if (viewingRecord?.id === targetRecordId) setViewingRecord(updated);
        showToast(`Producto actualizado a "${newProductName}"`);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingRecord) {
      if (isSupabaseConfigured()) {
        try {
          await deleteDeploymentFromSupabase(deletingRecord.id);
        } catch (err) {
          console.warn('Failed to delete from Supabase:', err);
        }
      }
      deleteDeployment(deletingRecord.id);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      if (viewingRecord?.id === deletingRecord.id) {
        setViewingRecord(null);
      }
      showToast(`Registro ${deletingRecord.numeroGDD} eliminado`);
      setDeletingRecord(null);
    } else if (bulkDeleteIds.length > 0) {
      if (isSupabaseConfigured()) {
        try {
          await deleteMultipleDeploymentsFromSupabase(bulkDeleteIds);
        } catch (err) {
          console.warn('Failed to bulk delete from Supabase:', err);
        }
      }
      deleteMultipleDeployments(bulkDeleteIds);
      setRecords((prev) => prev.filter((r) => !bulkDeleteIds.includes(r.id)));
      showToast(`${bulkDeleteIds.length} registros eliminados`);
      setBulkDeleteIds([]);
    }
  };

  const handleDuplicateRecord = (record: DeploymentRecord) => {
    const duplicateData: DeploymentRecord = {
      ...record,
      id: '',
      numeroGDD: '',
      proyecto: `[Copia] ${record.proyecto}`,
      fechaImplementacion: new Date().toISOString().slice(0, 16),
      estado: 'En Monitoreo',
      createdAt: '',
      updatedAt: '',
    };
    setEditingRecord(duplicateData);
    setIsFormOpen(true);
  };

  const handleBulkVerify = async (selectedIds: string[]) => {
    if (isSupabaseConfigured()) {
      for (const id of selectedIds) {
        try {
          await updateDeploymentInSupabase(id, { estado: 'Verificado' });
        } catch (err) {
          console.warn('Supabase bulk verify item failed:', id, err);
        }
      }
    }
    selectedIds.forEach((id) => {
      updateDeployment(id, { estado: 'Verificado' });
    });
    setRecords((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, estado: 'Verificado' } : r))
    );
    showToast(`${selectedIds.length} registros marcados como Verificados`);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    setBulkDeleteIds(selectedIds);
    setDeletingRecord(null);
  };

  // Excel Export Handler
  const handleExportExcelAll = () => {
    if (activeTab === 'middleware') {
      const btn = document.getElementById('btn-export-middleware-excel');
      if (btn) {
        btn.click();
        return;
      }
      const data = getIntegrations();
      const ok = exportMiddlewareToExcel(data);
      if (ok) {
        showToast(`Excel generado con ${data.length} integraciones middleware`, 'success');
      }
      return;
    }
    const target = filteredAndSortedRecords.length > 0 ? filteredAndSortedRecords : records;
    const ok = exportDeploymentsToExcel(target, 'ProdTracker_Pases_Produccion');
    if (ok) {
      showToast(`Excel generado con ${target.length} registros`, 'success');
    }
  };

  const handleExportExcelSelected = (selected: DeploymentRecord[]) => {
    const ok = exportDeploymentsToExcel(selected, 'ProdTracker_Seleccion');
    if (ok) {
      showToast(`Excel generado con ${selected.length} registros seleccionados`, 'success');
    }
  };

  // PowerPoint Presentation Handlers
  const handleOpenPresentation = (custom?: DeploymentRecord[] | DeploymentRecord) => {
    if (custom) {
      setPresentationCustomRecords(Array.isArray(custom) ? custom : [custom]);
    } else {
      setPresentationCustomRecords(null);
    }
    setIsPresentationOpen(true);
  };

  const handleExportPowerPointAll = async () => {
    const target = filteredAndSortedRecords.length > 0 ? filteredAndSortedRecords : records;
    if (target.length === 0) {
      showToast('No hay registros para la presentación PowerPoint', 'info');
      return;
    }
    showToast('Generando presentación PowerPoint (.pptx)...', 'info');
    const ok = await exportDeploymentsToPowerPoint(target);
    if (ok) {
      showToast('Presentación PowerPoint descargada con éxito', 'success');
    }
  };

  const handleExportPowerPointSelected = (selected: DeploymentRecord[]) => {
    handleOpenPresentation(selected);
  };

  // Clear data (leaves table empty)
  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar la tabla por completo para comenzar a ingresar tus datos desde cero?')) {
      clearAllDeployments();
      setRecords([]);
      setFilters(initialFilters);
      showToast('Tabla vaciada. Lista para ingresar nuevos registros.', 'info');
    }
  };

  // Load demo data if user asks
  const handleLoadDemoData = () => {
    if (window.confirm('¿Deseas cargar 15 registros de ejemplo para probar la plataforma?')) {
      const demo = resetToDemoData();
      setRecords(demo);
      setFilters(initialFilters);
      showToast('Datos de ejemplo cargados');
    }
  };

  // Sync Push (Upload local items to Supabase)
  const handleSyncPush = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Configura Supabase primero', 'error');
      return;
    }
    if (records.length === 0) {
      showToast('No hay registros locales para subir', 'info');
      return;
    }
    try {
      for (const rec of records) {
        await insertDeploymentToSupabase(rec);
      }
      showToast(`${records.length} registros subidos a Supabase con éxito`, 'success');
    } catch (err: any) {
      showToast(`Error al subir datos: ${err.message}`, 'error');
    }
  };

  // Sync Pull (Download records from Supabase)
  const handleSyncPull = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Configura Supabase primero', 'error');
      return;
    }
    try {
      const supaRecords = await fetchDeploymentsFromSupabase();
      setRecords(supaRecords);
      saveDeployments(supaRecords);
      showToast(`${supaRecords.length} registros descargados de Supabase`, 'success');
    } catch (err: any) {
      showToast(`Error al descargar: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenNewModal={() => {
          if (activeTab === 'middleware') {
            const btn = document.getElementById('btn-new-integration');
            if (btn) {
              btn.click();
            }
          } else {
            setEditingRecord(null);
            setIsFormOpen(true);
          }
        }}
        onExportExcel={handleExportExcelAll}
        onOpenPresentation={() => {
          if (activeTab === 'middleware') {
            const btn = document.getElementById('btn-export-middleware-pptx');
            if (btn) {
              btn.click();
              return;
            }
          }
          handleOpenPresentation();
        }}
        onResetData={handleLoadDemoData}
        onClearData={handleClearAll}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenGeminiGuide={() => setIsGeminiGuideOpen(true)}
        isSupabaseActive={isSupabaseActive}
        totalRecords={records.length}
        pendingCount={kpis.pendingVerificationCount}
        integrationsCount={integrationsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-6">
        
        {/* TAB 1: MIDDLEWARE INTEGRATIONS VIEW */}
        {activeTab === 'middleware' && (
          <MiddlewareDashboard />
        )}

        {/* TAB 2: DEPLOYMENTS VIEW */}
        {activeTab === 'deployments' && (
          <>
            {/* Top Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Panel de Control de Despliegues a Producción
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Registro, verificación y auditoría de cambios y servicios pasados a producción
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Supabase Indicator Button */}
                <button
                  onClick={() => setIsSupabaseOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 shadow-xs transition-colors"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>{isSupabaseActive ? 'Supabase Sincronizado' : 'Conectar Supabase (SQL)'}</span>
                </button>

                {/* PowerPoint Presentation Button */}
                {records.length > 0 && (
                  <button
                    id="btn-main-powerpoint"
                    onClick={() => handleOpenPresentation()}
                    title="Presentar o descargar diapositivas en PowerPoint (.pptx)"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500/30 shadow-md shadow-orange-600/20 transition-all active:scale-95"
                  >
                    <Presentation className="w-4 h-4 text-white" />
                    <span>Presentación PowerPoint</span>
                  </button>
                )}

                {/* Export Excel Button */}
                {records.length > 0 && (
                  <button
                    onClick={handleExportExcelAll}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Exportar Excel</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State Banner when 0 records exist (only on deployments tab) */}
        {activeTab === 'deployments' && records.length === 0 && !isLoading && (
          <div className="my-8 p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative max-w-lg mx-auto space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                <Database className="w-8 h-8" />
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Tabla lista y vacía para tus datos de producción
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Has iniciado con la base de datos limpia. Puedes comenzar a registrar tus pases a producción manualmente o conectar tu base de datos en Supabase con las queries automáticas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setIsFormOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Primer Pase a Producción</span>
                </button>

                <button
                  onClick={() => setIsSupabaseOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Database className="w-4 h-4" />
                  <span>Ver Queries SQL para Supabase</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span>¿Deseas probar la interfaz primero?</span>
                <button
                  onClick={handleLoadDemoData}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline"
                >
                  Cargar 15 registros de prueba
                </button>
              </div>

            </div>
          </div>
        )}

        {/* When records exist, show Full KPIs, Charts, Filters and Table (only on deployments tab) */}
        {activeTab === 'deployments' && records.length > 0 && (
          <>
            {/* KPI Metrics Overview */}
            <KpiOverview
              kpis={kpis}
              onFilterPreset={handleKpiFilterPreset}
              activePreset={filters.datePreset === 'thisMonth' ? 'thisMonth' : filters.datePreset === 'last7days' ? 'recent' : undefined}
            />

            {/* Visual Charts & Distribution */}
            <DeploymentCharts kpis={kpis} />

            {/* Search, Filter Bar & Quick Tags */}
            <DeploymentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableProducts={availableProducts}
              totalResults={filteredAndSortedRecords.length}
            />

            {/* High-Density Deployment Table */}
            <DeploymentTable
              records={filteredAndSortedRecords}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onViewDetail={(record) => setViewingRecord(record)}
              onEdit={(record) => {
                setEditingRecord(record);
                setIsFormOpen(true);
              }}
              onChangeProduct={(record) => setChangingProductRecord(record)}
              onDelete={(record) => setDeletingRecord(record)}
              onDuplicate={handleDuplicateRecord}
              onExportSelected={handleExportExcelSelected}
              onPresentSelected={handleExportPowerPointSelected}
              onBulkVerify={handleBulkVerify}
              onBulkDelete={handleBulkDelete}
              onResetFilters={handleResetFilters}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ProdTracker Enterprise v3.8 • Control de Pases y Auditoría GDD</span>
          <span>{isSupabaseActive ? '🟢 Sincronizado con Supabase PostgreSQL' : '⚪ Almacenamiento Local Activo'} • Exportación Excel (.xlsx) & PowerPoint (.pptx)</span>
        </div>
      </footer>

      {/* Form Modal (New / Edit) */}
      <DeploymentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveDeployment}
        initialData={editingRecord}
        existingProducts={availableProducts}
        lastGddNumber={lastGddNumber}
      />

      {/* GDD Full Detail Modal */}
      <DeploymentDetailModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
        onEdit={(record) => {
          setEditingRecord(record);
          setIsFormOpen(true);
        }}
        onChangeProduct={(record) => setChangingProductRecord(record)}
        onOpenPresentation={(record) => handleOpenPresentation(record)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Change Product Modal */}
      <ChangeProductModal
        isOpen={Boolean(changingProductRecord)}
        onClose={() => setChangingProductRecord(null)}
        onConfirm={handleConfirmChangeProduct}
        record={changingProductRecord}
        existingProducts={availableProducts}
      />

      {/* Single / Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingRecord) || bulkDeleteIds.length > 0}
        onClose={() => {
          setDeletingRecord(null);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleDeleteConfirm}
        record={deletingRecord}
        count={bulkDeleteIds.length > 0 ? bulkDeleteIds.length : 1}
      />

      {/* Supabase Connection & SQL Queries Assistant Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConnectionChange={loadData}
        onSyncPush={handleSyncPush}
        onSyncPull={handleSyncPull}
        localCount={records.length}
      />

      {/* PowerPoint Interactive Presentation & PPTX Export Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => {
          setIsPresentationOpen(false);
          setPresentationCustomRecords(null);
        }}
        records={
          presentationCustomRecords ||
          (filteredAndSortedRecords.length > 0 ? filteredAndSortedRecords : records)
        }
      />

      {/* Gemini AI Assistant Chatbot (ProdBot) */}
      <GeminiChatbot
        deployments={records}
        middleware={middlewareRecords}
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        onOpenNewDeployment={() => {
          setEditingRecord(null);
          setIsFormOpen(true);
        }}
      />

      {/* Gemini Connection Guide Modal */}
      <GeminiConnectionModal
        isOpen={isGeminiGuideOpen}
        onClose={() => setIsGeminiGuideOpen(false)}
      />

    </div>
  );
};

