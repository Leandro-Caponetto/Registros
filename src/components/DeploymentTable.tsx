import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  MoreHorizontal,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { DeploymentRecord, SortField, SortDirection } from '../types/deployment';

interface DeploymentTableProps {
  records: DeploymentRecord[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onViewDetail: (record: DeploymentRecord) => void;
  onEdit: (record: DeploymentRecord) => void;
  onChangeProduct?: (record: DeploymentRecord) => void;
  onDelete: (record: DeploymentRecord) => void;
  onDuplicate: (record: DeploymentRecord) => void;
  onExportSelected: (selectedRecords: DeploymentRecord[]) => void;
  onBulkVerify: (selectedIds: string[]) => void;
  onBulkDelete: (selectedIds: string[]) => void;
  onResetFilters: () => void;
}

export const DeploymentTable: React.FC<DeploymentTableProps> = ({
  records,
  sortField,
  sortDirection,
  onSort,
  onViewDetail,
  onEdit,
  onChangeProduct,
  onDelete,
  onDuplicate,
  onExportSelected,
  onBulkVerify,
  onBulkDelete,
  onResetFilters,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedGdd, setCopiedGdd] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyGdd = (gdd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(gdd);
    setCopiedGdd(gdd);
    setTimeout(() => setCopiedGdd(null), 2000);
  };

  // Helper for sorting header icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-indigo-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-indigo-400 font-bold" />
    );
  };

  // Badges styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Release':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Hotfix':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold';
      case 'Patch':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Feature':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Rollback':
        return 'bg-red-500/20 text-red-300 border-red-500/40 font-bold';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verificado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Verificado
          </span>
        );
      case 'En Monitoreo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            En Monitoreo
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pendiente
          </span>
        );
      case 'Revertido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Revertido
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Crítico':
        return <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Crítico</span>;
      case 'Alto':
        return <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Alto</span>;
      case 'Medio':
        return <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Medio</span>;
      case 'Bajo':
        return <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Bajo</span>;
      default:
        return <span className="text-xs text-slate-400">{impact}</span>;
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
      
      {/* Bulk Action Bar (Visible when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/70 border-b border-indigo-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white bg-indigo-600 px-2 py-0.5 rounded text-xs">
              {selectedIds.length}
            </span>
            <span>registros seleccionados</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportSelected(selectedRecords)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Selección a Excel</span>
            </button>
            <button
              onClick={() => {
                onBulkVerify(selectedIds);
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar como Verificados</span>
            </button>
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              
              {/* Checkbox column */}
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedRecords.length > 0 &&
                    paginatedRecords.every((r) => selectedIds.includes(r.id))
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>

              {/* N° GDD */}
              <th 
                onClick={() => onSort('numeroGDD')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group"
              >
                <div className="flex items-center">
                  <span>N° GDD</span>
                  {renderSortIcon('numeroGDD')}
                </div>
              </th>

              {/* Producto & Proyecto */}
              <th 
                onClick={() => onSort('producto')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors group min-w-[240px]"
              >
                <div className="flex items-center">
                  <span>Producto & Proyecto</span>
                  {renderSortIcon('producto')}
                </div>
              </th>

              {/* Tipo */}
              <th 
                onClick={() => onSort('tipo')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group"
              >
                <div className="flex items-center">
                  <span>Tipo</span>
                  {renderSortIcon('tipo')}
                </div>
              </th>

              {/* Fecha de Implementación */}
              <th 
                onClick={() => onSort('fechaImplementacion')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group min-w-[150px]"
              >
                <div className="flex items-center">
                  <span>Fecha & Hora</span>
                  {renderSortIcon('fechaImplementacion')}
                </div>
              </th>

              {/* Estado */}
              <th 
                onClick={() => onSort('estado')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group"
              >
                <div className="flex items-center">
                  <span>Estado</span>
                  {renderSortIcon('estado')}
                </div>
              </th>

              {/* Impacto */}
              <th 
                onClick={() => onSort('impacto')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group"
              >
                <div className="flex items-center">
                  <span>Impacto</span>
                  {renderSortIcon('impacto')}
                </div>
              </th>

              {/* Autor */}
              <th 
                onClick={() => onSort('autor')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors group hidden md:table-cell"
              >
                <div className="flex items-center">
                  <span>Autor / Lead</span>
                  {renderSortIcon('autor')}
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-4 text-right">
                <span>Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300 font-normal">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <ShieldAlert className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-300">
                      No se encontraron pases a producción
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Ajuste los criterios de búsqueda, producto o rango de fechas seleccionado.
                    </p>
                    <button
                      onClick={onResetFilters}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr 
                    key={item.id}
                    onClick={() => onViewDetail(item)}
                    className={`transition-colors cursor-pointer group hover:bg-slate-800/60 ${
                      isSelected ? 'bg-indigo-950/30' : 'bg-transparent'
                    }`}
                  >
                    
                    {/* Checkbox */}
                    <td 
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* N° GDD */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                          {item.numeroGDD}
                        </span>
                        <button
                          onClick={(e) => handleCopyGdd(item.numeroGDD, e)}
                          title="Copiar N° GDD"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                        >
                          {copiedGdd === item.numeroGDD ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Producto & Proyecto */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {item.producto}
                          </span>
                          
                          {/* Quick change product button */}
                          {onChangeProduct && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeProduct(item);
                              }}
                              title="Cambiar producto"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition-all"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}

                          {item.version && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.version}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-xs line-clamp-1 mt-0.5 font-medium">
                          {item.proyecto}
                        </span>
                        {item.jiraTicket && (
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Ticket: {item.jiraTicket}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getTypeBadge(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    </td>

                    {/* Fecha de Implementación */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDateTime(item.fechaImplementacion)}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(item.estado)}
                    </td>

                    {/* Impacto */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getImpactBadge(item.impacto)}
                    </td>

                    {/* Autor / Lead */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400 hidden md:table-cell">
                      <span className="truncate max-w-[140px] block" title={item.autor}>
                        {item.autor}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td 
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetail(item)}
                          title="Ver Ficha GDD Completa"
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar Registro"
                          className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicate(item)}
                          title="Duplicar como Plantilla"
                          className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          title="Eliminar Registro"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        
        {/* Total & Page Size selector */}
        <div className="flex items-center gap-3">
          <span>
            Mostrando <strong>{records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> a{' '}
            <strong>{Math.min(currentPage * pageSize, records.length)}</strong> de <strong>{records.length}</strong> registros
          </span>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <span className="px-2 text-slate-300 font-medium">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>

      </div>

    </div>
  );
};
