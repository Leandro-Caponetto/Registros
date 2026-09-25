import React from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Layers, 
  RotateCcw, 
  Server, 
  Database, 
  Trash2, 
  Presentation, 
  Link as LinkIcon, 
  Cpu,
  Bot,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'deployments' | 'middleware';
  onChangeTab: (tab: 'deployments' | 'middleware') => void;
  onOpenNewModal: () => void;
  onExportExcel: () => void;
  onOpenPresentation: () => void;
  onResetData: () => void;
  onClearData: () => void;
  onOpenSupabaseModal: () => void;
  onOpenChatbot?: () => void;
  onOpenGeminiGuide?: () => void;
  isSupabaseActive: boolean;
  totalRecords: number;
  pendingCount: number;
  integrationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewModal,
  onExportExcel,
  onOpenPresentation,
  onResetData,
  onClearData,
  onOpenSupabaseModal,
  onOpenChatbot,
  onOpenGeminiGuide,
  isSupabaseActive,
  totalRecords,
  pendingCount,
  integrationsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          
          {/* Left Group: Logo & System Navigation Tabs aligned further to the left */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Logo & System Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-slate-100">
                    ProdTracker
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    PROD LIVE
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden md:block">
                  Gestión de Pases a Producción & Middleware
                </p>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="hidden md:block h-5 w-px bg-slate-800/80 mx-0.5" />

            {/* Main Tab Switcher - placed further to the left next to logo */}
            <div className="flex items-center bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                id="tab-btn-deployments"
                onClick={() => onChangeTab('deployments')}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'deployments'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Despliegues Producción</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'deployments' ? 'bg-indigo-900/80 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {totalRecords}
                </span>
              </button>

              <button
                id="tab-btn-middleware"
                onClick={() => onChangeTab('middleware')}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'middleware'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Integraciones Middleware</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'middleware' ? 'bg-blue-900/80 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {integrationsCount}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* ProdBot Gemini AI Chatbot Button */}
            {onOpenChatbot && (
              <button
                id="btn-navbar-prodbot"
                onClick={onOpenChatbot}
                title="Abrir Asistente ProdBot (Google Gemini)"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-xs active:scale-95"
              >
                <div className="relative">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="hidden sm:inline">ProdBot IA</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-sm bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hidden xl:inline">
                  Gemini
                </span>
              </button>
            )}

            {/* Supabase Connection & SQL Button */}
            <button
              id="btn-open-supabase"
              onClick={onOpenSupabaseModal}
              title="Conexión Supabase y Queries SQL"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Supabase</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-900 border border-slate-700">
                {isSupabaseActive ? 'ONLINE' : 'SQL'}
              </span>
            </button>

            {/* Quick Demo Data / Reset button (only on deployments tab) */}
            {activeTab === 'deployments' && totalRecords > 0 && (
              <button
                id="btn-clear-table"
                onClick={onClearData}
                title="Vaciar tabla para ingresar datos limpios"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Export to Excel Button */}
            <button
              id="btn-navbar-export-excel"
              onClick={onExportExcel}
              title={
                activeTab === 'middleware'
                  ? 'Descargar matriz de Middleware en formato Excel (.xlsx)'
                  : 'Descargar reporte de Despliegues en formato Excel (.xlsx)'
              }
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>

            {/* PowerPoint Presentation Button */}
            <button
              id="btn-open-presentation"
              onClick={onOpenPresentation}
              title={
                activeTab === 'middleware'
                  ? 'Presentación ejecutiva de Middleware en PowerPoint (.pptx)'
                  : 'Presentación y diapositivas de servicios en PowerPoint (.pptx)'
              }
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all hover:shadow-xs active:scale-95"
            >
              <Presentation className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">PowerPoint</span>
            </button>

            {/* New Record Button */}
            <button
              id="btn-new-deployment"
              onClick={onOpenNewModal}
              title={activeTab === 'middleware' ? 'Crear nueva integración middleware' : 'Registrar nuevo pase a producción'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 shadow-md ${
                activeTab === 'middleware'
                  ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeTab === 'middleware' ? 'Integración' : 'Registrar'}
              </span>
              <span className="sm:hidden">+</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};


