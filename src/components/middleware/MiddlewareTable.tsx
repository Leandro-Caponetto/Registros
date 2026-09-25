import React from 'react';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  Edit3, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Cpu, 
  ArrowUpDown,
  Presentation,
  Code2
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';

interface MiddlewareTableProps {
  integrations: MiddlewareIntegration[];
  onView: (integration: MiddlewareIntegration) => void;
  onEdit: (integration: MiddlewareIntegration) => void;
  onDelete: (integration: MiddlewareIntegration) => void;
  onPresent?: (integration: MiddlewareIntegration) => void;
}

export const MiddlewareTable: React.FC<MiddlewareTableProps> = ({
  integrations,
  onView,
  onEdit,
  onDelete,
  onPresent,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En Producción':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            En Producción
          </span>
        );
      case 'En Testing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            En Testing
          </span>
        );
      case 'En Desarrollo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            En Desarrollo
          </span>
        );
      case 'Planificado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Planificado
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4">Proyecto / App Middleware</th>
              <th className="py-3 px-3">Plataforma / Grupo</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3 min-w-[140px]">Avance General</th>
              <th className="py-3 px-3 text-center">Meses</th>
              <th className="py-3 px-3 text-center">Despliegues</th>
              <th className="py-3 px-3 text-center">Servicios</th>
              <th className="py-3 px-3">Release Actual</th>
              <th className="py-3 px-3">Responsable / Dev</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {integrations.map((item) => (
              <tr 
                key={item.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Nombre & Código */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold block" title="Número de GDD">
                        {item.codigoApp ? `GDD: ${item.codigoApp}` : 'GDD-MW'}
                      </span>
                      <span 
                        onClick={() => onView(item)}
                        className="font-bold text-white group-hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        {item.nombre}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Plataforma / Grupo */}
                <td className="py-3 px-3">
                  {item.plataformaGrupo ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60 text-[11px] font-semibold whitespace-nowrap">
                      {item.plataformaGrupo}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">-</span>
                  )}
                </td>

                {/* Categoría */}
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                    {item.categoria}
                  </span>
                </td>

                {/* Estado */}
                <td className="py-3 px-3">
                  {getStatusBadge(item.estado)}
                </td>

                {/* Avance % */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${item.progreso}%` }}
                      />
                    </div>
                    <span className="font-bold text-blue-400 text-[11px] w-8 text-right">
                      {item.progreso}%
                    </span>
                  </div>
                </td>

                {/* Meses */}
                <td className="py-3 px-3 text-center font-bold text-slate-200">
                  {item.mesesEjecucion}m
                </td>

                {/* Despliegues */}
                <td className="py-3 px-3 text-center font-bold text-slate-200">
                  {item.desplieguesCount}
                </td>

                {/* Servicios */}
                <td className="py-3 px-3 text-center font-bold text-slate-200">
                  {item.serviciosCount}
                </td>

                {/* Release */}
                <td className="py-3 px-3">
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    {item.releaseActual}
                  </span>
                </td>

                {/* Responsable & Dev */}
                <td className="py-3 px-3">
                  <div className="text-slate-200 font-medium truncate max-w-[140px]" title={item.responsable}>
                    {item.responsable}
                  </div>
                  {item.desarrolladorACargo && (
                    <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-medium mt-0.5 truncate max-w-[140px]" title={`Dev: ${item.desarrolladorACargo}`}>
                      <Code2 className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{item.desarrolladorACargo}</span>
                    </div>
                  )}
                </td>

                {/* Acciones */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onPresent && (
                      <button
                        onClick={() => onPresent(item)}
                        title="Presentar en PowerPoint Mode"
                        className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onView(item)}
                      title="Ver detalle"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
