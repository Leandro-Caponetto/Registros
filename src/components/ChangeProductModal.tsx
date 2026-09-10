import React, { useState } from 'react';
import { X, Layers, Check, Sparkles, AlertCircle } from 'lucide-react';
import { DeploymentRecord } from '../types/deployment';

interface ChangeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetRecordId: string | null, oldProductName: string, newProductName: string, applyToAll: boolean) => void;
  record: DeploymentRecord | null;
  existingProducts: string[];
}

export const ChangeProductModal: React.FC<ChangeProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  existingProducts,
}) => {
  const [newProductName, setNewProductName] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (record) {
      setNewProductName(record.producto);
      setApplyToAll(false);
      setError('');
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setError('El nombre del producto no puede estar vacío.');
      return;
    }
    onConfirm(record.id, record.producto, newProductName.trim(), applyToAll);
    onClose();
  };

  const commonSuggestions = [
    'Portal Web Clientes',
    'Core Banking API',
    'App Móvil iOS / Android',
    'Pasarela de Pagos',
    'Microservicio Pagos & QR',
    'CRM & Gestión Comercial',
    'BFF Microservicios Gateway',
    'Motor de Autenticación & OAuth',
    'Servicio de Notificaciones Push',
    'Data Analytics & BI Engine',
  ];

  const uniqueSuggestions = Array.from(
    new Set([...existingProducts, ...commonSuggestions])
  ).filter((p) => p !== record.producto);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cambiar Producto / Sistema
              </h2>
              <p className="text-xs text-slate-400">
                Pase: <span className="font-mono text-indigo-300">{record.numeroGDD}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Producto Actual
            </label>
            <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-400 font-medium">
              {record.producto}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Nuevo Nombre de Producto <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={newProductName}
              onChange={(e) => {
                setNewProductName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Escriba el nombre del nuevo producto o sistema..."
              autoFocus
              className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>

          {/* Quick suggestions pills */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sugerencias rápidas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {uniqueSuggestions.slice(0, 8).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setNewProductName(sug)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    newProductName === sug
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Apply to all records with this same old product name option */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300">
                Renombrar también en <strong>todos los demás despliegues</strong> que tengan el producto <span className="text-indigo-300">"{record.producto}"</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Producto</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
