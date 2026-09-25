import * as XLSX from 'xlsx';
import { DeploymentRecord } from '../types/deployment';
import { MiddlewareIntegration } from '../types/integration';

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

/**
 * Generates and triggers download of a professionally structured Excel spreadsheet (.xlsx)
 * containing Middleware integration records, metrics summary, and related component breakdown.
 */
export function exportMiddlewareToExcel(
  records: MiddlewareIntegration[],
  fileNamePrefix: string = 'ProdTracker_Reporte_Middleware'
): boolean {
  try {
    if (!records || records.length === 0) {
      alert('No hay integraciones middleware disponibles para exportar.');
      return false;
    }

    // 1. Prepare Main Middleware Sheet Data
    const formattedData = records.map((item, index) => {
      const formatDate = (val?: string) => {
        if (!val) return '-';
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      };

      return {
        '#': index + 1,
        'Número de GDD': item.codigoApp || '-',
        'Plataforma / Grupo': item.plataformaGrupo || 'General',
        'Nombre / Integración': item.nombre,
        'Categoría': item.categoria,
        'Estado': item.estado,
        'Avance (%)': `${item.progreso}%`,
        'Release Actual': item.releaseActual || '-',
        'Servicios / APIs': item.serviciosCount,
        'Despliegues': item.desplieguesCount,
        'Meses Ejecución': item.mesesEjecucion,
        'Desarrollador a Cargo': item.desarrolladorACargo || '-',
        'Responsable': item.responsable,
        'Tecnologías': Array.isArray(item.tecnologias) ? item.tecnologias.join(', ') : '',
        'Componentes Vinculados': Array.isArray(item.componentesRelacionados) && item.componentesRelacionados.length > 0
          ? item.componentesRelacionados.join(', ')
          : '-',
        'Endpoint Base': item.endpointBase || '-',
        'Repositorio Git': item.repoUrl || '-',
        'Observación Dominio': item.observacion || '-',
        'Descripción / Alcance': item.descripcion,
        'Fecha Inicio': formatDate(item.fechaInicio),
        'Fecha Lanzamiento': formatDate(item.fechaLanzamiento),
        'Última Modificación': formatDate(item.updatedAt || item.createdAt),
      };
    });

    const mainWorksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set Column Widths for professional readability
    mainWorksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 15 },  // Código App
      { wch: 25 },  // Plataforma / Grupo
      { wch: 28 },  // Nombre / Integración
      { wch: 18 },  // Categoría
      { wch: 16 },  // Estado
      { wch: 12 },  // Avance (%)
      { wch: 15 },  // Release Actual
      { wch: 16 },  // Servicios / APIs
      { wch: 14 },  // Despliegues
      { wch: 15 },  // Meses Ejecución
      { wch: 22 },  // Desarrollador a Cargo
      { wch: 22 },  // Responsable
      { wch: 30 },  // Tecnologías
      { wch: 35 },  // Componentes Vinculados
      { wch: 32 },  // Endpoint Base
      { wch: 30 },  // Repositorio Git
      { wch: 32 },  // Observación Dominio
      { wch: 45 },  // Descripción / Alcance
      { wch: 14 },  // Fecha Inicio
      { wch: 16 },  // Fecha Lanzamiento
      { wch: 18 },  // Última Modificación
    ];

    // 2. Prepare Summary & Metrics Sheet Data
    const plataformaCounts: Record<string, { count: number; servicios: number; despliegues: number }> = {};
    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    let totalServicios = 0;
    let totalDespliegues = 0;
    let totalProgreso = 0;

    records.forEach((r) => {
      const plat = r.plataformaGrupo || 'General';
      if (!plataformaCounts[plat]) {
        plataformaCounts[plat] = { count: 0, servicios: 0, despliegues: 0 };
      }
      plataformaCounts[plat].count += 1;
      plataformaCounts[plat].servicios += (r.serviciosCount || 0);
      plataformaCounts[plat].despliegues += (r.desplieguesCount || 0);

      statusCounts[r.estado] = (statusCounts[r.estado] || 0) + 1;
      categoryCounts[r.categoria] = (categoryCounts[r.categoria] || 0) + 1;

      totalServicios += (r.serviciosCount || 0);
      totalDespliegues += (r.desplieguesCount || 0);
      totalProgreso += (r.progreso || 0);
    });

    const summaryRows: Array<{ Sección: string; Métrica: string; Valor: string | number; Detalle?: string }> = [];

    // Global KPIs
    summaryRows.push({ Sección: 'Métricas Globales', Métrica: 'Total de Integraciones', Valor: records.length });
    summaryRows.push({ Sección: 'Métricas Globales', Métrica: 'En Producción', Valor: statusCounts['En Producción'] || 0, Detalle: `${((statusCounts['En Producción'] || 0) / records.length * 100).toFixed(1)}% del total` });
    summaryRows.push({ Sección: 'Métricas Globales', Métrica: 'Total Servicios / APIs Conectadas', Valor: totalServicios });
    summaryRows.push({ Sección: 'Métricas Globales', Métrica: 'Total Despliegues Registrados', Valor: totalDespliegues });
    summaryRows.push({ Sección: 'Métricas Globales', Métrica: 'Avance Promedio de Implementación', Valor: `${(totalProgreso / records.length).toFixed(1)}%` });

    // Status breakdown
    Object.entries(statusCounts).forEach(([st, cnt]) => {
      summaryRows.push({
        Sección: 'Por Estado Operativo',
        Métrica: st,
        Valor: cnt,
        Detalle: `${((cnt / records.length) * 100).toFixed(1)}% del total`,
      });
    });

    // Platforms breakdown
    Object.entries(plataformaCounts).forEach(([plat, data]) => {
      summaryRows.push({
        Sección: 'Por Plataforma / Grupo',
        Métrica: plat,
        Valor: `${data.count} integraciones`,
        Detalle: `${data.servicios} servicios, ${data.despliegues} despliegues`,
      });
    });

    // Categories breakdown
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      summaryRows.push({
        Sección: 'Por Categoría de Negocio',
        Métrica: cat,
        Valor: cnt,
        Detalle: `${((cnt / records.length) * 100).toFixed(1)}% del total`,
      });
    });

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
    summaryWorksheet['!cols'] = [
      { wch: 26 }, // Sección
      { wch: 34 }, // Métrica
      { wch: 22 }, // Valor
      { wch: 32 }, // Detalle
    ];

    // 3. Prepare Componentes & Microservicios Sheet Data
    const componentRows: Array<{
      '#': number;
      'Plataforma / Grupo': string;
      'Integración Principal': string;
      'Número de GDD': string;
      'Componente / Microservicio': string;
      'Estado': string;
      'Release Actual': string;
      'Desarrollador a Cargo': string;
      'Responsable': string;
    }> = [];

    let compIndex = 1;
    records.forEach((r) => {
      const components = Array.isArray(r.componentesRelacionados) && r.componentesRelacionados.length > 0
        ? r.componentesRelacionados
        : [r.nombre];

      components.forEach((comp) => {
        componentRows.push({
          '#': compIndex++,
          'Plataforma / Grupo': r.plataformaGrupo || 'General',
          'Integración Principal': r.nombre,
          'Número de GDD': r.codigoApp || '-',
          'Componente / Microservicio': comp,
          'Estado': r.estado,
          'Release Actual': r.releaseActual || '-',
          'Desarrollador a Cargo': r.desarrolladorACargo || '-',
          'Responsable': r.responsable,
        });
      });
    });

    const componentWorksheet = XLSX.utils.json_to_sheet(componentRows);
    componentWorksheet['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 28 },
      { wch: 15 },
      { wch: 32 },
      { wch: 16 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
    ];

    // 4. Create Workbook & Append Sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Matriz_Middleware');
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Métricas_y_Resumen');
    XLSX.utils.book_append_sheet(workbook, componentWorksheet, 'Microservicios_Detalle');

    // 5. Generate Timestamped Filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `${fileNamePrefix}_${dateStr}_${timeStr}.xlsx`;

    // 6. Write and download file
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error('Error generating Middleware Excel export:', error);
    alert('Ocurrió un error al generar el archivo Excel de Middleware. Por favor intente nuevamente.');
    return false;
  }
}
