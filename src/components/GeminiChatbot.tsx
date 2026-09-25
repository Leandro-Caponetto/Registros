import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Key,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import { DeploymentRecord } from '../types/deployment';
import { MiddlewareIntegration } from '../types/integration';
import { GeminiConnectionModal } from './GeminiConnectionModal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRetryable?: boolean;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  deployments: DeploymentRecord[];
  middleware: MiddlewareIntegration[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenNewDeployment?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  deployments,
  middleware,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('prodbot_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `👋 **¡Hola! Soy ProdBot**, tu asistente inteligente con **Gemini 3.8 Flash** para ProdTracker.\n\nPuedo responder dudas sobre tus **despliegues a producción**, buscar por **Número de GDD**, analizar riesgos de integraciones middleware y redactar justificaciones técnicas.\n\n¿En qué te puedo ayudar hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    model: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check backend Gemini status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/gemini/status');
      const data = await res.json();
      setConnectionStatus(data);
    } catch (e) {
      setConnectionStatus({ connected: false, model: 'gemini-3.8-flash' });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Save messages to local storage
  useEffect(() => {
    localStorage.setItem('prodbot_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const welcome: Message = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `👋 Chat reiniciado. Estoy listo para ayudarte con tus despliegues a producción y middleware. ¿Qué necesitas consultar?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
  };

  const calculateSystemContext = () => {
    const totalDeployments = deployments.length;
    const pendingDeployments = deployments.filter(d => d.estado === 'Pendiente').length;
    const revertedDeployments = deployments.filter(d => d.estado === 'Revertido').length;
    const verifiedDeployments = deployments.filter(d => d.estado === 'Verificado').length;
    const monitoringDeployments = deployments.filter(d => d.estado === 'En Monitoreo').length;
    const successRate = totalDeployments > 0 
      ? `${Math.round((verifiedDeployments / totalDeployments) * 100)}%` 
      : '0%';

    return {
      totalDeployments,
      pendingDeployments,
      failedDeployments: revertedDeployments,
      successDeployments: verifiedDeployments,
      monitoringDeployments,
      successRate,
      totalMiddleware: middleware.length,
      recentDeployments: deployments.slice(0, 15).map(d => ({
        gdd: d.numeroGDD || 'Sin GDD',
        producto: d.producto,
        proyecto: d.proyecto,
        tipo: d.tipo,
        estado: d.estado,
        impacto: d.impacto,
        ambiente: d.ambiente,
        fecha: d.fechaImplementacion,
        autor: d.autor,
        aprobadoPor: d.aprobadoPor,
        detalle: d.detalle,
      })),
      middlewareList: middleware.slice(0, 15).map(m => ({
        numeroGdd: m.codigoApp || 'MW-00',
        nombre: m.nombre,
        plataformaGrupo: m.plataformaGrupo || 'General',
        categoria: m.categoria,
        estado: m.estado,
        responsable: m.desarrolladorACargo || m.responsable,
        releaseActual: m.releaseActual,
      })),
    };
  };

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const contextData = calculateSystemContext();
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          contextData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const assistantMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRetryable: Boolean(data.isRetryable),
          modelUsed: data.modelUsed,
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (data.connected !== undefined) {
          setConnectionStatus(prev => ({
            connected: data.connected,
            model: data.modelUsed || prev?.model || 'gemini-3.8-flash',
          }));
        }
      } else {
        const errorMessage: Message = {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${data.error || 'Ocurrió un error al contactar al asistente.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRetryable: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error de red al comunicarse con el servidor (/api/gemini/chat). Asegúrate de que el servidor esté activo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRetryable: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        sendMessage(messages[i].content);
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    {
      title: '🔑 ¿Cómo conectar con Gemini?',
      prompt: '¿Cómo conecto mi API Key de Gemini a ProdTracker paso a paso y qué ventajas tiene?',
    },
    {
      title: '📊 Resumen de Despliegues y Fallos',
      prompt: 'Dame un resumen ejecutivo del estado actual de los despliegues a producción: cuántos hay, cuántos fallaron o están pendientes y cuál es la tasa de éxito.',
    },
    {
      title: '🔍 Buscar por Número de GDD',
      prompt: '¿Cuáles son los Números de GDD registrados en el sistema tanto en Despliegues como en Middleware y qué estado tienen?',
    },
    {
      title: '⚠️ Análisis de Riesgo & Rollback',
      prompt: 'Revisa los despliegues con impacto Crítico o Alto y recomiéndame un checklist de verificación y estrategia de rollback.',
    },
    {
      title: '📝 Redactar Justificación para CAB',
      prompt: 'Ayúdame a redactar una justificación formal para un pase a producción urgente ante el Comité de Cambios (CAB).',
    },
  ];

  // Helper to format basic markdown
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-indigo-300 mt-2.5 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-xs font-bold text-slate-200 mt-2 mb-1">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-•*]\s+/, '');
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc leading-relaxed my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s+/.test(line)) {
        const itemText = line.replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} className="text-xs text-slate-300 ml-2 flex items-start gap-1.5 my-1">
            <span className="font-bold text-indigo-400 font-mono shrink-0">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (text: string) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-950 text-indigo-300 font-mono text-[11px] rounded border border-slate-800">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-400 underline hover:text-indigo-300">$1</a>');
    return formatted;
  };

  return (
    <>
      {/* Floating Action Button when closed */}
      {!isOpen && (
        <button
          id="btn-open-chatbot-fab"
          onClick={onToggle}
          title="Abrir Asistente ProdBot (Gemini AI)"
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30"
          aria-label="Abrir Asistente ProdBot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              connectionStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            ProdBot AI
          </span>
          <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-semibold backdrop-blur-xs">
            Gemini 3.8
          </span>
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          id="prodbot-window"
          className={`fixed z-40 transition-all duration-200 flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md ${
            isExpanded
              ? 'inset-4 sm:inset-8 md:inset-12'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Bot className="w-4 h-4 text-white" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-slate-900 ${
                  connectionStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1">
                    ProdBot
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                      Gemini 3.8 Flash
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {connectionStatus?.connected ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini Conectado
                    </span>
                  ) : (
                    <button 
                      onClick={() => setIsGuideOpen(true)}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 underline underline-offset-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      ¿Cómo conectar Gemini?
                    </button>
                  )}
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    {deployments.length} despliegues
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsGuideOpen(true)}
                title="¿Cómo conectar con Gemini? (Guía paso a paso)"
                className="p-1.5 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                title="Reiniciar conversación"
                className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restaurar tamaño' : 'Maximizar'}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onToggle}
                title="Cerrar chat"
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isUser ? 'Tú' : 'ProdBot'}
                    </span>
                    {message.modelUsed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-800/50">
                        {message.modelUsed}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500">
                      {message.timestamp}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-white transition-opacity"
                        title="Copiar texto"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[92%] sm:max-w-[85%] text-xs shadow-md ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderFormattedContent(message.content)}
                        {message.isRetryable && (
                          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-400">
                              ¿Deseas reenviar tu consulta?
                            </span>
                            <button
                              onClick={handleRetry}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                              <span>Reintentar ahora</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-slate-400">
                  <span>ProdBot pensando...</span>
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-800/90 border border-slate-700/60 text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-400">Consultando Gemini 3.8 Flash con datos de ProdTracker...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto custom-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Sugerencias:
            </span>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                {qp.title}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Escribe tu consulta (ej: ¿Cuáles despliegues tienen fallo o riesgo alto?)..."
                className="w-full py-2.5 pl-3 pr-12 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none max-h-24 custom-scrollbar"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all active:scale-95 shadow-sm"
                title="Enviar mensaje (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Contexto activo: Despliegues, GDD e Integraciones Middleware
              </span>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                ¿Cómo conectar Gemini?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Connection Guide Modal */}
      <GeminiConnectionModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onTestConnectionSuccess={checkStatus}
      />
    </>
  );
};
