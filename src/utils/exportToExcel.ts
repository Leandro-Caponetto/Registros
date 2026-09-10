import * as XLSX from 'xlsx';
import { DeploymentRecord } from '../types/deployment';

/**
 * Generates and triggers download of a professionally structured Excel spreadsheet (.xlsx)
 * containing deployment records and analytical breakdown sheets.
 */
export function exportDeploymentsToExcel(
  records: DeploymentRecord[],
  fileNamePrefix: string = 'ProdTracker_Reporte_Despliegues'
): boolean {
  try {
    if (!records || records.length === 0) {
      alert('No hay registros disponibles para exportar.');
      return false;
    }

    // 1. Prepare Main Deployment Sheet Data
    const formattedData = records.map((item, index) => {
      const dateObj = new Date(item.fechaImplementacion);
      const formattedDate = isNaN(dateObj.getTime())
        ? item.fechaImplementacion
        : dateObj.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

      return {
        '#': index + 1,
        'N° GDD': item.numeroGDD || 'N/A',
        'Producto': item.producto,
        'Proyecto / Módulo': item.proyecto,
        'Versión': item.version || 'v1.0.0',
        'Tipo': item.tipo,
        'Estado': item.estado,
        'Nivel de Impacto': item.impacto,
        'Fecha y Hora Implementación': formattedDate,
        'Ambiente': item.ambiente || 'PROD',
        'Autor / Responsable': item.autor,
        'Aprobado por': item.aprobadoPor || 'CAB Team',
        'Ticket Jira/Ops': item.jiraTicket || '-',
        'Detalle de Cambios / Release Notes': item.detalle,
        'Plan de Rollback': item.rollbackPlan || 'Restauración de imagen previa + Rollback de Schema',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set Column Widths for professional readability
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 16 },  // N° GDD
      { wch: 22 },  // Producto
      { wch: 28 },  // Proyecto / Módulo
      { wch: 12 },  // Versión
      { wch: 12 },  // Tipo
      { wch: 18 },  // Estado
      { wch: 16 },  // Nivel de Impacto
      { wch: 24 },  // Fecha y Hora Implementación
      { wch: 18 },  // Ambiente
      { wch: 24 },  // Autor / Responsable
      { wch: 22 },  // Aprobado por
      { wch: 16 },  // Ticket Jira/Ops
      { wch: 60 },  // Detalle
      { wch: 45 },  // Plan de Rollback
    ];

    // 2. Prepare Summary / Metrics Sheet Data
    const productCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    records.forEach((r) => {
      productCounts[r.producto] = (productCounts[r.producto] || 0) + 1;
      typeCounts[r.tipo] = (typeCounts[r.tipo] || 0) + 1;
      statusCounts[r.estado] = (statusCounts[r.estado] || 0) + 1;
    });

    const summaryRows: Array<{ Categoria: string; Metrica: string; Total: number }> = [];

    // Products breakdown
    Object.entries(productCounts).forEach(([product, count]) => {
      summaryRows.push({
        Categoria: 'Por Producto',
        Metrica: product,
        Total: count,
      });
    });

    // Types breakdown
    Object.entries(typeCounts).forEach(([type, count]) => {
      summaryRows.push({
        Categoria: 'Por Tipo de Despliegue',
        Metrica: type,
        Total: count,
      });
    });

    // Status breakdown
    Object.entries(statusCounts).forEach(([status, count]) => {
      summaryRows.push({
        Categoria: 'Por Estado de Verificación',
        Metrica: status,
        Total: count,
      });
    });

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
    summaryWorksheet['!cols'] = [
      { wch: 25 }, // Categoria
      { wch: 30 }, // Metrica
      { wch: 12 }, // Total
    ];

    // 3. Create Workbook & Append Sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guías_de_Despliegue');
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen_Métricas');

    // 4. Generate Timestamped Filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `${fileNamePrefix}_${dateStr}_${timeStr}.xlsx`;

    // 5. Write and download file
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error('Error generating Excel export:', error);
    alert('Ocurrió un error al generar el archivo Excel. Por favor intente nuevamente.');
    return false;
  }
}
