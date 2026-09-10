import React from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Layers, 
  RotateCcw,
  Server,
  Database,
  Trash2
} from 'lucide-react';

interface NavbarProps {
  onOpenNewModal: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  onClearData: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseActive: boolean;
  totalRecords: number;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewModal,
  onExportExcel,
  onResetData,
  onClearData,
  onOpenSupabaseModal,
  isSupabaseActive,
  totalRecords,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-100">
                  ProdTracker
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  PROD LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Sistema de Control y Gestión de Pases a Producción (GDD)
              </p>
            </div>
          </div>

          {/* Center Environment Badge & Metric Pill */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ambiente: <strong className="text-white font-semibold">Producción</strong></span>
            </div>
            <div className="w-px h-3.5 bg-slate-700"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Registros: <strong className="text-indigo-300 font-semibold">{totalRecords}</strong></span>
            </div>
            {pendingCount > 0 && (
              <>
                <div className="w-px h-3.5 bg-slate-700"></div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span><strong>{pendingCount}</strong> por verificar</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Supabase Connection & SQL Button */}
            <button
              id="btn-open-supabase"
              onClick={onOpenSupabaseModal}
              title="Conexión Supabase y Queries SQL"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Supabase</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-900 border border-slate-700">
                {isSupabaseActive ? 'ONLINE' : 'SQL'}
              </span>
            </button>

            {/* Quick Demo Data / Reset dropdown or buttons */}
            {totalRecords > 0 && (
              <button
                id="btn-clear-table"
                onClick={onClearData}
                title="Vaciar tabla para ingresar datos limpios"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {totalRecords === 0 && (
              <button
                id="btn-load-demo"
                onClick={onResetData}
                title="Cargar registros de ejemplo"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ejemplo</span>
              </button>
            )}

            {/* Export to Excel Button */}
            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* New Deployment Button */}
            <button
              id="btn-new-deployment"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

