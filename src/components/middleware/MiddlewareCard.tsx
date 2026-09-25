import React from 'react';
import { 
  Link as LinkIcon, 
  Layers, 
  Rocket, 
  Puzzle, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Edit3, 
  Eye, 
  Trash2, 
  MoreVertical,
  Cpu,
  Presentation,
  Code2,
  User
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';

interface MiddlewareCardProps {
  integration: MiddlewareIntegration;
  onView: (integration: MiddlewareIntegration) => void;
  onEdit: (integration: MiddlewareIntegration) => void;
  onDelete: (integration: MiddlewareIntegration) => void;
  onPresent?: (integration: MiddlewareIntegration) => void;
}

export const MiddlewareCard: React.FC<MiddlewareCardProps> = ({
  integration,
  onView,
  onEdit,
  onDelete,
  onPresent,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En Producción':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            En Producción
          </span>
        );
      case 'En Testing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            En Testing
          </span>
        );
      case 'En Desarrollo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            En Desarrollo
          </span>
        );
      case 'Planificado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Planificado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-blue-950/20 group">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-600/20 transition-colors">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono" title="Número de GDD">
                {integration.codigoApp ? `GDD: ${integration.codigoApp}` : 'GDD-MW'}
              </span>
              <h3 
                onClick={() => onView(integration)}
                className="text-base font-bold text-white group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-1"
                title={integration.nombre}
              >
                {integration.nombre}
              </h3>
            </div>
          </div>

          <div className="shrink-0">
            {getStatusBadge(integration.estado)}
          </div>
        </div>

        {/* Category, Plataforma & Lead */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-2.5">
          {integration.plataformaGrupo && (
            <span className="px-2 py-0.5 bg-blue-950/70 rounded text-[11px] text-blue-300 border border-blue-800/60 font-semibold">
              {integration.plataformaGrupo}
            </span>
          )}
          <span className="px-2 py-0.5 bg-slate-800/80 rounded text-[11px] text-slate-300 border border-slate-700/60">
            {integration.categoria}
          </span>
          <span>•</span>
          <span className="truncate" title={integration.responsable}>
            {integration.responsable}
          </span>
        </div>

        {/* Desarrollador a Cargo */}
        {integration.desarrolladorACargo && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2.5 py-1 rounded-lg mb-2.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px]">Dev a cargo:</span>
            <span className="font-semibold text-indigo-200 truncate">{integration.desarrolladorACargo}</span>
          </div>
        )}

        {/* Related Components chips if any */}
        {integration.componentesRelacionados && integration.componentesRelacionados.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {integration.componentesRelacionados.slice(0, 3).map((comp) => (
              <span key={comp} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/70 text-blue-300 font-mono border border-slate-700/50">
                {comp}
              </span>
            ))}
            {integration.componentesRelacionados.length > 3 && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                +{integration.componentesRelacionados.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {integration.descripcion || 'Sin descripción adicional disponible.'}
        </p>
      </div>

      {/* Mid: Progress Bar */}
      <div className="my-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Avance</span>
          <span className="text-blue-400 font-bold">{integration.progreso}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${integration.progreso}%` }}
          />
        </div>
      </div>

      {/* Metrics Row (Meses, Despliegues, Servicios, Release) */}
      <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-800/80 text-center text-xs">
        <div>
          <span className="text-white font-bold block">{integration.mesesEjecucion}m</span>
          <span className="text-[10px] text-slate-500">Ejecución</span>
        </div>
        <div>
          <span className="text-white font-bold block">{integration.desplieguesCount}</span>
          <span className="text-[10px] text-slate-500">Despliegues</span>
        </div>
        <div>
          <span className="text-white font-bold block">{integration.serviciosCount}</span>
          <span className="text-[10px] text-slate-500">Servicios</span>
        </div>
      </div>

      {/* Tech Chips */}
      {integration.tecnologias && integration.tecnologias.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2">
          {integration.tecnologias.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
              {t}
            </span>
          ))}
          {integration.tecnologias.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400">
              +{integration.tecnologias.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">{integration.releaseActual}</span>
        </div>

        <div className="flex items-center gap-1">
          {onPresent && (
            <button
              onClick={() => onPresent(integration)}
              title="Presentar en PowerPoint Mode"
              className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
            >
              <Presentation className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onView(integration)}
            title="Ver detalles"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(integration)}
            title="Editar"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(integration)}
            title="Eliminar"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
