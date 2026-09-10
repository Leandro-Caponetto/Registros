import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  SlidersHorizontal,
  FileCode2,
  Check
} from 'lucide-react';
import { DeploymentFilterState } from '../types/deployment';

interface DeploymentFiltersProps {
  filters: DeploymentFilterState;
  onFilterChange: (newFilters: Partial<DeploymentFilterState>) => void;
  onResetFilters: () => void;
  availableProducts: string[];
  totalResults: number;
}

export const DeploymentFilters: React.FC<DeploymentFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableProducts,
  totalResults,
}) => {
  // Count active filters
  const activeFilterCount = [
    Boolean(filters.searchQuery),
    Boolean(filters.selectedProduct),
    Boolean(filters.selectedType),
    Boolean(filters.selectedStatus),
    Boolean(filters.selectedImpact),
    Boolean(filters.gddQuery),
    filters.datePreset !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-sm">
      
      {/* Top row: Global Search + GDD Direct Search + Active Filters summary */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-3">
        
        {/* Global Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-global-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Buscar por producto, proyecto, detalles, autor, ticket..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* GDD Direct Search */}
        <div className="relative w-full sm:w-60">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <input
            id="input-gdd-search"
            type="text"
            value={filters.gddQuery}
            onChange={(e) => onFilterChange({ gddQuery: e.target.value })}
            placeholder="Filtrar por N° GDD..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {filters.gddQuery && (
            <button
              onClick={() => onFilterChange({ gddQuery: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters CTA */}
        {activeFilterCount > 0 && (
          <button
            id="btn-clear-filters"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar filtros ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Second row: Dropdown Filters & Date Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800">
        
        {/* Product Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Producto / Sistema
          </label>
          <select
            id="select-filter-product"
            value={filters.selectedProduct}
            onChange={(e) => onFilterChange({ selectedProduct: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos los productos</option>
            {availableProducts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Tipo
          </label>
          <select
            id="select-filter-type"
            value={filters.selectedType}
            onChange={(e) => onFilterChange({ selectedType: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos los tipos</option>
            <option value="Release">Release (Planificado)</option>
            <option value="Hotfix">Hotfix (Urgente)</option>
            <option value="Patch">Patch (Mantenimiento)</option>
            <option value="Feature">Feature (Nueva Funcionalidad)</option>
            <option value="Rollback">Rollback</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            id="select-filter-status"
            value={filters.selectedStatus}
            onChange={(e) => onFilterChange({ selectedStatus: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="Verificado">Verificado (Estable)</option>
            <option value="En Monitoreo">En Monitoreo</option>
            <option value="Pendiente">Pendiente Verificación</option>
            <option value="Revertido">Revertido</option>
          </select>
        </div>

        {/* Impact Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Impacto
          </label>
          <select
            id="select-filter-impact"
            value={filters.selectedImpact}
            onChange={(e) => onFilterChange({ selectedImpact: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Cualquier impacto</option>
            <option value="Bajo">Bajo</option>
            <option value="Medio">Medio</option>
            <option value="Alto">Alto</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>

        {/* Date Presets */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Rango de Fechas
          </label>
          <select
            id="select-filter-date-preset"
            value={filters.datePreset}
            onChange={(e) => onFilterChange({ datePreset: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todo el historial</option>
            <option value="today">Hoy</option>
            <option value="last7days">Últimos 7 días</option>
            <option value="thisMonth">Este mes</option>
            <option value="lastMonth">Mes anterior</option>
            <option value="custom">Personalizado...</option>
          </select>
        </div>

        {/* Matching results badge */}
        <div className="flex flex-col justify-end">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Coincidencias</span>
            <span className="text-xs font-bold text-indigo-400">
              {totalResults} {totalResults === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

      </div>

      {/* Custom Date Range Pickers if 'custom' is selected */}
      {filters.datePreset === 'custom' && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 bg-slate-950/60 p-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-300 font-medium">Desde:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Hasta:</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Quick Filter Tags / Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Acceso rápido:
        </span>

        <button
          onClick={() => onFilterChange({ selectedType: filters.selectedType === 'Hotfix' ? '' : 'Hotfix' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.selectedType === 'Hotfix'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          🔥 Hotfixes
        </button>

        <button
          onClick={() => onFilterChange({ selectedStatus: filters.selectedStatus === 'Pendiente' ? '' : 'Pendiente' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.selectedStatus === 'Pendiente'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          ⚠️ Pendientes
        </button>

        <button
          onClick={() => onFilterChange({ selectedStatus: filters.selectedStatus === 'En Monitoreo' ? '' : 'En Monitoreo' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.selectedStatus === 'En Monitoreo'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          ⏱️ En Monitoreo
        </button>

        <button
          onClick={() => onFilterChange({ selectedStatus: filters.selectedStatus === 'Verificado' ? '' : 'Verificado' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.selectedStatus === 'Verificado'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          🟢 Verificados
        </button>

        <button
          onClick={() => onFilterChange({ selectedImpact: filters.selectedImpact === 'Crítico' ? '' : 'Crítico' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.selectedImpact === 'Crítico'
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          🚨 Impacto Crítico
        </button>
      </div>

    </div>
  );
};
