import React from 'react';
import { 
  Rocket, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { DeploymentKPIs } from '../types/deployment';

interface KpiOverviewProps {
  kpis: DeploymentKPIs;
  onFilterPreset: (type: 'all' | 'pending' | 'hotfix' | 'thisMonth' | 'recent') => void;
  activePreset?: string;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({
  kpis,
  onFilterPreset,
  activePreset,
}) => {
  const topProduct = kpis.deploymentsByProduct[0] || { name: 'N/A', count: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Deployments This Month */}
      <div 
        id="kpi-total-month"
        onClick={() => onFilterPreset('thisMonth')}
        className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
          activePreset === 'thisMonth'
            ? 'bg-indigo-900/40 border-indigo-500 shadow-md shadow-indigo-500/10'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pases a Producción
          </span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Rocket className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {kpis.totalThisMonth}
          </span>
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" />
            Este mes
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Total histórico: <strong className="text-slate-200">{kpis.totalAllTime}</strong></span>
          <span className="text-indigo-400 hover:underline flex items-center text-[11px]">
            Filtrar <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Card 2: Top Active Product */}
      <div 
        id="kpi-top-product"
        onClick={() => onFilterPreset('all')}
        className="relative overflow-hidden p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sistema Más Activo
          </span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold text-white truncate" title={topProduct.name}>
            {topProduct.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300">
              {topProduct.count} despliegues
            </span>
            {topProduct.hotfixes > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300">
                {topProduct.hotfixes} hotfixes
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          En {kpis.deploymentsByProduct.length} productos registrados
        </div>
      </div>

      {/* Card 3: Recent Deployments (Last 7 days) */}
      <div 
        id="kpi-recent"
        onClick={() => onFilterPreset('recent')}
        className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
          activePreset === 'recent'
            ? 'bg-emerald-900/30 border-emerald-500 shadow-md shadow-emerald-500/10'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Últimos 7 Días
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {kpis.recentCount}
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            {kpis.successRate}% Estabilidad
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Verificados: <strong className="text-emerald-400">{kpis.verifiedCount}</strong></span>
          <span className="text-emerald-400 hover:underline flex items-center text-[11px]">
            Ver recientes <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Card 4: Pending Verification & Hotfix Alert */}
      <div 
        id="kpi-pending-hotfixes"
        onClick={() => onFilterPreset(kpis.pendingVerificationCount > 0 ? 'pending' : 'hotfix')}
        className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
          kpis.pendingVerificationCount > 0
            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500 hover:bg-amber-950/30'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monitoreo y Alertas
          </span>
          <div className="flex items-center gap-1">
            {kpis.pendingVerificationCount > 0 ? (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Flame className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.pendingVerificationCount}
            </span>
            <span className="ml-1 text-xs font-semibold text-amber-400">
              Pendientes
            </span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div>
            <span className="text-2xl font-bold text-rose-400 tracking-tight">
              {kpis.hotfixCount}
            </span>
            <span className="ml-1 text-xs font-medium text-slate-400">
              Hotfixes
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            {kpis.inMonitoringCount} en monitoreo
          </span>
          <span className="text-amber-400 hover:underline flex items-center text-[11px]">
            Revisar <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

    </div>
  );
};
