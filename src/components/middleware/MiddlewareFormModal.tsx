import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  Terminal, 
  Calendar, 
  User, 
  ShieldCheck, 
  Cpu, 
  Globe,
  Sliders,
  Code2
} from 'lucide-react';
import { 
  MiddlewareIntegration, 
  MiddlewareFormData, 
  IntegrationCategory, 
  IntegrationStatus,
  PLATAFORMAS_GRUPOS,
  PlataformaGrupo,
  PLATAFORMAS_GRUPOS_DATA
} from '../../types/integration';

interface MiddlewareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: MiddlewareFormData, existingId?: string) => void;
  initialData?: MiddlewareIntegration | null;
}

const CATEGORIES: IntegrationCategory[] = [
  'E-Commerce',
  'Identidad & KYC',
  'Logística & Envíos',
  'Pagos & Gateway',
  'ERP / CRM',
  'APIs & Microservicios',
  'Otro',
];

const STATUSES: IntegrationStatus[] = [
  'En Producción',
  'En Desarrollo',
  'En Testing',
  'Planificado',
  'En Pausa',
];

const QUICK_STACK_SUGGESTIONS = [
  'Node.js',
  'TypeScript',
  'Python',
  'FastAPI',
  'Go',
  'Java',
  'Kafka',
  'RabbitMQ',
  'Redis',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'AWS',
];

const PRESET_TEMPLATES = [
  {
    nombre: 'MiCorreo Backend & Transition',
    codigoApp: 'MW-MICORR-01',
    plataformaGrupo: 'MiCorreo' as PlataformaGrupo,
    categoria: 'APIs & Microservicios' as IntegrationCategory,
    descripcion: 'Ecosistema MiCorreo y orquestación unificada.',
    componentesRelacionados: ['api-micorreo-transition', 'micorreo', 'BackendMiCorreo', 'authenticator-correo'],
    observacion: 'Ecosistema MiCorreo',
    desarrolladorACargo: 'Martín Rodríguez',
    responsable: 'Equipo Middleware & MiCorreo',
    tecnologias: ['Node.js', 'TypeScript', 'Docker', 'Redis'],
  },
  {
    nombre: 'PAQ.AR Hub & Rótulos PAS',
    codigoApp: 'MW-PAQAR-01',
    plataformaGrupo: 'PAQ.AR' as PlataformaGrupo,
    categoria: 'Logística & Envíos' as IntegrationCategory,
    descripcion: 'Pasarela de rótulos, API PAS y servicios vinculados a PAQ.AR.',
    componentesRelacionados: ['api-pas', 'ApiPaqAr', 'BackOfficePaqAr', 'MiddlewarePaqAq', 'WSDLRótulos-PAQ.ar'],
    observacion: 'Componentes vinculados a PAQ.AR',
    desarrolladorACargo: 'Facundo Morales',
    responsable: 'Middleware Logistics Team',
    tecnologias: ['Java', 'Spring Boot', 'Kafka', 'WSDL'],
  },
  {
    nombre: 'MercadoLibre Sync & Orders',
    codigoApp: 'MW-MELI-01',
    plataformaGrupo: 'Mercado Libre / Mercado Envíos' as PlataformaGrupo,
    categoria: 'E-Commerce' as IntegrationCategory,
    descripcion: 'Sincronización de catálogo, stock, órdenes y webhook con MercadoLibre.',
    componentesRelacionados: ['consumoMeli', 'Correo - Mercado Envios', 'Api Correo MercadoEnvios', 'EMeliBeanService'],
    observacion: 'Integraciones con MELI',
    desarrolladorACargo: 'Nicolás Giménez',
    responsable: 'Equipo Middleware & Integraciones',
    tecnologias: ['Node.js', 'Kafka', 'Redis'],
  },
  {
    nombre: 'Integrador WC Hub',
    codigoApp: 'MW-WCOO-01',
    plataformaGrupo: 'Integrador WC' as PlataformaGrupo,
    categoria: 'E-Commerce' as IntegrationCategory,
    descripcion: 'Integración / cache para WooCommerce y conectores asociados.',
    componentesRelacionados: ['IntegradorWC-Cache', 'IntegradorWC'],
    observacion: 'Integración / cache',
    desarrolladorACargo: 'Lucía Varela',
    responsable: 'Backend Developer',
    tecnologias: ['PHP', 'Laravel', 'Redis'],
  },
  {
    nombre: 'Tienda Nube Connect',
    codigoApp: 'MW-TNUB-01',
    plataformaGrupo: 'Tienda Nube' as PlataformaGrupo,
    categoria: 'E-Commerce' as IntegrationCategory,
    descripcion: 'Ingesta de órdenes y actualización de stock multi-sucursal con Tienda Nube.',
    componentesRelacionados: ['tienda nube', 'tienda-nube-fulfilment', 'tiendanube-notifications'],
    observacion: 'Integración e-commerce',
    desarrolladorACargo: 'Agustina Paz',
    responsable: 'Lead Middleware',
    tecnologias: ['Node.js', 'PostgreSQL', 'RabbitMQ'],
  },
];

export const MiddlewareFormModal: React.FC<MiddlewareFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [nombre, setNombre] = useState('');
  const [codigoApp, setCodigoApp] = useState('');
  const [plataformaGrupo, setPlataformaGrupo] = useState<PlataformaGrupo>('Pendiente de clasificación');
  const [componentesRelacionados, setComponentesRelacionados] = useState<string[]>([]);
  const [componentInput, setComponentInput] = useState('');
  const [observacion, setObservacion] = useState('');
  const [categoria, setCategoria] = useState<IntegrationCategory>('E-Commerce');
  const [estado, setEstado] = useState<IntegrationStatus>('En Desarrollo');
  const [progreso, setProgreso] = useState<number>(50);
  const [responsable, setResponsable] = useState('');
  const [desarrolladorACargo, setDesarrolladorACargo] = useState('');
  const [serviciosCount, setServiciosCount] = useState<number>(1);
  const [desplieguesCount, setDesplieguesCount] = useState<number>(0);
  const [mesesEjecucion, setMesesEjecucion] = useState<number>(1);
  const [releaseActual, setReleaseActual] = useState('Release 1.0.0');
  const [endpointBase, setEndpointBase] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tecnologias, setTecnologias] = useState<string[]>(['Node.js', 'TypeScript']);
  const [tagInput, setTagInput] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

  // Sync state with initialData when opened
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setCodigoApp(initialData.codigoApp || '');
      setPlataformaGrupo(initialData.plataformaGrupo || 'Pendiente de clasificación');
      setComponentesRelacionados(initialData.componentesRelacionados || []);
      setObservacion(initialData.observacion || '');
      setCategoria(initialData.categoria);
      setEstado(initialData.estado);
      setProgreso(initialData.progreso || 0);
      setResponsable(initialData.responsable);
      setDesarrolladorACargo(initialData.desarrolladorACargo || '');
      setServiciosCount(initialData.serviciosCount || 1);
      setDesplieguesCount(initialData.desplieguesCount || 0);
      setMesesEjecucion(initialData.mesesEjecucion || 1);
      setReleaseActual(initialData.releaseActual || 'Release 1.0.0');
      setEndpointBase(initialData.endpointBase || '');
      setRepoUrl(initialData.repoUrl || '');
      setTecnologias(initialData.tecnologias || []);
      setDescripcion(initialData.descripcion);
      setFechaInicio(initialData.fechaInicio || new Date().toISOString().split('T')[0]);
    } else {
      setNombre('');
      setCodigoApp('');
      setPlataformaGrupo('Pendiente de clasificación');
      setComponentesRelacionados([]);
      setObservacion('');
      setCategoria('E-Commerce');
      setEstado('En Desarrollo');
      setProgreso(50);
      setResponsable('Equipo Middleware');
      setDesarrolladorACargo('');
      setServiciosCount(1);
      setDesplieguesCount(1);
      setMesesEjecucion(1);
      setReleaseActual('Release 1.0.0');
      setEndpointBase('');
      setRepoUrl('');
      setTecnologias(['Node.js', 'TypeScript']);
      setDescripcion('');
      setFechaInicio(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePlataformaChange = (selected: PlataformaGrupo) => {
    setPlataformaGrupo(selected);
    const data = PLATAFORMAS_GRUPOS_DATA[selected];
    if (data) {
      // If observation is currently empty or was default, update with group observation
      if (!observacion || Object.values(PLATAFORMAS_GRUPOS_DATA).some(d => d.observacion === observacion)) {
        setObservacion(data.observacion || '');
      }
    }
  };

  const handleToggleComponent = (comp: string) => {
    if (componentesRelacionados.includes(comp)) {
      setComponentesRelacionados(componentesRelacionados.filter(c => c !== comp));
    } else {
      setComponentesRelacionados([...componentesRelacionados, comp]);
    }
  };

  const handleAddCustomComponent = (compName: string) => {
    const clean = compName.trim();
    if (clean && !componentesRelacionados.includes(clean)) {
      setComponentesRelacionados([...componentesRelacionados, clean]);
    }
    setComponentInput('');
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tecnologias.includes(clean)) {
      setTecnologias([...tecnologias, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTecnologias(tecnologias.filter((t) => t !== tagToRemove));
  };

  const applyTemplate = (tmpl: typeof PRESET_TEMPLATES[0]) => {
    setNombre(tmpl.nombre);
    if (tmpl.codigoApp) setCodigoApp(tmpl.codigoApp);
    if (tmpl.plataformaGrupo) setPlataformaGrupo(tmpl.plataformaGrupo);
    if (tmpl.componentesRelacionados) setComponentesRelacionados(tmpl.componentesRelacionados);
    if (tmpl.observacion) setObservacion(tmpl.observacion);
    if (tmpl.desarrolladorACargo) setDesarrolladorACargo(tmpl.desarrolladorACargo);
    if (tmpl.responsable) setResponsable(tmpl.responsable);
    setCategoria(tmpl.categoria);
    setDescripcion(tmpl.descripcion);
    setTecnologias(tmpl.tecnologias);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const formData: MiddlewareFormData = {
      nombre: nombre.trim(),
      codigoApp: codigoApp.trim() || undefined,
      plataformaGrupo: plataformaGrupo || undefined,
      componentesRelacionados: componentesRelacionados.length > 0 ? componentesRelacionados : undefined,
      observacion: observacion.trim() || undefined,
      categoria,
      estado,
      progreso: Number(progreso),
      responsable: responsable.trim() || 'Equipo Middleware',
      desarrolladorACargo: desarrolladorACargo.trim() || undefined,
      serviciosCount: Number(serviciosCount) || 0,
      desplieguesCount: Number(desplieguesCount) || 0,
      mesesEjecucion: Number(mesesEjecucion) || 0,
      releaseActual: releaseActual.trim() || 'Release 1.0.0',
      endpointBase: endpointBase.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      tecnologias,
      descripcion: descripcion.trim(),
      fechaInicio,
    };

    onSubmit(formData, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="modal-middleware-form"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Editar Integración / Proyecto Middleware' : 'Registrar Nueva Integración / Proyecto'}
              </h2>
              <p className="text-xs text-slate-400">
                Gestión de aplicaciones, conectores y servicios del equipo Middleware
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

        {/* Quick Presets (Only when creating new) */}
        {!isEditing && (
          <div className="bg-slate-950/50 px-6 py-2.5 border-b border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Plantillas rápidas frecuentes de Middleware:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.nombre}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-blue-600/20 hover:text-blue-300 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors text-[11px]"
                >
                  {tmpl.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Row 1: Nombre & Número de GDD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de la Integración / App <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ej: MiCorreo Backend & Transition, MercadoLibre Sync..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número de GDD
              </label>
              <input
                type="text"
                placeholder="ej: GDD-1042 o MW-MELI-01"
                value={codigoApp}
                onChange={(e) => setCodigoApp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 1.5: Plataforma / Grupo Dropdown & Componentes Relacionados */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Plataforma / Grupo</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-blue-400 font-medium">Clasificación oficial Middleware</span>
              </div>
              
              <select
                id="select-plataforma-grupo"
                value={plataformaGrupo}
                onChange={(e) => handlePlataformaChange(e.target.value as PlataformaGrupo)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {PLATAFORMAS_GRUPOS.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    {grupo}
                  </option>
                ))}
              </select>
            </div>

            {/* Componentes / Aplicaciones sugeridas para este grupo */}
            {PLATAFORMAS_GRUPOS_DATA[plataformaGrupo]?.aplicaciones && PLATAFORMAS_GRUPOS_DATA[plataformaGrupo].aplicaciones.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Aplicaciones / Componentes de {plataformaGrupo}:
                  </span>
                  <span className="text-[10px] text-slate-500">Clic para vincular</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PLATAFORMAS_GRUPOS_DATA[plataformaGrupo].aplicaciones.map((app) => {
                    const isSelected = componentesRelacionados.includes(app);
                    return (
                      <div key={app} className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleComponent(app)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-semibold shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isSelected ? 'opacity-100 text-blue-400' : 'opacity-20'}`} />
                          <span>{app}</span>
                        </button>
                        {!nombre && (
                          <button
                            type="button"
                            onClick={() => setNombre(app)}
                            className="text-[10px] px-1.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors"
                            title="Usar como nombre de integración"
                          >
                            Usar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom component input and selected tags */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Vincular otro componente o microservicio..."
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomComponent(componentInput);
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomComponent(componentInput)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                >
                  + Vincular
                </button>
              </div>

              {componentesRelacionados.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {componentesRelacionados.map((comp) => (
                    <span
                      key={comp}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-blue-950/70 text-blue-300 border border-blue-800/60"
                    >
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleComponent(comp)}
                        className="text-blue-400 hover:text-rose-400 ml-1 text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Observación field */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Observación de la Plataforma / Grupo
              </label>
              <input
                type="text"
                placeholder="Observación (ej: Ecosistema MiCorreo, Componentes vinculados...)"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Categoría & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoría del Proyecto
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as IntegrationCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estado Actual
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as IntegrationStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Avance General Slider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Porcentaje de Avance General</span>
              </label>
              <span className="text-sm font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                {progreso}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progreso}
              onChange={(e) => setProgreso(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% Inicial</span>
              <span>50% Desarrollo</span>
              <span>80% Testing</span>
              <span>100% Producción</span>
            </div>
          </div>

          {/* Row 4: Métricas Ejecutivas del Proyecto (Meses, Despliegues, Servicios, Release) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meses Ejecución
              </label>
              <input
                type="number"
                min="0"
                value={mesesEjecucion}
                onChange={(e) => setMesesEjecucion(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Despliegues
              </label>
              <input
                type="number"
                min="0"
                value={desplieguesCount}
                onChange={(e) => setDesplieguesCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Servicios APIs
              </label>
              <input
                type="number"
                min="1"
                value={serviciosCount}
                onChange={(e) => setServiciosCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Release Actual
              </label>
              <input
                type="text"
                placeholder="ej: Release 2.1.0"
                value={releaseActual}
                onChange={(e) => setReleaseActual(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* SECCIÓN: EQUIPO Y ASIGNACIÓN - DESARROLLADOR A CARGO */}
          <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950/60 p-4 rounded-xl border border-blue-800/40 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Equipo Asignado & Desarrollador a Cargo</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Nuevo campo
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Asignación técnica del desarrollador responsable y líder del proyecto middleware
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Desarrollador a Cargo */}
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Desarrollador a Cargo</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Técnico / Dev asignado</span>
                </label>
                <input
                  type="text"
                  placeholder="ej: Martín Rodríguez, Lucía Varela..."
                  value={desarrolladorACargo}
                  onChange={(e) => setDesarrolladorACargo(e.target.value)}
                  className="w-full bg-slate-900 border border-blue-500/40 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 transition-all"
                />

                {/* Sugerencias rápidas de desarrolladores */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-500 mr-0.5">Sugerir dev:</span>
                  {['Martín Rodríguez', 'Lucía Varela', 'Facundo Morales', 'Nicolás Giménez', 'Agustina Paz', 'Gonzalo Silva'].map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setDesarrolladorACargo(dev)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-900/50 hover:text-blue-200 text-slate-300 border border-slate-700/60 transition-colors"
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsable / Lead Middleware */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Responsable / Lead Middleware</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Área o Líder de proyecto</span>
                </label>
                <input
                  type="text"
                  placeholder="ej: Juan Pérez / Equipo Middleware"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />

                {/* Sugerencias de responsables */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-500 mr-0.5">Sugerir área:</span>
                  {['Equipo Middleware', 'Middleware Logistics Team', 'SecOps & Middleware Team'].map((lead) => (
                    <button
                      key={lead}
                      type="button"
                      onClick={() => setResponsable(lead)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                    >
                      {lead}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fecha de Inicio */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Fecha de Inicio del Programa / Proyecto:</span>
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:border-blue-400"
              />
            </div>
          </div>

          {/* Row 6: Stack Tecnológico */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tecnologías y Componentes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Agregar tecnología (ej: Kafka, Docker, FastAPI)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl border border-slate-700"
              >
                Agregar
              </button>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tecnologias.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
                >
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-300 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Tech Suggestions */}
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
              <span className="self-center mr-1">Sugerencias:</span>
              {QUICK_STACK_SUGGESTIONS.filter((s) => !tecnologias.includes(s)).slice(0, 7).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddTag(sug)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>

          {/* Row 7: URLs (Endpoint / Repo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Endpoint Base / Gateway
              </label>
              <input
                type="url"
                placeholder="https://api-middleware.internal/v1/..."
                value={endpointBase}
                onChange={(e) => setEndpointBase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Repositorio Git / Docs
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Row 8: Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción y Alcance Técnico
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre qué realiza la integración, webhooks configurados, autenticación o sistemas involucrados..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Integración'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
