import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  Globe, 
  Sparkles,
  Terminal,
  Layers,
  ArrowDownToLine,
  ArrowUpToLine,
  Trash2
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCRIPT,
  isSupabaseConfigured
} from '../utils/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: () => void;
  onSyncPush?: () => void;
  onSyncPull?: () => void;
  localCount: number;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
  onSyncPush,
  onSyncPull,
  localCount,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'config'>('sql');
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy SQL script:', err);
    }
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa la URL del proyecto y la Anon Key de Supabase.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      onConnectionChange();
    }
  };

  const handleResetToEnv = () => {
    clearSupabaseConfig();
    const envConfig = getSupabaseConfig();
    setUrl(envConfig.url);
    setAnonKey(envConfig.anonKey);
    setTestResult(null);
    onConnectionChange();
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Conexión con Supabase & Script SQL
                </h2>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Configurado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Modo Local
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea la tabla en tu base de datos Supabase y sincroniza tus pases a producción
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

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. Script SQL para Crear Tabla</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. Conectar Credenciales (URL & Key)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {activeTab === 'sql' ? (
            <div className="space-y-4">
              
              {/* Step instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">1</span>
                    <span>Copiar el Script</span>
                  </div>
                  <p className="text-slate-400">
                    Haz clic en el botón verde inferior para copiar el código SQL completo.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">2</span>
                    <span>Abrir SQL Editor</span>
                  </div>
                  <p className="text-slate-400">
                    En Supabase, ve a <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, pega el código y presiona <strong>Run</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs">3</span>
                    <span>Ingresar Keys</span>
                  </div>
                  <p className="text-slate-400">
                    Pasa a la pestaña de Credenciales para vincular tu Project URL y Anon Key.
                  </p>
                </div>
              </div>

              {/* Action Bar with Copy Button */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-2.5 rounded-t-xl border-t border-x border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>schema_deployments.sql</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <span>Ir a Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Script SQL'}</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-b-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-72 leading-relaxed">
                <pre>{SUPABASE_SQL_SCRIPT}</pre>
              </div>

            </div>
          ) : (
            <div className="space-y-5">
              
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-xs text-indigo-200 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  ¿Dónde encuentro mis credenciales en Supabase?
                </p>
                <p className="text-slate-300">
                  En tu panel de Supabase: ve a <strong>Project Settings</strong> &gt; <strong>API</strong>. Copia la <strong>Project URL</strong> y la <strong>anon / public Key</strong>.
                </p>
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project URL (VITE_SUPABASE_URL)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Anon Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Connection Status Feedback */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                      testResult.success
                        ? testResult.tableExists
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      testResult.tableExists ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      )
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {testResult.success
                          ? testResult.tableExists
                            ? 'Conexión Exitosa'
                            : 'Atención: Tabla no encontrada'
                          : 'Error de Conexión'}
                      </p>
                      <p className="opacity-90 mt-0.5">{testResult.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetToEnv}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Restablecer valores por defecto
                  </button>

                  <button
                    type="submit"
                    disabled={isTesting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{isTesting ? 'Probando conexión...' : 'Guardar y Probar Conexión'}</span>
                  </button>
                </div>

              </form>

              {/* Sync Helpers */}
              {isConnected && (
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sincronización de Datos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {onSyncPush && (
                      <button
                        onClick={onSyncPush}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <ArrowUpToLine className="w-4 h-4 text-indigo-400" />
                        <span>Subir registros locales a Supabase</span>
                      </button>
                    )}
                    {onSyncPull && (
                      <button
                        onClick={onSyncPull}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                        <span>Descargar registros desde Supabase</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>La tabla inicia limpia para que registres tus pases desde cero.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
