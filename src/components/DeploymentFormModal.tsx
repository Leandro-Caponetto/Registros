import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  FileCode2, 
  FileText, 
  Check, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  UserCheck, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { DeploymentRecord, DeploymentFormData, DeploymentType, DeploymentStatus, ImpactLevel } from '../types/deployment';

interface DeploymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeploymentFormData, existingId?: string) => void;
  initialData?: DeploymentRecord | null;
  existingProducts: string[];
  lastGddNumber?: string;
}

export const DeploymentFormModal: React.FC<DeploymentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingProducts,
  lastGddNumber,
}) => {
  // Form State
  const [producto, setProducto] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [fechaImplementacion, setFechaImplementacion] = useState('');
  const [numeroGDD, setNumeroGDD] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tipo, setTipo] = useState<DeploymentType>('Release');
  const [estado, setEstado] = useState<DeploymentStatus>('En Monitoreo');
  const [impacto, setImpacto] = useState<ImpactLevel>('Medio');
  const [autor, setAutor] = useState('');
  const [aprobadoPor, setAprobadoPor] = useState('');
  const [ambiente, setAmbiente] = useState('PROD-AWS-US-EAST-1');
  const [version, setVersion] = useState('v1.0.0');
  const [rollbackPlan, setRollbackPlan] = useState('');
  const [jiraTicket, setJiraTicket] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Common suggestions for new products
  const defaultProductSuggestions = [
    'Portal Web Clientes',
    'Core Banking API',
    'App Móvil',
    'Pasarela de Pagos',
    'BFF Microservicios',
    'CRM Ventas',
    'Servicio Autenticación',
  ];

  const combinedProductSuggestions = Array.from(
    new Set([...existingProducts, ...defaultProductSuggestions])
  );

  // Populate when editing or opening
  useEffect(() => {
    if (initialData) {
      setProducto(initialData.producto);
      setProyecto(initialData.proyecto);
      setFechaImplementacion(initialData.fechaImplementacion.slice(0, 16));
      setNumeroGDD(initialData.numeroGDD);
      setDetalle(initialData.detalle);
      setTipo(initialData.tipo);
      setEstado(initialData.estado);
      setImpacto(initialData.impacto);
      setAutor(initialData.autor);
      setAprobadoPor(initialData.aprobadoPor);
      setAmbiente(initialData.ambiente || 'PROD-AWS-US-EAST-1');
      setVersion(initialData.version || 'v1.0.0');
      setRollbackPlan(initialData.rollbackPlan || '');
      setJiraTicket(initialData.jiraTicket || '');
    } else {
      // Default new form values
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setProducto(existingProducts[0] || '');
      setProyecto('');
      setFechaImplementacion(localIso);
      
      // Suggest next GDD number
      const nextNum = generateNextGdd(lastGddNumber);
      setNumeroGDD(nextNum);
      
      setDetalle('');
      setTipo('Release');
      setEstado('En Monitoreo');
      setImpacto('Medio');
      setAutor('Ing. Líder de Despliegue');
      setAprobadoPor('Comité de Cambios (CAB)');
      setAmbiente('PROD-AWS-US-EAST-1');
      setVersion('v1.0.0');
      setRollbackPlan('Reversión de imagen de contenedor mediante Helm rollback y script de base de datos');
      setJiraTicket('');
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen, lastGddNumber]);

  if (!isOpen) return null;

  function generateNextGdd(lastGdd?: string): string {
    const year = new Date().getFullYear();
    if (!lastGdd) return `GDD-${year}-0845`;
    const match = lastGdd.match(/\d+$/);
    if (match) {
      const nextVal = parseInt(match[0], 10) + 1;
      return `GDD-${year}-${String(nextVal).padStart(4, '0')}`;
    }
    return `GDD-${year}-0845`;
  }

  const handleSetCurrentDateTime = () => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFechaImplementacion(localIso);
  };

  const handleInsertTemplate = (type: 'release' | 'hotfix' | 'db') => {
    if (type === 'release') {
      setDetalle(
        `• Resumen de cambios: Implementación de nuevas funcionalidades programadas.\n` +
        `• Componentes afectados: API Backend, BFF, Base de Datos.\n` +
        `• Pruebas previas: Pruebas unitarias al 100%, pase validado en ambiente STAGING.\n` +
        `• Ventana de mantenimiento: No requiere corte de servicio (Zero-Downtime Deployment).`
      );
    } else if (type === 'hotfix') {
      setDetalle(
        `• Causa raíz (Root Cause): Corrección urgente ante incidente en producción.\n` +
        `• Solución aplicada: Parche de código para estabilizar conexiones/flujo transaccional.\n` +
        `• Pruebas de regresión: Verificación en caliente con métricas de latencia y tasa de errores.\n` +
        `• Aprobación: Autorizado por CAB de Emergencia y CISO.`
      );
      setTipo('Hotfix');
      setImpacto('Alto');
      setEstado('En Monitoreo');
    } else if (type === 'db') {
      setDetalle(
        `• Tipo de cambio: Migración de esquema de Base de Datos relacional.\n` +
        `• Script ejecutado: V_PROD_Migration.sql\n` +
        `• Backup previo: Snapshot completo generado previo a la ejecución.\n` +
        `• Impacto: Creación de nuevos índices y ampliación de tablas maestras.`
      );
      setTipo('Patch');
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    
    if (!producto.trim()) {
      errs.producto = 'El nombre del producto o sistema es obligatorio.';
    }

    if (!proyecto.trim()) {
      errs.proyecto = 'El título del proyecto o módulo es obligatorio.';
    } else if (proyecto.trim().length < 3) {
      errs.proyecto = 'Debe tener al menos 3 caracteres.';
    }

    if (!fechaImplementacion) {
      errs.fechaImplementacion = 'La fecha y hora de implementación es obligatoria.';
    }

    if (!numeroGDD.trim()) {
      errs.numeroGDD = 'El número de GDD (Guía de Despliegue) es obligatorio.';
    }

    if (!detalle.trim()) {
      errs.detalle = 'El detalle de cambios o release notes es obligatorio.';
    } else if (detalle.trim().length < 10) {
      errs.detalle = 'Por favor incluya una descripción más detallada (mínimo 10 caracteres).';
    }

    if (!autor.trim()) {
      errs.autor = 'El autor o responsable del pase es obligatorio.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      producto: true,
      proyecto: true,
      fechaImplementacion: true,
      numeroGDD: true,
      detalle: true,
      autor: true,
    });

    if (!validate()) return;

    const formData: DeploymentFormData = {
      producto: producto.trim(),
      proyecto: proyecto.trim(),
      fechaImplementacion,
      numeroGDD: numeroGDD.trim().toUpperCase(),
      detalle: detalle.trim(),
      tipo,
      estado,
      impacto,
      autor: autor.trim(),
      aprobadoPor: aprobadoPor.trim() || 'CAB Institucional',
      ambiente: ambiente.trim() || 'PROD',
      version: version.trim() || 'v1.0.0',
      rollbackPlan: rollbackPlan.trim(),
      jiraTicket: jiraTicket.trim().toUpperCase(),
    };

    onSubmit(formData, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? 'Modificar Registro de Despliegue' : 'Registrar Pase a Producción (GDD)'}
              </h2>
              <p className="text-xs text-slate-400">
                Formulario de auditoría y control de cambios en ambientes productivos
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Core Mandatory Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <FileCode2 className="w-4 h-4" />
              <span>1. Identificación del Despliegue & Documento</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Producto / System */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Producto / Sistema <span className="text-rose-400">*</span>
                  </label>
                  {producto && (
                    <button
                      type="button"
                      onClick={() => setProducto('')}
                      className="text-[11px] text-slate-400 hover:text-rose-300"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    id="form-producto-input"
                    type="text"
                    list="products-datalist"
                    value={producto}
                    onChange={(e) => {
                      setProducto(e.target.value);
                      if (errors.producto) {
                        setErrors((prev) => ({ ...prev, producto: '' }));
                      }
                    }}
                    placeholder="Ej: Core Banking API, Portal Web, App Móvil..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  
                  {/* HTML5 Datalist for autocomplete */}
                  <datalist id="products-datalist">
                    {combinedProductSuggestions.map((prod) => (
                      <option key={prod} value={prod} />
                    ))}
                  </datalist>
                </div>

                {/* Quick-pick suggestion chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Sugerencias:</span>
                  {combinedProductSuggestions.slice(0, 5).map((prod) => (
                    <button
                      key={prod}
                      type="button"
                      onClick={() => setProducto(prod)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        producto === prod
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60 font-semibold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      {prod}
                    </button>
                  ))}
                </div>

                {errors.producto && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.producto}
                  </p>
                )}
              </div>

              {/* Numero de GDD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Número de GDD (Guía de Despliegue) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNumeroGDD(generateNextGdd(lastGddNumber))}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-generar
                  </button>
                </div>
                <input
                  id="form-gdd-input"
                  type="text"
                  value={numeroGDD}
                  onChange={(e) => setNumeroGDD(e.target.value)}
                  placeholder="Ej: GDD-2026-0845"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                {errors.numeroGDD && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.numeroGDD}
                  </p>
                )}
              </div>

            </div>

            {/* Proyecto Title & Version */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Proyecto / Módulo / Funcionalidad <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-proyecto-input"
                  type="text"
                  value={proyecto}
                  onChange={(e) => setProyecto(e.target.value)}
                  placeholder="Ej: Módulo de Pagos QR Interoperables y Liquidación 24/7"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                {errors.proyecto && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.proyecto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Versión del Artefacto
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v4.2.0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Fecha y Hora de Implementación <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSetCurrentDateTime}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> Ahora
                  </button>
                </div>
                <input
                  id="form-fecha-input"
                  type="datetime-local"
                  value={fechaImplementacion}
                  onChange={(e) => setFechaImplementacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                {errors.fechaImplementacion && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fechaImplementacion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Ambiente Destino
                </label>
                <input
                  type="text"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  placeholder="PROD-AWS-US-EAST-1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Severity, Tagging & Classification */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4" />
              <span>2. Clasificación, Estado & Auditoría</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tipo de Despliegue
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as DeploymentType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Release">Release (Planificado)</option>
                  <option value="Hotfix">🔥 Hotfix (Urgente)</option>
                  <option value="Patch">Patch (Mantenimiento)</option>
                  <option value="Feature">Feature (Nueva Funcionalidad)</option>
                  <option value="Rollback">Rollback</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Estado de Verificación
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as DeploymentStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="En Monitoreo">⏱️ En Monitoreo</option>
                  <option value="Verificado">🟢 Verificado</option>
                  <option value="Pendiente">⚠️ Pendiente Verificación</option>
                  <option value="Revertido">🔴 Revertido</option>
                </select>
              </div>

              {/* Impacto */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nivel de Impacto / Riesgo
                </label>
                <select
                  value={impacto}
                  onChange={(e) => setImpacto(e.target.value as ImpactLevel)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Bajo">Bajo (Sin impacto al usuario)</option>
                  <option value="Medio">Medio (Impacto acotado)</option>
                  <option value="Alto">Alto (Crítico para el negocio)</option>
                  <option value="Crítico">Crítico (Pase de infraestructura mayor)</option>
                </select>
              </div>

            </div>

            {/* Author, Approver & Ticket */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Autor / Lead Responsable <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-autor-input"
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Ej: Sofia Valenzuela (Tech Lead)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                {errors.autor && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.autor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Aprobado Por (CAB / Gerencia)
                </label>
                <input
                  type="text"
                  value={aprobadoPor}
                  onChange={(e) => setAprobadoPor(e.target.value)}
                  placeholder="Ej: Comité de Cambios (CAB)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Ticket de Seguimiento (Jira/Ops)
                </label>
                <input
                  type="text"
                  value={jiraTicket}
                  onChange={(e) => setJiraTicket(e.target.value)}
                  placeholder="Ej: PROD-9402"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Section 3: Detailed Notes & Rollback Strategy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>3. Detalle de Cambios & Plan de Contingencia</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span className="text-[11px] text-slate-500 mr-1">Plantillas:</span>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('release')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Release Estándar
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('hotfix')}
                  className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded text-[11px]"
                >
                  Hotfix Urgente
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('db')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Migración BD
                </button>
              </div>
            </div>

            {/* Detalle */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Detalle Técnico y Release Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="form-detalle-textarea"
                rows={4}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Describa los cambios, microservicios desplegados, optimizaciones, migraciones aplicadas..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-sans"
              />
              {errors.detalle && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.detalle}
                </p>
              )}
            </div>

            {/* Plan de Rollback */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Plan de Rollback / Contingencia
              </label>
              <input
                type="text"
                value={rollbackPlan}
                onChange={(e) => setRollbackPlan(e.target.value)}
                placeholder="Ej: Revertir imagen en Kubernetes a versión previa y ejecutar script de reversión"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="form-submit-btn"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Guardar Cambios' : 'Registrar Despliegue'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
