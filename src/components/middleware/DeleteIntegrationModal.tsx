import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Link as LinkIcon, 
  Layers, 
  ShieldAlert,
  Puzzle,
  Rocket,
  RotateCcw
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';

interface DeleteIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  integration: MiddlewareIntegration | null;
}

export const DeleteIntegrationModal: React.FC<DeleteIntegrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  integration,
}) => {
  // Handle ESC key press to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !integration) return null;

  const isProduction = integration.estado === 'En Producción';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-delete-integration"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        
        {/* Top Accent Warning Bar */}
        <div className={`h-1.5 w-full ${isProduction ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500' : 'bg-gradient-to-r from-rose-600 to-amber-500'}`} />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl ${isProduction ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'} shadow-inner shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-400 tracking-wider uppercase block font-mono">
                Confirmación de Eliminación
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                ¿Eliminar {integration.nombre}?
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Estás a punto de eliminar la siguiente integración de la plataforma de Middleware:
          </p>

          {/* Integration Summary Card Preview */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-400 font-bold block">
                      {integration.codigoApp || 'APP-MW'}
                    </span>
                    {integration.plataformaGrupo && (
                      <span className="text-[10px] px-2 py-0.2 bg-blue-950/80 text-blue-300 border border-blue-800/50 rounded font-semibold">
                        {integration.plataformaGrupo}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {integration.nombre}
                  </h4>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${
                isProduction 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {integration.estado}
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Avance</span>
                <span className="text-white font-bold">{integration.progreso}%</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Servicios</span>
                <span className="text-white font-bold">{integration.serviciosCount}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Despliegues</span>
                <span className="text-white font-bold">{integration.desplieguesCount}</span>
              </div>
            </div>

            {integration.descripcion && (
              <p className="text-[11px] text-slate-400 line-clamp-2 italic pt-1">
                "{integration.descripcion}"
              </p>
            )}
          </div>

          {/* Production Critical Warning if applicable */}
          {isProduction && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-normal">
                <strong>Alerta crítica:</strong> Esta integración está marcada como <strong>En Producción</strong>. Al borrarla, se descontará inmediatamente de los indicadores ejecutivos de producción y de los reportes en PowerPoint.
              </p>
            </div>
          )}

          {/* Undo Security Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300">
            <RotateCcw className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Recuperación rápida:</strong> Podrás deshacer esta eliminación inmediatamente desde el aviso de notificación emergente en pantalla.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 pt-5 mt-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Definitivamente</span>
          </button>
        </div>

      </div>
    </div>
  );
};
