import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  RefreshCw,
  Cpu,
  Layers,
  FileCode,
  Lock
} from 'lucide-react';

interface GeminiConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestConnectionSuccess?: () => void;
}

export const GeminiConnectionModal: React.FC<GeminiConnectionModalProps> = ({
  isOpen,
  onClose,
  onTestConnectionSuccess
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    connected: boolean;
    model: string;
    instruction: string;
  } | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/gemini/status');
      const data = await res.json();
      setStatusResult(data);
      if (data.connected && onTestConnectionSuccess) {
        onTestConnectionSuccess();
      }
    } catch (err) {
      setStatusResult({
        connected: false,
        model: 'gemini-3.8-flash',
        instruction: 'Error al conectar con el servidor backend /api/gemini/status.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Guía de Conexión con Google Gemini
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paso a paso para conectar tu API Key y activar el asistente inteligente ProdBot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-400">Estado de Conexión actual:</span>
            {isChecking ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                Verificando conexión...
              </span>
            ) : statusResult?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado y Operativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Esperando GEMINI_API_KEY
              </span>
            )}
          </div>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Comprobar Estado</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto custom-scrollbar">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">
                    Obtén tu API Key gratuita en Google AI Studio
                  </h4>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
                  >
                    Abrir Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingresa con tu cuenta de Google en AI Studio y haz clic en <strong>"Create API key"</strong>. ProdTracker utiliza el modelo oficial <strong>gemini-3.8-flash</strong>, el cual cuenta con un nivel gratuito muy generoso para análisis de código, texto y datos.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-bold text-slate-100">
                  Configurar en el panel de Google AI Studio (Recomendado)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  En el entorno de Google AI Studio, las variables de entorno confidenciales se administran de forma segura a través de los secretos del proyecto:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1 font-mono text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                    <span>Nombre de la variable secreta</span>
                    <button 
                      onClick={() => copyToClipboard('GEMINI_API_KEY', 'var')}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedText === 'var' ? '¡Copiado!' : <><Copy className="w-3 h-3" /> Copiar</>}
                    </button>
                  </div>
                  <p className="text-emerald-400 font-bold">GEMINI_API_KEY</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  📍 Ubicación: Panel lateral / superior <strong>Settings &gt; Secrets</strong> &rarr; Añadir secreto con nombre <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">GEMINI_API_KEY</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-bold text-slate-100">
                  Configuración en Entorno Local o Servidor (.env)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Si estás clonando el repositorio o desplegando la aplicación en tu propio servidor o contenedor Docker, añade tu clave en tu archivo <code className="text-emerald-300 font-mono">.env</code>:
                </p>
                <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
                  <pre className="text-slate-300 overflow-x-auto">
                    GEMINI_API_KEY="tu_clave_secreta_de_google_aqui"
                  </pre>
                  <button
                    onClick={() => copyToClipboard('GEMINI_API_KEY="tu_clave_secreta_de_google_aqui"', 'env')}
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedText === 'env' ? '¡Copiado!' : <><Copy className="w-3 h-3" /> Copiar</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Security Architecture */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Arquitectura Segura y Sin Exposición de Claves</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ProdTracker implementa la arquitectura recomendada para producción:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Cliente Frontend</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  El navegador nunca almacena ni conoce la API Key. Envía el chat y contexto al endpoint <code className="text-indigo-300">/api/gemini/chat</code>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>2. Backend Seguro</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  El servidor Express (<code className="text-purple-300">server.ts</code>) inicializa <code className="text-purple-300">@google/genai</code> en Node.js de forma privada.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Google Gemini</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  El modelo <code className="text-emerald-300">gemini-3.8-flash</code> procesa los despliegues, Número de GDD e integraciones middleware al instante.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            ¿Dudas? ProdBot puede responderte preguntas sobre el sistema incluso antes de configurar la clave.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Entendido, volver al Chat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
