import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Calendar,
  User,
  CheckCheck,
  FileText,
  ShieldAlert,
  Server,
  Sparkles,
  Presentation,
  Tag
} from 'lucide-react';
import { DeploymentRecord } from '../types/deployment';
import { exportDeploymentsToPowerPoint } from '../utils/exportToPowerPoint';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DeploymentRecord[];
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Slides structure:
  // Slide 0: Cover Slide
  // Slide 1: Executive KPI & Metrics Summary
  // Slide 2: Consolidated Services Matrix Table
  // Slides 3 to (3 + records.length - 1): Detailed Slide per Service
  // Final Slide: Quality & Governance Closing
  const totalSlides = records.length > 0 ? 3 + records.length + 1 : 1;

  // Reset to first slide whenever opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setIsAutoPlay(false);
    }
  }, [isOpen]);

  // Autoplay handler
  useEffect(() => {
    if (!isAutoPlay || !isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay, isOpen, totalSlides]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    },
    [isOpen, totalSlides, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleDownloadPptx = async () => {
    setIsExporting(true);
    try {
      await exportDeploymentsToPowerPoint(records);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  // KPIs
  const verifiedCount = records.filter((r) => r.estado === 'Verificado').length;
  const monitoringCount = records.filter((r) => r.estado === 'En Monitoreo').length;
  const pendingCount = records.filter((r) => r.estado === 'Pendiente').length;
  const hotfixCount = records.filter((r) => r.tipo === 'Hotfix').length;
  const releaseCount = records.filter((r) => r.tipo === 'Release' || r.tipo === 'Feature').length;

  const productCounts: Record<string, number> = {};
  records.forEach((r) => {
    productCounts[r.producto] = (productCounts[r.producto] || 0) + 1;
  });
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-slate-100 animate-in fade-in duration-200">
      
      {/* Top Presentation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Presentación Ejecutiva de Servicios en Producción
              </h2>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                PowerPoint Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Diapositiva <strong className="text-indigo-400">{currentSlide + 1}</strong> de <strong>{totalSlides}</strong> • {records.length} servicio(s) incluidos
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Autoplay button */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isAutoPlay ? 'Pausar reproducción automática' : 'Reproducción automática'}
            className={`p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              isAutoPlay
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden md:inline">{isAutoPlay ? 'Pausar' : 'Auto'}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download PPTX Button */}
          <button
            onClick={handleDownloadPptx}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/20 border border-orange-400/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando .pptx...' : 'Descargar PowerPoint'}</span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Viewer Stage (16:9 Aspect Ratio Container) */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden relative">
        <div className="w-full max-w-5xl aspect-[16/9] max-h-[80vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative select-none">
          
          {/* SLIDE 0: COVER SLIDE */}
          {currentSlide === 0 && (
            <div className="flex-1 p-8 sm:p-14 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Meta */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                  <Layers className="w-3.5 h-3.5" />
                  <span>PRODTRACKER ENTERPRISE • PRODUCCIÓN LIVE</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Presentación de Servicios y Pases a Producción
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                  Informe Ejecutivo de Cambios, Guías de Despliegue (GDD) y Control de Calidad Operacional en Infraestructura Crítica.
                </p>
              </div>

              {/* Bottom Metrics Cards */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">Total Servicios / Pases</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1 block">
                    {records.length}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">Ambiente Objetivo</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">
                    Producción (PROD)
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">Fecha de Emisión</span>
                  <span className="text-sm sm:text-base font-semibold text-slate-300 mt-1 block">
                    {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 1: EXECUTIVE KPIS & METRICS */}
          {currentSlide === 1 && (
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between bg-slate-900 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Resumen Ejecutivo</span>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Métricas de Despliegue y Distribución
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    KPIs Globales
                  </span>
                </div>

                {/* 4 Mini Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Verificados</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{verifiedCount}</div>
                    <span className="text-[11px] text-slate-400">Pases validados</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">En Monitoreo</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{monitoringCount}</div>
                    <span className="text-[11px] text-slate-400">Telemetría activa</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Pendientes</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{pendingCount}</div>
                    <span className="text-[11px] text-slate-400">Por comprobar</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30">
                    <span className="text-[10px] font-bold text-rose-400 uppercase">Hotfixes</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{hotfixCount}</div>
                    <span className="text-[11px] text-slate-400">Correcciones rápidas</span>
                  </div>
                </div>

                {/* 2 Split Columns: Products Breakdown + Quality Assurances */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Despliegues por Producto / Sistema</span>
                    </h3>
                    <div className="space-y-2">
                      {topProducts.slice(0, 5).map(([prod, count]) => (
                        <div key={prod} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                          <span className="text-slate-200 font-medium truncate max-w-[200px]">{prod}</span>
                          <span className="font-bold text-indigo-400 font-mono">{count} pase(s)</span>
                        </div>
                      ))}
                      {topProducts.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No hay productos registrados.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Criterios de Calidad Operacional</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Trazabilidad completa con N° de GDD y responsable.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Plan de contingencia y rollback documentado en cada entrega.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{releaseCount} releases o features planificados e implementados.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 flex justify-between">
                <span>ProdTracker Executive Suite</span>
                <span>Auditoría Continua</span>
              </div>
            </div>
          )}

          {/* SLIDE 2: CONSOLIDATED SERVICES MATRIX */}
          {currentSlide === 2 && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-900 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Matriz Consolidada</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Tabla de Servicios Puestos en Producción
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {records.length} registros
                  </span>
                </div>

                {/* Dense Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">GDD</th>
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-3">Proyecto</th>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3">Autor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {records.slice(0, 7).map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-mono font-bold text-indigo-400">{rec.numeroGDD}</td>
                          <td className="py-2 px-3 font-bold text-slate-200">{rec.producto}</td>
                          <td className="py-2 px-3 text-slate-400 truncate max-w-[150px]">{rec.proyecto}</td>
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                            {rec.fechaImplementacion.slice(0, 10)}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.tipo === 'Hotfix' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-300'
                            }`}>
                              {rec.tipo}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.estado === 'Verificado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              {rec.estado}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">{rec.autor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {records.length > 7 && (
                  <p className="mt-2 text-[11px] text-slate-500 italic text-right">
                    * Mostrando 7 de {records.length} servicios. Las siguientes diapositivas muestran cada servicio en detalle.
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Presione las flechas o use el menú inferior para navegar</span>
                <span>Pases Auditados</span>
              </div>
            </div>
          )}

          {/* SLIDES 3 TO (3 + records.length - 1): DETAILED SERVICE SLIDE */}
          {currentSlide >= 3 && currentSlide < 3 + records.length && (() => {
            const index = currentSlide - 3;
            const record = records[index];
            if (!record) return null;

            return (
              <div className="flex-1 p-6 sm:p-9 flex flex-col justify-between bg-slate-900 overflow-y-auto">
                <div>
                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Servicio #{index + 1} de {records.length}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                          GDD: {record.numeroGDD}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                        {record.producto}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Proyecto: <strong className="text-slate-200">{record.proyecto}</strong> {record.version && `• Versión ${record.version}`}
                      </p>
                    </div>

                    {/* Status & Impact Pill Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        record.estado === 'Verificado'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : record.estado === 'En Monitoreo'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {record.estado}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Tipo: <strong className="text-slate-200">{record.tipo}</strong></span>
                        <span>•</span>
                        <span>Impacto: <strong className="text-amber-300">{record.impacto}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Two Cards Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Left Detail & Release Notes (2 Cols) */}
                    <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                      <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Detalle de Cambios & Release Notes</span>
                      </h3>
                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed flex-1 max-h-48 overflow-y-auto pr-1">
                        {record.detalle || 'Sin detalle especificado.'}
                      </div>

                      {/* Rollback Box */}
                      {record.rollbackPlan && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-amber-500/20 text-xs">
                          <span className="font-bold text-amber-400 block mb-0.5">Plan de Rollback / Contingencia:</span>
                          <span className="text-slate-400">{record.rollbackPlan}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Audit Meta Card (1 Col) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                        Auditoría y Trazabilidad
                      </h3>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha de Implementación</span>
                        <span className="text-slate-200 font-mono font-semibold">
                          {record.fechaImplementacion.replace('T', ' ')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Autor / Responsable</span>
                        <span className="text-slate-200 font-semibold">{record.autor}</span>
                      </div>

                      {record.aprobadoPor && (
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Aprobado Por</span>
                          <span className="text-emerald-400 font-semibold">{record.aprobadoPor}</span>
                        </div>
                      )}

                      {record.jiraTicket && (
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Ticket Jira / Ops</span>
                          <span className="text-indigo-400 font-mono font-semibold">{record.jiraTicket}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Ambiente</span>
                        <span className="text-slate-300">{record.ambiente || 'Producción'}</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between">
                  <span>Guía Oficial: {record.numeroGDD}</span>
                  <span>ProdTracker Enterprise</span>
                </div>
              </div>
            );
          })()}

          {/* FINAL SLIDE: GOVERNANCE & CLOSING */}
          {currentSlide === totalSlides - 1 && currentSlide >= 3 && (
            <div className="flex-1 p-8 sm:p-14 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">
                PRODTRACKER ENTERPRISE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Control y Gobernanza de Producción Asegurados
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed mb-6">
                Todos los servicios y pases a producción presentados cuentan con su respaldo de Guías de Despliegue (GDD), validación de impacto y trazabilidad de autoría.
              </p>

              <button
                onClick={handleDownloadPptx}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar esta presentación en PowerPoint (.pptx)</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Navigation Toolbar & Slide Strip */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center justify-between select-none">
        
        {/* Previous Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Slide Selector & Thumb Dots */}
        <div className="flex items-center gap-2 max-w-[60vw] overflow-x-auto px-2 py-1 scrollbar-none">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              title={`Ir a diapositiva ${idx + 1}`}
              className={`h-2 transition-all rounded-full ${
                currentSlide === idx
                  ? 'w-7 bg-orange-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
