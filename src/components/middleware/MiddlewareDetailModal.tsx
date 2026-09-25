import React from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  User, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Globe, 
  Puzzle, 
  Rocket, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Presentation,
  FileSpreadsheet,
  Code2
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';
import { exportMiddlewareToExcel } from '../../utils/exportToExcel';

interface MiddlewareDetailModalProps {
  integration: MiddlewareIntegration | null;
  onClose: () => void;
  onEdit: (integration: MiddlewareIntegration) => void;
  onDelete: (integration: MiddlewareIntegration) => void;
  onPresent?: (integration: MiddlewareIntegration) => void;
}

export const MiddlewareDetailModal: React.FC<MiddlewareDetailModalProps> = ({
  integration,
  onClose,
  onEdit,
  onDelete,
  onPresent,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  if (!integration) return null;

  const handleCopyEndpoint = () => {
    if (integration.endpointBase) {
      navigator.clipboard.writeText(integration.endpointBase);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En Producción':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">En Producción</span>;
      case 'En Testing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">En Testing</span>;
      case 'En Desarrollo':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">En Desarrollo</span>;
      case 'Planificado':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Planificado</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="modal-middleware-detail"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase font-mono" title="Número de GDD">
                  {integration.codigoApp ? `GDD: ${integration.codigoApp}` : 'GDD-MW'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{integration.categoria}</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {integration.nombre}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(integration);
              }}
              title="Editar integración"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status & Progress Bar Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Estado Operativo
              </span>
              {getStatusBadge(integration.estado)}
            </div>

            <div className="w-full sm:w-64">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-400">Avance General</span>
                <span className="text-blue-400 font-bold">{integration.progreso}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${integration.progreso}%` }}
                />
              </div>
            </div>
          </div>

          {/* Plataforma / Grupo & Observaciones Banner */}
          {integration.plataformaGrupo && (
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 p-4 rounded-xl border border-blue-800/40 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Plataforma / Grupo Asignado
                  </span>
                  <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>{integration.plataformaGrupo}</span>
                  </span>
                </div>

                {integration.observacion && (
                  <span className="text-xs px-3 py-1 bg-slate-800/90 text-slate-300 rounded-lg border border-slate-700/80 italic">
                    "{integration.observacion}"
                  </span>
                )}
              </div>

              {/* Componentes Relacionados */}
              {integration.componentesRelacionados && integration.componentesRelacionados.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Componentes & Microservicios Vinculados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.componentesRelacionados.map((comp) => (
                      <span
                        key={comp}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-blue-300 border border-blue-900/60 rounded-md text-xs font-mono"
                      >
                        <Puzzle className="w-3 h-3 text-blue-400" />
                        <span>{comp}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4 Metrics Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-center">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-xl font-bold text-white block leading-none">
                {integration.mesesEjecucion}
              </span>
              <span className="text-[11px] text-slate-400">Meses Ejecución</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-center">
              <Rocket className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-xl font-bold text-white block leading-none">
                {integration.desplieguesCount}
              </span>
              <span className="text-[11px] text-slate-400">Despliegues Totales</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-center">
              <Puzzle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-xl font-bold text-white block leading-none">
                {integration.serviciosCount}
              </span>
              <span className="text-[11px] text-slate-400">Servicios / Endpoints</span>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-center">
              <ShieldCheck className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-sm font-bold text-white block truncate leading-tight">
                {integration.releaseActual}
              </span>
              <span className="text-[11px] text-slate-400">Release Actual</span>
            </div>
          </div>

          {/* Technical Scope & Description */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Alcance y Detalle de la Integración
            </span>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {integration.descripcion || 'Sin descripción detallada.'}
            </div>
          </div>

          {/* Tech Stack */}
          {integration.tecnologias && integration.tecnologias.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Tecnologías & Componentes Arquitectónicos
              </span>
              <div className="flex flex-wrap gap-2">
                {integration.tecnologias.map((tech) => (
                  <span 
                    key={tech} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                  >
                    <Cpu className="w-3 h-3 text-blue-400" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Endpoint and Repo links */}
          <div className="space-y-3">
            {integration.endpointBase && (
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Endpoint Base</span>
                    <code className="text-blue-300 font-mono text-xs truncate block">{integration.endpointBase}</code>
                  </div>
                </div>
                <button
                  onClick={handleCopyEndpoint}
                  className="p-1.5 text-slate-400 hover:text-white rounded transition-colors shrink-0"
                  title="Copiar URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            {integration.repoUrl && (
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Repositorio / Documentación</span>
                    <a 
                      href={integration.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-mono text-xs truncate block"
                    >
                      {integration.repoUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer: Responsable, Desarrollador & Dates */}
          <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              {integration.desarrolladorACargo && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/40 text-indigo-300">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Desarrollador a Cargo: <strong className="text-white">{integration.desarrolladorACargo}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Responsable / Lead: <strong className="text-slate-200">{integration.responsable}</strong></span>
              </div>
            </div>
            {integration.fechaInicio && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Inicio: {integration.fechaInicio}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(integration);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar integración</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                exportMiddlewareToExcel([integration], `ProdTracker_${integration.codigoApp || integration.nombre.replace(/\s+/g, '_')}`);
              }}
              title="Descargar ficha de esta integración en Excel (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>

            {onPresent && (
              <button
                onClick={() => {
                  onClose();
                  onPresent(integration);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Presentation className="w-3.5 h-3.5 text-orange-400" />
                <span>Presentar en PowerPoint</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
