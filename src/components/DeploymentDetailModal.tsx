import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Server, 
  User, 
  FileText, 
  Edit3, 
  Layers, 
  FileSpreadsheet,
  Share2,
  Tag,
  CheckCircle2,
  Flame,
  CornerUpLeft,
  Presentation
} from 'lucide-react';
import { DeploymentRecord, DeploymentStatus } from '../types/deployment';
import { exportDeploymentsToExcel } from '../utils/exportToExcel';

interface DeploymentDetailModalProps {
  record: DeploymentRecord | null;
  onClose: () => void;
  onEdit: (record: DeploymentRecord) => void;
  onChangeProduct?: (record: DeploymentRecord) => void;
  onOpenPresentation?: (record: DeploymentRecord) => void;
  onUpdateStatus: (id: string, newStatus: DeploymentStatus) => void;
}

export const DeploymentDetailModal: React.FC<DeploymentDetailModalProps> = ({
  record,
  onClose,
  onEdit,
  onChangeProduct,
  onOpenPresentation,
  onUpdateStatus,
}) => {
  const [copiedSlack, setCopiedSlack] = useState(false);

  if (!record) return null;

  const formattedDate = new Date(record.fechaImplementacion).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const handleCopySlackAnnouncement = () => {
    const text = 
`🚀 *PASE A PRODUCCIÓN - ${record.numeroGDD}*
*Producto:* ${record.producto} (${record.version || 'v1.0.0'})
*Proyecto:* ${record.proyecto}
*Tipo:* ${record.tipo} | *Impacto:* ${record.impacto} | *Estado:* ${record.estado}
*Fecha y Hora:* ${formattedDate}
*Ambiente:* ${record.ambiente}
*Responsable:* ${record.autor}
*Aprobación CAB:* ${record.aprobadoPor}
${record.jiraTicket ? `*Ticket:* ${record.jiraTicket}\n` : ''}
📝 *Detalle de Cambios:*
${record.detalle}

🛡️ *Plan de Rollback:*
${record.rollbackPlan || 'Restauración de versión anterior'}
`;

    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2500);
  };

  const handleExportSingle = () => {
    exportDeploymentsToExcel([record], `ProdTracker_${record.numeroGDD}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-indigo-300 bg-indigo-950 px-3 py-1 rounded-lg border border-indigo-700/80">
              {record.numeroGDD}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {record.producto}
                </h2>
                {onChangeProduct && (
                  <button
                    onClick={() => onChangeProduct(record)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Cambiar producto</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Guía Oficial de Despliegue a Producción
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPresentation && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPresentation(record);
                }}
                title="Ver o Presentar en PowerPoint"
                className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors border border-orange-500/20"
              >
                <Presentation className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleExportSingle}
              title="Descargar Ficha en Excel"
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              title="Editar Registro"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Main Title & Status Banner */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block mb-1">
                Proyecto / Módulo
              </span>
              <h3 className="text-lg font-bold text-white">
                {record.proyecto}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>Versión: <strong className="text-slate-200 font-mono">{record.version}</strong></span>
                <span>•</span>
                <span>Ambiente: <strong className="text-slate-200 font-mono">{record.ambiente}</strong></span>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Estado Actual
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {record.estado}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {record.tipo}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Implementation Date */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">Fecha y Hora</span>
              </div>
              <p className="text-xs font-medium text-slate-100">
                {formattedDate}
              </p>
            </div>

            {/* Impact Level */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Nivel de Impacto</span>
              </div>
              <p className="text-xs font-bold text-slate-100">
                {record.impacto}
              </p>
            </div>

            {/* Ticket */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">Ticket Jira/Ops</span>
              </div>
              <p className="text-xs font-mono font-medium text-slate-100">
                {record.jiraTicket || 'Sin ticket asociado'}
              </p>
            </div>

            {/* Author */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Autor / Responsable</span>
              </div>
              <p className="text-xs font-medium text-slate-100">
                {record.autor}
              </p>
            </div>

            {/* Approver */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">Aprobado Por (CAB)</span>
              </div>
              <p className="text-xs font-medium text-slate-100">
                {record.aprobadoPor}
              </p>
            </div>

          </div>

          {/* Release Notes / Change Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                Detalle Técnico y Release Notes
              </h4>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {record.detalle}
            </div>
          </div>

          {/* Rollback Procedure */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CornerUpLeft className="w-4 h-4 text-rose-400" />
              Plan de Contingencia / Rollback
            </h4>
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs text-rose-200">
              {record.rollbackPlan || 'Reversión estándar a versión de contenedor anterior.'}
            </div>
          </div>

          {/* Quick Status State Switcher */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Cambiar estado:</span>
              <button
                onClick={() => onUpdateStatus(record.id, 'Verificado')}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  record.estado === 'Verificado'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/40 hover:text-emerald-300 border-slate-700'
                }`}
              >
                ✓ Verificado
              </button>
              <button
                onClick={() => onUpdateStatus(record.id, 'En Monitoreo')}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  record.estado === 'En Monitoreo'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-indigo-900/40 hover:text-indigo-300 border-slate-700'
                }`}
              >
                ⏱️ En Monitoreo
              </button>
              <button
                onClick={() => onUpdateStatus(record.id, 'Revertido')}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  record.estado === 'Revertido'
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 border-slate-700'
                }`}
              >
                🔴 Revertido
              </button>
            </div>

            {/* Copy Slack / Teams Announcement */}
            <button
              onClick={handleCopySlackAnnouncement}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all active:scale-95"
            >
              {copiedSlack ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copiar para Slack / Teams</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>ID Registro: <span className="font-mono text-slate-500">{record.id}</span></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
