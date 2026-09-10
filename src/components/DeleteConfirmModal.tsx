import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { DeploymentRecord } from '../types/deployment';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record?: DeploymentRecord | null;
  count?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  count = 1,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {count > 1 ? `¿Eliminar ${count} registros?` : '¿Eliminar registro de despliegue?'}
            </h3>
            <p className="text-xs text-slate-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {record && (
          <div className="my-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
            <p><strong>N° GDD:</strong> <span className="font-mono text-indigo-400">{record.numeroGDD}</span></p>
            <p><strong>Producto:</strong> {record.producto}</p>
            <p><strong>Proyecto:</strong> {record.proyecto}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirmar Eliminación</span>
          </button>
        </div>

      </div>
    </div>
  );
};
