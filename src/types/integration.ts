export type IntegrationStatus = 
  | 'En Producción' 
  | 'En Desarrollo' 
  | 'En Testing' 
  | 'Planificado' 
  | 'En Pausa';

export type IntegrationCategory = 
  | 'E-Commerce' 
  | 'Identidad & KYC' 
  | 'Logística & Envíos' 
  | 'Pagos & Gateway' 
  | 'ERP / CRM' 
  | 'APIs & Microservicios' 
  | 'Otro';

export const PLATAFORMAS_GRUPOS = [
  'MiCorreo',
  'PAQ.AR',
  'Mercado Libre / Mercado Envíos',
  'Integrador WC',
  'Cotizador Correo Argentino',
  'Electoral',
  'Notificaciones',
  'Plataforma de Integración / Middleware',
  'Plataforma de Consumo',
  'SeCoDa',
  'Sucursales',
  'Tienda Nube',
  'Sorter',
  'Intranet / Web',
  'WMS / Logística',
  'OfficeCore',
  'Backoffice',
  'Conectores',
  'SIE',
  'Pendiente de clasificación',
] as const;

export type PlataformaGrupo = typeof PLATAFORMAS_GRUPOS[number];

export interface PlataformaGrupoInfo {
  grupo: PlataformaGrupo;
  aplicaciones: string[];
  observacion: string;
}

export const PLATAFORMAS_GRUPOS_DATA: Record<PlataformaGrupo, PlataformaGrupoInfo> = {
  'MiCorreo': {
    grupo: 'MiCorreo',
    aplicaciones: [
      'api-micorreo-transition',
      'micorreo',
      'BackendMiCorreo',
      'miCorreoBackEnd',
      'Emarsys Events',
      'UCent',
      'authenticator-correo'
    ],
    observacion: 'Ecosistema MiCorreo'
  },
  'PAQ.AR': {
    grupo: 'PAQ.AR',
    aplicaciones: [
      'api-pas',
      'ApiPaqAr',
      'BackOfficePaqAr',
      'Central Paq Bean Service',
      'MiddlewarePaqAq',
      'WSDLRótulos-PAQ.ar',
      'WSDLSucursales-PAQ.ar'
    ],
    observacion: 'Componentes vinculados a PAQ.AR'
  },
  'Mercado Libre / Mercado Envíos': {
    grupo: 'Mercado Libre / Mercado Envíos',
    aplicaciones: [
      'consumoMeli',
      'Correo - Mercado Envios',
      'Api Correo MercadoEnvios',
      'EMeliBeanService',
      'MeliFlexImpo',
      'meli pull tracking',
      'ObtenerSucursalMeli'
    ],
    observacion: 'Integraciones con MELI'
  },
  'Integrador WC': {
    grupo: 'Integrador WC',
    aplicaciones: [
      'IntegradorWC-Cache',
      'IntegradorWC'
    ],
    observacion: 'Integración / cache'
  },
  'Cotizador Correo Argentino': {
    grupo: 'Cotizador Correo Argentino',
    aplicaciones: [
      'correoArgInterCotizador-Redis',
      'correoArgInterCotizador',
      'correoArgInterCotizadorRedis'
    ],
    observacion: 'Revisar nombres similares y posibles versiones/componentes'
  },
  'Electoral': {
    grupo: 'Electoral',
    aplicaciones: [
      'electoral',
      'AutoridadesSWS',
      'ServiciosElectorales'
    ],
    observacion: 'Ecosistema electoral'
  },
  'Notificaciones': {
    grupo: 'Notificaciones',
    aplicaciones: [
      'notification',
      'Plataforma de Notificación',
      'Plataforma de Notificación (Legacy)',
      'EMailService'
    ],
    observacion: 'Hay plataforma actual y legacy'
  },
  'Plataforma de Integración / Middleware': {
    grupo: 'Plataforma de Integración / Middleware',
    aplicaciones: [
      'Plataforma de Integración',
      'operations middleware',
      'integration-jboss',
      'Integra',
      'karapace',
      'OP-TokenService',
      'xcomreceiver',
      'XComSender'
    ],
    observacion: 'Varios parecen componentes transversales'
  },
  'Plataforma de Consumo': {
    grupo: 'Plataforma de Consumo',
    aplicaciones: [
      'plataformaconsumo',
      'Consumo Multicliente',
      'Consumo Multicliente Dabra',
      'Consumo Multicliente Pami'
    ],
    observacion: 'Consumos multicliente'
  },
  'SeCoDa': {
    grupo: 'SeCoDa',
    aplicaciones: [
      'AdaptadorSeCoDaAnsesTraza',
      'AdaptadorSeCoDa-CORREO',
      'CORREOSeCoDaEAR.Ear'
    ],
    observacion: 'Integraciones SeCoDa'
  },
  'Sucursales': {
    grupo: 'Sucursales',
    aplicaciones: [
      'Microservice Sucursales',
      'microservice-sucursales-grpc'
    ],
    observacion: 'REST / gRPC posiblemente del mismo dominio'
  },
  'Tienda Nube': {
    grupo: 'Tienda Nube',
    aplicaciones: [
      'tienda nube',
      'tienda-nube-fulfilment',
      'tiendanube-new-notifications',
      'tiendanube-notifications'
    ],
    observacion: 'Integración e-commerce'
  },
  'Sorter': {
    grupo: 'Sorter',
    aplicaciones: [
      'sorter-backoffice-be',
      'sorter-envio-ecom',
      'sorter-envio-tyt',
      'sorter-robots',
      'sorter-robots-gateway'
    ],
    observacion: 'Grupo bastante identificable por nomenclatura'
  },
  'Intranet / Web': {
    grupo: 'Intranet / Web',
    aplicaciones: [
      'intranet',
      'intranet-2026',
      'Web Institucional',
      'Comunidad'
    ],
    observacion: 'Comunidad queda a validar'
  },
  'WMS / Logística': {
    grupo: 'WMS / Logística',
    aplicaciones: [
      'WMS-Integracion',
      'Stock Observer',
      'Status Observer'
    ],
    observacion: 'Retirement podría pertenecer aquí, pero lo validaría'
  },
  'OfficeCore': {
    grupo: 'OfficeCore',
    aplicaciones: [
      'OfficeCore Management OT',
      'MeliFlexImpo'
    ],
    observacion: 'MeliFlexImpo menciona OfficeCore en su descripción'
  },
  'Backoffice': {
    grupo: 'Backoffice',
    aplicaciones: [
      'backoffice'
    ],
    observacion: 'No se pueden identificar aún sus hijos en las capturas'
  },
  'Conectores': {
    grupo: 'Conectores',
    aplicaciones: [
      'Conectores'
    ],
    observacion: 'Parece un grupo contenedor de integraciones'
  },
  'SIE': {
    grupo: 'SIE',
    aplicaciones: [
      'sie'
    ],
    observacion: 'Sin componentes asociados visibles'
  },
  'Pendiente de clasificación': {
    grupo: 'Pendiente de clasificación',
    aplicaciones: [
      'Aforadora-nueva',
      'AmacenEcommerce',
      'credenciales',
      'EFT',
      'FE-HASAR',
      'file number import',
      'Payment Frontend',
      'renaperRemitente',
      'Retirement',
      'SI_so_Cliente'
    ],
    observacion: 'Requieren validar dominio/plataforma'
  }
};

export interface MiddlewareIntegration {
  id: string;
  nombre: string;
  codigoApp?: string; // ej: MW-WCOO-01
  plataformaGrupo?: PlataformaGrupo | string; // Plataforma o Grupo asignado
  componentesRelacionados?: string[]; // Aplicaciones / Componentes vinculados
  observacion?: string; // Observación del dominio/ecosistema
  categoria: IntegrationCategory;
  estado: IntegrationStatus;
  progreso: number; // 0 - 100%
  responsable: string;
  desarrolladorACargo?: string; // Desarrollador o técnico a cargo asignado
  serviciosCount: number; // Cantidad de servicios/APIs implementadas
  desplieguesCount: number; // Despliegues frontend + backend
  mesesEjecucion: number; // Meses de ejecución del programa
  releaseActual: string; // Release o versión actual (ej: "Release 2.4.0")
  endpointBase?: string;
  repoUrl?: string;
  tecnologias: string[];
  descripcion: string;
  fechaInicio?: string;
  fechaLanzamiento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiddlewareFormData {
  nombre: string;
  codigoApp?: string;
  plataformaGrupo?: PlataformaGrupo | string;
  componentesRelacionados?: string[];
  observacion?: string;
  categoria: IntegrationCategory;
  estado: IntegrationStatus;
  progreso: number;
  responsable: string;
  desarrolladorACargo?: string;
  serviciosCount: number;
  desplieguesCount: number;
  mesesEjecucion: number;
  releaseActual: string;
  endpointBase?: string;
  repoUrl?: string;
  tecnologias: string[];
  descripcion: string;
  fechaInicio?: string;
  fechaLanzamiento?: string;
}

export interface MiddlewareFilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedPlataformaGrupo?: string;
  sortBy: 'nombre' | 'progreso' | 'estado' | 'updatedAt' | 'serviciosCount';
  sortOrder: 'asc' | 'desc';
}
