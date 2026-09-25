export type DeploymentType = 'Release' | 'Hotfix' | 'Patch' | 'Rollback' | 'Feature';

export type DeploymentStatus = 'Verificado' | 'En Monitoreo' | 'Pendiente' | 'Revertido';

export type ImpactLevel = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface DeploymentRecord {
  id: string;
  producto: string;
  proyecto: string;
  fechaImplementacion: string; // ISO string e.g., "2026-09-09T18:30"
  numeroGDD: string; // Document ID / Guía de Despliegue, e.g. "GDD-2026-0841"
  detalle: string; // Release notes, changes, hotfix description
  tipo: DeploymentType;
  estado: DeploymentStatus;
  impacto: ImpactLevel;
  autor: string; // Responsible Engineer / Lead
  aprobadoPor: string; // Approver / CAB Lead
  ambiente: string; // e.g. "PROD-Cluster-US", "PROD-Core-Fintech"
  version: string; // e.g. "v4.1.2"
  plataformaGrupo?: string; // e.g. "MiCorreo", "PAQ.AR", "Mercado Libre / Mercado Envíos"
  rollbackPlan?: string; // Rollback script or procedure reference
  jiraTicket?: string; // Ticket reference, e.g. "PROD-9402"
  createdAt: string;
  updatedAt: string;
}

export type DeploymentFormData = Omit<DeploymentRecord, 'id' | 'createdAt' | 'updatedAt'>;

export interface DeploymentFilterState {
  searchQuery: string;
  selectedProduct: string; // '' for all
  selectedType: string; // '' for all
  selectedStatus: string; // '' for all
  selectedImpact: string; // '' for all
  gddQuery: string;
  datePreset: 'all' | 'today' | 'last7days' | 'thisMonth' | 'lastMonth' | 'custom';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type SortField = 
  | 'fechaImplementacion'
  | 'producto'
  | 'proyecto'
  | 'numeroGDD'
  | 'tipo'
  | 'estado'
  | 'impacto'
  | 'autor';

export type SortDirection = 'asc' | 'desc';

export interface DeploymentKPIs {
  totalThisMonth: number;
  totalAllTime: number;
  recentCount: number;
  pendingVerificationCount: number;
  hotfixCount: number;
  verifiedCount: number;
  inMonitoringCount: number;
  successRate: number; // percentage
  deploymentsByProduct: { name: string; count: number; hotfixes: number }[];
  deploymentsByType: { type: string; count: number }[];
  deploymentsByStatus: { status: string; count: number }[];
  dailyTrend: { date: string; releases: number; hotfixes: number; patches: number }[];
}
