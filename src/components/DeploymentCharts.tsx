import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { DeploymentKPIs } from '../types/deployment';

interface DeploymentChartsProps {
  kpis: DeploymentKPIs;
}

const TYPE_COLORS: Record<string, string> = {
  Release: '#3b82f6', // blue
  Hotfix: '#f43f5e',  // rose
  Patch: '#a855f7',   // purple
  Feature: '#10b981', // emerald
  Rollback: '#ef4444' // red
};

const STATUS_COLORS: Record<string, string> = {
  Verificado: '#10b981',
  'En Monitoreo': '#6366f1',
  Pendiente: '#f59e0b',
  Revertido: '#ef4444'
};

export const DeploymentCharts: React.FC<DeploymentChartsProps> = ({ kpis }) => {
  const [activeTab, setActiveTab] = useState<'product' | 'distribution' | 'trend'>('product');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Format product data for the chart
  const productChartData = kpis.deploymentsByProduct.slice(0, 7).map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + '...' : p.name,
    fullName: p.name,
    Despliegues: p.count,
    Hotfixes: p.hotfixes,
  }));

  // Format type data for pie
  const typePieData = kpis.deploymentsByType.map((t) => ({
    name: t.type,
    value: t.count,
    color: TYPE_COLORS[t.type] || '#64748b',
  }));

  // Format status data for pie
  const statusPieData = kpis.deploymentsByStatus.map((s) => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || '#64748b',
  }));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-6 backdrop-blur-sm transition-all shadow-sm">
      
      {/* Header with Tab switcher and collapse toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Análisis y Distribución de Pases a Producción
            </h3>
            <p className="text-xs text-slate-400">
              Métricas de volumen por sistema, tipo de release y estado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tabs */}
          {!isCollapsed && (
            <div className="flex items-center p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveTab('product')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'product'
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Por Producto</span>
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'distribution'
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>Tipo & Estado</span>
              </button>
              <button
                onClick={() => setActiveTab('trend')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'trend'
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Cadencia</span>
              </button>
            </div>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
            title={isCollapsed ? 'Expandir gráficos' : 'Colapsar gráficos'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Body */}
      {!isCollapsed && (
        <div className="mt-4 pt-2">
          {activeTab === 'product' && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
                <span>Top sistemas con mayor frecuencia de despliegues</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-indigo-500"></span> Despliegues Totales
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500"></span> Hotfixes
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                      }}
                      formatter={(val: any, name: any) => [val, name]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.fullName;
                        }
                        return label;
                      }}
                    />
                    <Bar dataKey="Despliegues" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Hotfixes" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Type */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-1 text-center">
                  Desglose por Tipo de Despliegue
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {typePieData.map((entry, index) => (
                          <Cell key={`cell-type-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* By Status */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 mb-1 text-center">
                  Estado de Verificación
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trend' && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
                <span>Cadencia de entregas en fechas recientes</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Releases & Features
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Hotfixes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Patches
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpis.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReleases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorHotfixes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="releases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReleases)" name="Releases" />
                    <Area type="monotone" dataKey="hotfixes" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHotfixes)" name="Hotfixes" />
                    <Area type="monotone" dataKey="patches" stroke="#a855f7" fillOpacity={0.2} fill="#a855f7" name="Patches" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
