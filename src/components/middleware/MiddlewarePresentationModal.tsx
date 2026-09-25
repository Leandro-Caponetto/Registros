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
  Tag,
  Puzzle,
  ExternalLink,
  GitBranch,
  Terminal,
  Activity,
  Rocket,
  Check
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';
import { exportMiddlewareOnlyToPowerPoint } from '../../utils/exportToPowerPoint';

interface MiddlewarePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: MiddlewareIntegration[];
  initialIntegrationId?: string | null;
}

export const MiddlewarePresentationModal: React.FC<MiddlewarePresentationModalProps> = ({
  isOpen,
  onClose,
  integrations,
  initialIntegrationId,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Slides structure:
  // Slide 0: Cover Slide (Portada Middleware)
  // Slide 1: Executive KPI & Platforms Summary
  // Slide 2: Consolidated Middleware Matrix Table
  // Slides 3 to (3 + integrations.length - 1): Detailed Slide per Integration
  // Final Slide: Quality & Governance Closing
  const totalSlides = integrations.length > 0 ? 3 + integrations.length + 1 : 1;

  // Reset or focus slide whenever opened
  useEffect(() => {
    if (isOpen) {
      if (initialIntegrationId) {
        const foundIdx = integrations.findIndex((i) => i.id === initialIntegrationId);
        if (foundIdx >= 0) {
          setCurrentSlide(3 + foundIdx);
        } else {
          setCurrentSlide(0);
        }
      } else {
        setCurrentSlide(0);
      }
      setIsAutoPlay(false);
    }
  }, [isOpen, initialIntegrationId, integrations]);

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
          document.exitFullscreen().catch(() => {});
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
      await exportMiddlewareOnlyToPowerPoint(integrations);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  // KPIs
  const prodCount = integrations.filter((r) => r.estado === 'En Producción').length;
  const devCount = integrations.filter((r) => r.estado === 'En Desarrollo').length;
  const testCount = integrations.filter((r) => r.estado === 'En Testing').length;
  const planCount = integrations.filter((r) => r.estado === 'Planificado').length;

  const totalServicios = integrations.reduce((acc, curr) => acc + (curr.serviciosCount || 0), 0);
  const totalDespliegues = integrations.reduce((acc, curr) => acc + (curr.desplieguesCount || 0), 0);
  const avgProgress = integrations.length > 0 
    ? Math.round(integrations.reduce((acc, curr) => acc + (curr.progreso || 0), 0) / integrations.length)
    : 0;

  // Breakdown by Platform / Group
  const platformCounts: Record<string, number> = {};
  integrations.forEach((r) => {
    const group = r.plataformaGrupo || 'General';
    platformCounts[group] = (platformCounts[group] || 0) + 1;
  });
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);

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
                Presentación Ejecutiva de Integraciones Middleware
              </h2>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                PowerPoint Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Diapositiva <strong className="text-orange-400">{currentSlide + 1}</strong> de <strong>{totalSlides}</strong> • {integrations.length} integración(es) incluidas
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
              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Meta */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                  <Layers className="w-3.5 h-3.5" />
                  <span>PRODTRACKER ENTERPRISE • ECOSISTEMA MIDDLEWARE & INTEGRACIONES</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Presentación de Integraciones y Microservicios Middleware
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                  Informe Ejecutivo de Estado, Plataformas / Grupos, Microservicios y Control de Despliegues en Arquitectura Crítica.
                </p>
              </div>

              {/* Bottom Metrics Cards */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">Total Integraciones</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1 block">
                    {integrations.length}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-bold text-slate-500 block">En Producción</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">
                    {prodCount} ({integrations.length > 0 ? Math.round((prodCount / integrations.length) * 100) : 0}%)
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
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Resumen Ejecutivo</span>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Métricas Globales de Middleware
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    KPIs Ecosistema
                  </span>
                </div>

                {/* 4 Mini Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">En Producción</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{prodCount}</div>
                    <span className="text-[11px] text-slate-400">Activas & Estables</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">En Desarrollo</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{devCount}</div>
                    <span className="text-[11px] text-slate-400">En Construcción</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Servicios Conectados</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{totalServicios}</div>
                    <span className="text-[11px] text-slate-400">Microservicios</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Total Despliegues</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{totalDespliegues}</div>
                    <span className="text-[11px] text-slate-400">Pases Ejecutados</span>
                  </div>
                </div>

                {/* 2 Split Columns: Platforms Breakdown + Quality & Architecture */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Distribución por Plataforma / Grupo</span>
                    </h3>
                    <div className="space-y-2">
                      {topPlatforms.slice(0, 5).map(([plat, count]) => (
                        <div key={plat} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                          <span className="text-slate-200 font-medium truncate max-w-[200px]">{plat}</span>
                          <span className="font-bold text-blue-400 font-mono">{count} app(s)</span>
                        </div>
                      ))}
                      {topPlatforms.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No hay plataformas registradas.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Avance Promedio & Arquitectura</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Progreso Global de Implementación:</span>
                          <span className="font-bold text-blue-400 font-mono">{avgProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-300 pt-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Ecosistema modular con {integrations.length} proyectos orquestados.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Trazabilidad de endpoints, repositorios Git y componentes vinculados.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 flex justify-between">
                <span>ProdTracker Middleware Suite</span>
                <span>Arquitectura & Orquestación</span>
              </div>
            </div>
          )}

          {/* SLIDE 2: CONSOLIDATED MIDDLEWARE MATRIX */}
          {currentSlide === 2 && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-900 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Matriz Consolidada</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Tabla General de Integraciones Middleware
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {integrations.length} registros
                  </span>
                </div>

                {/* Dense Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Nº GDD</th>
                        <th className="py-2.5 px-3">Plataforma / Grupo</th>
                        <th className="py-2.5 px-3">Aplicación / Integración</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3 text-center">Servicios</th>
                        <th className="py-2.5 px-3 text-center">Despliegues</th>
                        <th className="py-2.5 px-3 text-center">Release</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {integrations.slice(0, 7).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-400">{item.codigoApp || 'MW-00'}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/50 truncate max-w-[120px] inline-block">
                              {item.plataformaGrupo || 'General'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-200 truncate max-w-[170px]">{item.nombre}</td>
                          <td className="py-2 px-3 text-slate-400">{item.categoria}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.estado === 'En Producción' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : item.estado === 'En Desarrollo'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.estado}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-300">{item.serviciosCount || 0}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-300">{item.desplieguesCount || 0}</td>
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-emerald-400 font-bold">{item.releaseActual || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {integrations.length > 7 && (
                  <p className="mt-2 text-[11px] text-slate-500 italic text-right">
                    * Mostrando 7 de {integrations.length} integraciones. Las siguientes diapositivas muestran cada aplicación en detalle.
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Navega con las flechas o el menú inferior</span>
                <span>Auditoría de Middleware</span>
              </div>
            </div>
          )}

          {/* SLIDES 3 TO (3 + integrations.length - 1): DETAILED INTEGRATION SLIDE */}
          {currentSlide >= 3 && currentSlide < 3 + integrations.length && (() => {
            const index = currentSlide - 3;
            const item = integrations[index];
            if (!item) return null;

            return (
              <div className="flex-1 p-6 sm:p-9 flex flex-col justify-between bg-slate-900 overflow-y-auto">
                <div>
                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Integración #{index + 1} de {integrations.length}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                          {item.codigoApp || 'MW-APP'}
                        </span>
                        {item.plataformaGrupo && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-700/60 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-blue-400" />
                            <span>{item.plataformaGrupo}</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                        {item.nombre}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Categoría: <strong className="text-slate-200">{item.categoria}</strong> • Responsable: <strong className="text-slate-200">{item.responsable || 'Equipo Middleware'}</strong>
                      </p>
                    </div>

                    {/* Status & Release Pill Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        item.estado === 'En Producción'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.estado === 'En Desarrollo'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.estado}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <span>Release: <strong className="text-emerald-400">{item.releaseActual || '1.0.0'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Two Cards Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Left Detail & Scope (2 Cols) */}
                    <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col space-y-3">
                      <div>
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Descripción & Alcance de la Integración</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {item.descripcion || 'Sin descripción detallada registrada para esta integración.'}
                        </p>
                      </div>

                      {/* Observación de la Plataforma */}
                      {item.observacion && (
                        <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs">
                          <span className="font-bold text-blue-300 block mb-0.5 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-blue-400" />
                            <span>Observación de la Plataforma:</span>
                          </span>
                          <span className="text-slate-300">{item.observacion}</span>
                        </div>
                      )}

                      {/* Componentes / Microservicios Vinculados */}
                      {item.componentesRelacionados && item.componentesRelacionados.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Componentes & Microservicios Vinculados ({item.componentesRelacionados.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.componentesRelacionados.map((comp) => (
                              <span
                                key={comp}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 text-blue-300 border border-blue-900/60 rounded text-[11px] font-mono"
                              >
                                <Puzzle className="w-3 h-3 text-blue-400" />
                                <span>{comp}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tecnologías */}
                      {item.tecnologias && item.tecnologias.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Stack Tecnológico:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.tecnologias.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700/60 rounded text-[11px]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Endpoints & Repo */}
                      {(item.endpointBase || item.repoUrl) && (
                        <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {item.endpointBase && (
                            <div className="p-2 bg-slate-900/80 rounded border border-slate-800 truncate">
                              <span className="text-[10px] text-slate-500 font-bold block">ENDPOINT BASE</span>
                              <span className="text-blue-400 font-mono text-[11px]">{item.endpointBase}</span>
                            </div>
                          )}
                          {item.repoUrl && (
                            <div className="p-2 bg-slate-900/80 rounded border border-slate-800 truncate">
                              <span className="text-[10px] text-slate-500 font-bold block">REPOSITORIO</span>
                              <span className="text-slate-300 font-mono text-[11px]">{item.repoUrl}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Metrics Card (1 Col) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                        Indicadores de Gestión
                      </h3>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Avance de Implementación</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${item.progreso}%` }} 
                            />
                          </div>
                          <span className="font-bold text-blue-400 font-mono">{item.progreso}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Servicios</span>
                          <span className="text-lg font-bold text-white font-mono">{item.serviciosCount || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Despliegues</span>
                          <span className="text-lg font-bold text-white font-mono">{item.desplieguesCount || 0}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Meses en Ejecución</span>
                        <span className="text-slate-200 font-semibold">{item.mesesEjecucion || 1} mes(es)</span>
                      </div>

                      {item.desarrolladorACargo && (
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Desarrollador a Cargo</span>
                          <span className="text-blue-400 font-semibold">{item.desarrolladorACargo}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Responsable</span>
                        <span className="text-slate-200 font-semibold">{item.responsable || 'Equipo Middleware'}</span>
                      </div>

                      {item.fechaInicio && (
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha de Inicio</span>
                          <span className="text-slate-300 font-mono">{item.fechaInicio}</span>
                        </div>
                      )}

                      {item.fechaLanzamiento && (
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha de Lanzamiento</span>
                          <span className="text-emerald-400 font-mono font-semibold">{item.fechaLanzamiento}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between">
                  <span>Número de GDD: {item.codigoApp || 'MW-00'}</span>
                  <span>ProdTracker Middleware Enterprise</span>
                </div>
              </div>
            );
          })()}

          {/* FINAL SLIDE: GOVERNANCE & CLOSING */}
          {currentSlide === totalSlides - 1 && currentSlide >= 3 && (
            <div className="flex-1 p-8 sm:p-14 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">
                PRODTRACKER ENTERPRISE • MIDDLEWARE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Conectividad y Gobernanza de Middleware Aseguradas
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed mb-6">
                Todas las integraciones y microservicios presentados cumplen con los estándares de trazabilidad, orquestación por plataforma y control de versiones en producción.
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
