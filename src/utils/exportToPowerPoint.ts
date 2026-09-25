import pptxgen from 'pptxgenjs';
import { DeploymentRecord } from '../types/deployment';
import { getIntegrations } from './integrationStorage';
import { MiddlewareIntegration } from '../types/integration';

/**
 * Generates an executive, professional PowerPoint presentation (.pptx)
 * of all registered deployment services.
 */
export async function exportDeploymentsToPowerPoint(
  records: DeploymentRecord[],
  fileNamePrefix: string = 'ProdTracker_Presentacion_Servicios'
): Promise<boolean> {
  try {
    if (!records || records.length === 0) {
      alert('No hay servicios o despliegues registrados para generar la presentación.');
      return false;
    }

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'ProdTracker Enterprise';
    pptx.company = 'ProdTracker';
    pptx.subject = 'Reporte de Servicios en Producción';
    pptx.title = 'Presentación de Servicios y Pases a Producción';

    // Theme Colors
    const C_DARK_BG = '0B1120'; // Slate 950
    const C_CARD_BG = '1E293B'; // Slate 800
    const C_CARD_BORDER = '334155'; // Slate 700
    const C_PRIMARY = '6366F1'; // Indigo 500
    const C_CYAN = '38BDF8'; // Sky 400
    const C_EMERALD = '10B981'; // Emerald 500
    const C_AMBER = 'F59E0B'; // Amber 500
    const C_ROSE = 'F43F5E'; // Rose 500
    const C_WHITE = 'FFFFFF';
    const C_MUTED = '94A3B8'; // Slate 400
    const C_TEXT = 'F8FAFC'; // Slate 50

    const now = new Date();
    const formattedGenDate = now.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // ----------------------------------------------------
    // SLIDE 1: PORTADA EJECUTIVA (COVER SLIDE)
    // ----------------------------------------------------
    const slideCover = pptx.addSlide();
    slideCover.background = { color: C_DARK_BG };

    // Decorative Top Accent Bar
    slideCover.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.15,
      fill: { color: C_PRIMARY },
      line: { color: C_PRIMARY },
    });

    // Badge ProdTracker
    slideCover.addText('PRODTRACKER ENTERPRISE • PRODUCCIÓN LIVE', {
      x: 1.0,
      y: 1.8,
      w: 8.0,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
      charSpacing: 2,
    });

    // Main Presentation Title
    slideCover.addText('Presentación de Servicios y Pases a Producción', {
      x: 1.0,
      y: 2.3,
      w: 11.33,
      h: 1.6,
      fontSize: 34,
      fontFace: 'Arial',
      color: C_WHITE,
      bold: true,
      lineSpacingMultiple: 1.1,
    });

    // Subtitle
    slideCover.addText(
      'Informe Ejecutivo de Cambios, Guías de Despliegue (GDD) y Control de Calidad Operacional',
      {
        x: 1.0,
        y: 4.1,
        w: 10.5,
        h: 0.6,
        fontSize: 16,
        fontFace: 'Arial',
        color: C_MUTED,
      }
    );

    // Metadata Cards on Cover (Bottom)
    slideCover.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 5.2,
      w: 3.5,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slideCover.addText('TOTAL SERVICIOS / DESPLIEGUES', {
      x: 1.2,
      y: 5.35,
      w: 3.1,
      h: 0.25,
      fontSize: 9,
      color: C_MUTED,
      bold: true,
    });
    slideCover.addText(`${records.length}`, {
      x: 1.2,
      y: 5.65,
      w: 3.1,
      h: 0.6,
      fontSize: 28,
      color: C_PRIMARY,
      bold: true,
    });

    slideCover.addShape(pptx.ShapeType.roundRect, {
      x: 4.8,
      y: 5.2,
      w: 3.5,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slideCover.addText('AMBIENTE OBJETIVO', {
      x: 5.0,
      y: 5.35,
      w: 3.1,
      h: 0.25,
      fontSize: 9,
      color: C_MUTED,
      bold: true,
    });
    slideCover.addText('PRODUCCIÓN (PROD)', {
      x: 5.0,
      y: 5.65,
      w: 3.1,
      h: 0.6,
      fontSize: 20,
      color: C_EMERALD,
      bold: true,
    });

    slideCover.addShape(pptx.ShapeType.roundRect, {
      x: 8.6,
      y: 5.2,
      w: 3.7,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slideCover.addText('FECHA DE REPORTE', {
      x: 8.8,
      y: 5.35,
      w: 3.3,
      h: 0.25,
      fontSize: 9,
      color: C_MUTED,
      bold: true,
    });
    slideCover.addText(formattedGenDate, {
      x: 8.8,
      y: 5.65,
      w: 3.3,
      h: 0.6,
      fontSize: 16,
      color: C_TEXT,
      bold: true,
    });

    // ----------------------------------------------------
    // SLIDE 2: RESUMEN EJECUTIVO & KPIS
    // ----------------------------------------------------
    const slideSummary = pptx.addSlide();
    slideSummary.background = { color: C_DARK_BG };

    // Slide Header
    slideSummary.addText('RESUMEN EJECUTIVO', {
      x: 0.8,
      y: 0.6,
      w: 8.0,
      h: 0.3,
      fontSize: 11,
      color: C_CYAN,
      bold: true,
    });
    slideSummary.addText('Métricas de Despliegue y Distribución de Servicios', {
      x: 0.8,
      y: 0.9,
      w: 11.5,
      h: 0.5,
      fontSize: 22,
      color: C_WHITE,
      bold: true,
    });

    // Calculate metrics
    const verifiedCount = records.filter((r) => r.estado === 'Verificado').length;
    const monitoringCount = records.filter((r) => r.estado === 'En Monitoreo').length;
    const pendingCount = records.filter((r) => r.estado === 'Pendiente').length;
    const hotfixCount = records.filter((r) => r.tipo === 'Hotfix').length;
    const releaseCount = records.filter((r) => r.tipo === 'Release' || r.tipo === 'Feature').length;

    // 4 KPI Mini Cards
    const kpiCards = [
      { label: 'Verificados con Éxito', value: verifiedCount, color: C_EMERALD },
      { label: 'En Monitoreo Activo', value: monitoringCount, color: C_CYAN },
      { label: 'Pendientes Verificación', value: pendingCount, color: C_AMBER },
      { label: 'Pases Tipo Hotfix', value: hotfixCount, color: C_ROSE },
    ];

    kpiCards.forEach((kpi, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slideSummary.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.7,
        w: 2.8,
        h: 1.3,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slideSummary.addText(kpi.label.toUpperCase(), {
        x: xPos + 0.2,
        y: 1.85,
        w: 2.4,
        h: 0.25,
        fontSize: 8,
        color: C_MUTED,
        bold: true,
      });
      slideSummary.addText(`${kpi.value}`, {
        x: xPos + 0.2,
        y: 2.15,
        w: 2.4,
        h: 0.6,
        fontSize: 28,
        color: kpi.color,
        bold: true,
      });
    });

    // Products breakdown card (Left Box)
    const productCounts: Record<string, number> = {};
    records.forEach((r) => {
      productCounts[r.producto] = (productCounts[r.producto] || 0) + 1;
    });
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    slideSummary.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.3,
      w: 5.7,
      h: 3.6,
      rectRadius: 0.08,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slideSummary.addText('SERVICIOS POR PRODUCTO / SISTEMA', {
      x: 1.1,
      y: 3.5,
      w: 5.1,
      h: 0.3,
      fontSize: 10,
      color: C_CYAN,
      bold: true,
    });

    sortedProducts.forEach(([prod, count], pIdx) => {
      const yItem = 3.9 + pIdx * 0.45;
      slideSummary.addText(`•  ${prod}`, {
        x: 1.1,
        y: yItem,
        w: 4.0,
        h: 0.3,
        fontSize: 11,
        color: C_TEXT,
      });
      slideSummary.addText(`${count} pase(s)`, {
        x: 5.2,
        y: yItem,
        w: 1.1,
        h: 0.3,
        fontSize: 11,
        color: C_PRIMARY,
        bold: true,
        align: 'right',
      });
    });

    // Quality & Audit Highlights (Right Box)
    slideSummary.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 3.3,
      w: 5.7,
      h: 3.6,
      rectRadius: 0.08,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slideSummary.addText('CRITERIOS DE CALIDAD & CONTROL GDD', {
      x: 7.1,
      y: 3.5,
      w: 5.1,
      h: 0.3,
      fontSize: 10,
      color: C_CYAN,
      bold: true,
    });

    const qualityPoints = [
      'Trazabilidad Integral: Todo pase cuenta con N° de GDD y responsable.',
      'Planes de Rollback: Estrategias de contingencia definidas por servicio.',
      'Releases Programados: ' + releaseCount + ' entregas planificadas.',
      'Auditoría y Validación: Pruebas de humo y salud en producción.',
      'Monitoreo Post-Pase: Seguimiento en tiempo real de telemetría y logs.',
    ];
    qualityPoints.forEach((pt, qIdx) => {
      slideSummary.addText(`✔  ${pt}`, {
        x: 7.1,
        y: 3.9 + qIdx * 0.55,
        w: 5.1,
        h: 0.45,
        fontSize: 11,
        color: C_TEXT,
        lineSpacingMultiple: 1.1,
      });
    });

    // ----------------------------------------------------
    // SLIDE 2.5: ESTADO GENERAL DEL PROYECTO (MIDDLEWARE)
    // ----------------------------------------------------
    const middlewareIntegrations = getIntegrations();
    const mwSlide = pptx.addSlide();
    mwSlide.background = { color: 'FFFFFF' }; // White canvas matching the user executive visual!

    // Header badge
    mwSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.5,
      w: 2.2,
      h: 0.35,
      rectRadius: 0.17,
      fill: { color: '1E3A8A' }, // Navy blue
      line: { color: '1E3A8A' },
    });
    mwSlide.addText('Resumen ejecutivo', {
      x: 0.8,
      y: 0.5,
      w: 2.2,
      h: 0.35,
      fontSize: 10,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
    });

    // Heading
    mwSlide.addText('Estado general del proyecto', {
      x: 0.8,
      y: 0.95,
      w: 11.5,
      h: 0.5,
      fontSize: 24,
      color: '1E293B',
      bold: true,
    });
    mwSlide.addText('Resumen de estado del equipo Middleware y proyectos activos', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.3,
      fontSize: 11,
      color: '64748B',
    });

    // Calculate MW Metrics
    const mwTotal = middlewareIntegrations.length;
    const mwServicios = middlewareIntegrations.reduce((acc, curr) => acc + (curr.serviciosCount || 0), 0);
    const mwDespliegues = middlewareIntegrations.reduce((acc, curr) => acc + (curr.desplieguesCount || 0), 0);
    const mwMaxMeses = mwTotal > 0 ? Math.max(...middlewareIntegrations.map((i) => i.mesesEjecucion || 0)) : 0;
    const mwAvgProg = mwTotal > 0 ? Math.round(middlewareIntegrations.reduce((acc, curr) => acc + (curr.progreso || 0), 0) / mwTotal) : 80;
    const mwActiveRelease = middlewareIntegrations.find((i) => i.estado === 'En Producción')?.releaseActual 
      || (mwTotal > 0 ? middlewareIntegrations[0].releaseActual : 'Release 1.0.0');
    const mwNames = mwTotal > 0 
      ? middlewareIntegrations.slice(0, 5).map((i) => i.nombre.split(' ')[0]).join(', ')
      : 'Wocommerce, Tienda Nube, Renaper, Envío Nube, Mercadolibre';

    // Left Gauge / Donut Card
    mwSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.0,
      w: 2.8,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });
    mwSlide.addShape(pptx.ShapeType.ellipse, {
      x: 1.25,
      y: 2.5,
      w: 1.9,
      h: 1.9,
      fill: { color: 'FFFFFF' },
      line: { color: '1E3A8A', width: 8 },
    });
    mwSlide.addText(`${mwAvgProg}%`, {
      x: 1.25,
      y: 3.0,
      w: 1.9,
      h: 0.5,
      fontSize: 26,
      color: '1E293B',
      bold: true,
      align: 'center',
    });
    mwSlide.addText('Avance general', {
      x: 1.25,
      y: 3.5,
      w: 1.9,
      h: 0.3,
      fontSize: 10,
      color: '64748B',
      align: 'center',
    });

    mwSlide.addText('EQUIPO MIDDLEWARE', {
      x: 0.9,
      y: 4.8,
      w: 2.6,
      h: 0.25,
      fontSize: 9,
      color: '1E3A8A',
      bold: true,
      align: 'center',
    });
    mwSlide.addText('Proyectos y APIs en curso', {
      x: 0.9,
      y: 5.1,
      w: 2.6,
      h: 0.3,
      fontSize: 10,
      color: '475569',
      align: 'center',
    });

    // Top 4 Light KPI Cards matching reference image
    const mwCards = [
      { num: `${mwMaxMeses}`, unit: 'Meses', sub: 'Ejecución del programa' },
      { num: `${mwDespliegues}`, unit: 'Despliegues', sub: 'Frontend + Backend' },
      { num: `${mwServicios}`, unit: 'Servicios', sub: 'Implementadas' },
      { num: `${mwTotal}`, unit: 'Integraciones', sub: mwNames },
    ];

    mwCards.forEach((c, idx) => {
      const xCard = 3.9 + idx * 2.25;
      // Main pill
      mwSlide.addShape(pptx.ShapeType.roundRect, {
        x: xCard,
        y: 2.2,
        w: 2.1,
        h: 1.5,
        rectRadius: 0.12,
        fill: { color: 'F1F5F9' },
        line: { color: 'E2E8F0', width: 1 },
      });
      mwSlide.addText(c.num, {
        x: xCard + 0.6,
        y: 2.4,
        w: 1.3,
        h: 0.6,
        fontSize: 26,
        color: '1E293B',
        bold: true,
        align: 'right',
      });
      mwSlide.addText(c.unit, {
        x: xCard + 0.6,
        y: 3.0,
        w: 1.3,
        h: 0.3,
        fontSize: 10,
        color: '475569',
        bold: true,
        align: 'right',
      });
      // Subtitle below card
      mwSlide.addText(c.sub, {
        x: xCard,
        y: 3.8,
        w: 2.1,
        h: 0.6,
        fontSize: 9,
        color: '475569',
      });
    });

    // Dark Green Card (Release actual - Validación funcional)
    mwSlide.addShape(pptx.ShapeType.roundRect, {
      x: 3.9,
      y: 4.8,
      w: 3.2,
      h: 1.3,
      rectRadius: 0.15,
      fill: { color: '0F5132' }, // Dark Green
      line: { color: '0F5132' },
    });
    mwSlide.addText(mwActiveRelease, {
      x: 4.2,
      y: 4.95,
      w: 2.7,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      bold: true,
      align: 'right',
    });
    mwSlide.addText('Release actual', {
      x: 4.2,
      y: 5.45,
      w: 2.7,
      h: 0.3,
      fontSize: 10,
      color: 'A7F3D0',
      align: 'right',
    });
    mwSlide.addText('Validación funcional', {
      x: 3.9,
      y: 6.2,
      w: 3.2,
      h: 0.3,
      fontSize: 10,
      color: '475569',
    });

    // Middleware List Box (Right Side)
    mwSlide.addShape(pptx.ShapeType.roundRect, {
      x: 7.4,
      y: 4.8,
      w: 5.4,
      h: 1.8,
      rectRadius: 0.12,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });
    mwSlide.addText('APLICACIONES & CONECTORES REGISTRADOS', {
      x: 7.6,
      y: 4.95,
      w: 5.0,
      h: 0.25,
      fontSize: 9,
      color: '1E3A8A',
      bold: true,
    });
    middlewareIntegrations.slice(0, 4).forEach((intItem, iIdx) => {
      const yItem = 5.25 + iIdx * 0.32;
      mwSlide.addText(`•  ${intItem.nombre} (${intItem.codigoApp || 'MW'}) - ${intItem.estado}`, {
        x: 7.6,
        y: yItem,
        w: 4.0,
        h: 0.25,
        fontSize: 9,
        color: '334155',
      });
      mwSlide.addText(`${intItem.progreso}%`, {
        x: 11.6,
        y: yItem,
        w: 1.0,
        h: 0.25,
        fontSize: 9,
        color: '1E3A8A',
        bold: true,
        align: 'right',
      });
    });

    // ----------------------------------------------------
    // SLIDE 3: MATRIZ CONSOLIDADA DE SERVICIOS
    // ----------------------------------------------------
    const slideTable = pptx.addSlide();
    slideTable.background = { color: C_DARK_BG };

    slideTable.addText('MATRIZ DE DESPLIEGUES', {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.25,
      fontSize: 10,
      color: C_CYAN,
      bold: true,
    });
    slideTable.addText('Tabla Consolidada de Servicios Puestos en Producción', {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.45,
      fontSize: 20,
      color: C_WHITE,
      bold: true,
    });

    // Table rows
    const tableHeader = [
      { text: 'N° GDD', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'PRODUCTO', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'PROYECTO', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'FECHA IMPLEMENTACIÓN', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'TIPO', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'ESTADO', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
      { text: 'AUTOR', options: { bold: true, color: C_WHITE, fill: C_CARD_BG } },
    ];

    // Show up to 9 rows in this summary matrix slide
    const tableRows = records.slice(0, 8).map((r, i) => {
      const rowBg = i % 2 === 0 ? '111827' : C_DARK_BG;
      const dateStr = r.fechaImplementacion ? r.fechaImplementacion.slice(0, 16).replace('T', ' ') : '-';
      return [
        { text: r.numeroGDD || 'N/A', options: { color: C_CYAN, fill: rowBg, bold: true } },
        { text: r.producto, options: { color: C_WHITE, fill: rowBg, bold: true } },
        { text: r.proyecto, options: { color: C_MUTED, fill: rowBg } },
        { text: dateStr, options: { color: C_MUTED, fill: rowBg } },
        { text: r.tipo, options: { color: r.tipo === 'Hotfix' ? C_ROSE : C_CYAN, fill: rowBg, bold: true } },
        {
          text: r.estado,
          options: {
            color: r.estado === 'Verificado' ? C_EMERALD : r.estado === 'En Monitoreo' ? C_CYAN : C_AMBER,
            fill: rowBg,
            bold: true,
          },
        },
        { text: r.autor, options: { color: C_MUTED, fill: rowBg } },
      ];
    });

    slideTable.addTable([tableHeader, ...tableRows] as any, {
      x: 0.8,
      y: 1.4,
      w: 11.73,
      fontSize: 9,
      fontFace: 'Arial',
      border: { pt: 0.5, color: C_CARD_BORDER },
      autoPage: false,
    });

    if (records.length > 8) {
      slideTable.addText(`* Mostrando 8 de ${records.length} servicios registrados. El reporte individual a continuación detalla cada pase.`, {
        x: 0.8,
        y: 6.8,
        w: 11.73,
        h: 0.3,
        fontSize: 9,
        color: C_MUTED,
        italic: true,
      });
    }

    // ----------------------------------------------------
    // SLIDES 4+: DETALLE INDIVIDUAL DE CADA SERVICIO
    // ----------------------------------------------------
    records.forEach((record, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: C_DARK_BG };

      // Top Tag & Slide Number
      slide.addText(`SERVICIO #${index + 1} DE ${records.length} • FICHA TÉCNICA DE DESPLIEGUE`, {
        x: 0.8,
        y: 0.5,
        w: 9.0,
        h: 0.25,
        fontSize: 10,
        color: C_CYAN,
        bold: true,
      });
      slide.addText(`GDD: ${record.numeroGDD}`, {
        x: 9.5,
        y: 0.5,
        w: 3.0,
        h: 0.25,
        fontSize: 11,
        color: C_PRIMARY,
        bold: true,
        align: 'right',
      });

      // Main Product & Project Header
      slide.addText(record.producto, {
        x: 0.8,
        y: 0.75,
        w: 11.5,
        h: 0.55,
        fontSize: 24,
        color: C_WHITE,
        bold: true,
      });
      slide.addText(`Proyecto: ${record.proyecto} ${record.version ? `(Versión ${record.version})` : ''}`, {
        x: 0.8,
        y: 1.3,
        w: 11.5,
        h: 0.3,
        fontSize: 13,
        color: C_MUTED,
      });

      // Status, Type & Impact Badges (Right Top Row)
      const statusColor =
        record.estado === 'Verificado'
          ? C_EMERALD
          : record.estado === 'En Monitoreo'
          ? C_CYAN
          : record.estado === 'Revertido'
          ? C_ROSE
          : C_AMBER;

      const typeColor = record.tipo === 'Hotfix' ? C_ROSE : C_PRIMARY;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.8,
        w: 3.6,
        h: 0.9,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slide.addText('ESTADO DE VERIFICACIÓN', {
        x: 1.0,
        y: 1.9,
        w: 3.2,
        h: 0.2,
        fontSize: 8,
        color: C_MUTED,
        bold: true,
      });
      slide.addText(record.estado, {
        x: 1.0,
        y: 2.15,
        w: 3.2,
        h: 0.4,
        fontSize: 16,
        color: statusColor,
        bold: true,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 4.8,
        y: 1.8,
        w: 3.6,
        h: 0.9,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slide.addText('TIPO DE DESPLIEGUE', {
        x: 5.0,
        y: 1.9,
        w: 3.2,
        h: 0.2,
        fontSize: 8,
        color: C_MUTED,
        bold: true,
      });
      slide.addText(record.tipo, {
        x: 5.0,
        y: 2.15,
        w: 3.2,
        h: 0.4,
        fontSize: 16,
        color: typeColor,
        bold: true,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.8,
        y: 1.8,
        w: 3.7,
        h: 0.9,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slide.addText('NIVEL DE IMPACTO', {
        x: 9.0,
        y: 1.9,
        w: 3.3,
        h: 0.2,
        fontSize: 8,
        color: C_MUTED,
        bold: true,
      });
      slide.addText(record.impacto, {
        x: 9.0,
        y: 2.15,
        w: 3.3,
        h: 0.4,
        fontSize: 16,
        color: record.impacto === 'Crítico' ? C_ROSE : record.impacto === 'Alto' ? C_AMBER : C_CYAN,
        bold: true,
      });

      // Left Column: Changes & Release notes
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 2.9,
        w: 7.6,
        h: 3.9,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slide.addText('DETALLE DE CAMBIOS & RELEASE NOTES', {
        x: 1.1,
        y: 3.1,
        w: 7.0,
        h: 0.3,
        fontSize: 10,
        color: C_CYAN,
        bold: true,
      });
      slide.addText(record.detalle || 'Sin detalle de cambios especificado.', {
        x: 1.1,
        y: 3.5,
        w: 7.0,
        h: 3.1,
        fontSize: 11,
        color: C_TEXT,
        valign: 'top',
        lineSpacingMultiple: 1.2,
      });

      // Right Column: Audit, Authorship & Rollback Plan
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.8,
        y: 2.9,
        w: 3.7,
        h: 3.9,
        rectRadius: 0.08,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slide.addText('DATOS DE AUDITORÍA', {
        x: 9.0,
        y: 3.1,
        w: 3.3,
        h: 0.25,
        fontSize: 10,
        color: C_CYAN,
        bold: true,
      });

      const dateFormated = record.fechaImplementacion
        ? record.fechaImplementacion.replace('T', ' ')
        : 'Inmediata';

      const auditItems = [
        { label: 'Fecha y Hora:', val: dateFormated },
        { label: 'Autor / Owner:', val: record.autor || 'Equipo DevOps' },
        { label: 'Aprobado por:', val: record.aprobadoPor || 'Comité CAB' },
        { label: 'Ambiente:', val: record.ambiente || 'Producción' },
        { label: 'Ticket Jira:', val: record.jiraTicket || 'Sin ticket' },
      ];

      auditItems.forEach((it, aIdx) => {
        const yTop = 3.45 + aIdx * 0.42;
        slide.addText(`${it.label} ${it.val}`, {
          x: 9.0,
          y: yTop,
          w: 3.3,
          h: 0.35,
          fontSize: 9.5,
          color: C_TEXT,
        });
      });

      // Rollback Plan Header & Text
      slide.addText('PLAN DE CONTINGENCIA / ROLLBACK:', {
        x: 9.0,
        y: 5.6,
        w: 3.3,
        h: 0.25,
        fontSize: 9,
        color: C_AMBER,
        bold: true,
      });
      slide.addText(record.rollbackPlan || 'Restauración de release previo y reversión de base de datos.', {
        x: 9.0,
        y: 5.9,
        w: 3.3,
        h: 0.8,
        fontSize: 9,
        color: C_MUTED,
        valign: 'top',
        italic: true,
      });
    });

    // ----------------------------------------------------
    // FINAL SLIDE: CIERRE & GOBERNANZA
    // ----------------------------------------------------
    const slideEnd = pptx.addSlide();
    slideEnd.background = { color: C_DARK_BG };

    slideEnd.addText('PRODTRACKER ENTERPRISE', {
      x: 1.0,
      y: 2.2,
      w: 11.33,
      h: 0.35,
      fontSize: 13,
      color: C_CYAN,
      bold: true,
      align: 'center',
      charSpacing: 2,
    });
    slideEnd.addText('Control y Gobernanza de Producción Asegurados', {
      x: 1.0,
      y: 2.6,
      w: 11.33,
      h: 1.0,
      fontSize: 32,
      color: C_WHITE,
      bold: true,
      align: 'center',
    });
    slideEnd.addText(
      'Documentación respaldada según estándares de auditoría de pases a producción y Guías de Despliegue (GDD).',
      {
        x: 2.0,
        y: 3.8,
        w: 9.33,
        h: 0.8,
        fontSize: 15,
        color: C_MUTED,
        align: 'center',
        lineSpacingMultiple: 1.2,
      }
    );

    // Save File
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `${fileNamePrefix}_${dateStr}_${timeStr}.pptx`;

    await pptx.writeFile({ fileName: filename });
    return true;
  } catch (error) {
    console.error('Error generating PowerPoint presentation:', error);
    alert('Ocurrió un error al generar la presentación PowerPoint. Por favor intente nuevamente.');
    return false;
  }
}

/**
 * Generates an executive, dedicated PowerPoint presentation (.pptx)
 * EXCLUSIVELY for the Middleware Integrations & Projects team.
 */
export async function exportMiddlewareOnlyToPowerPoint(
  integrationsList?: MiddlewareIntegration[],
  fileNamePrefix: string = 'ProdTracker_Middleware_Presentacion'
): Promise<boolean> {
  try {
    const list = integrationsList && integrationsList.length > 0 
      ? integrationsList 
      : getIntegrations();

    if (!list || list.length === 0) {
      alert('No hay integraciones middleware registradas para generar la presentación.');
      return false;
    }

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'ProdTracker Middleware Team';
    pptx.company = 'ProdTracker Enterprise';
    pptx.subject = 'Reporte Ejecutivo - Integraciones Middleware';
    pptx.title = 'Presentación Ejecutiva de Integraciones Middleware';

    // Theme Colors
    const C_DARK_BG = '0B1120'; // Slate 950
    const C_CARD_BG = '1E293B'; // Slate 800
    const C_CARD_BORDER = '334155'; // Slate 700
    const C_BLUE = '2563EB'; // Blue 600
    const C_CYAN = '38BDF8'; // Sky 400
    const C_EMERALD = '10B981'; // Emerald 500
    const C_AMBER = 'F59E0B'; // Amber 500
    const C_WHITE = 'FFFFFF';
    const C_MUTED = '94A3B8'; // Slate 400
    const C_TEXT = 'F8FAFC'; // Slate 50

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Metrics Calculation
    const totalCount = list.length;
    const totalServicios = list.reduce((acc, curr) => acc + (curr.serviciosCount || 0), 0);
    const totalDespliegues = list.reduce((acc, curr) => acc + (curr.desplieguesCount || 0), 0);
    const maxMeses = totalCount > 0 ? Math.max(...list.map((i) => i.mesesEjecucion || 0)) : 0;
    const avgProgreso = totalCount > 0 ? Math.round(list.reduce((acc, curr) => acc + (curr.progreso || 0), 0) / totalCount) : 0;
    const activeRelease = list.find((i) => i.estado === 'En Producción')?.releaseActual 
      || (totalCount > 0 ? list[0].releaseActual : 'Release 1.0.0');

    // ----------------------------------------------------
    // SLIDE 1: PORTADA EXCLUSIVA MIDDLEWARE
    // ----------------------------------------------------
    const slideCover = pptx.addSlide();
    slideCover.background = { color: C_DARK_BG };

    // Accent top bar
    slideCover.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.15,
      fill: { color: C_BLUE },
      line: { color: C_BLUE },
    });

    // Badge
    slideCover.addText('EQUIPO MIDDLEWARE & INTEGRACIONES • PRODTRACKER', {
      x: 1.0,
      y: 1.6,
      w: 9.0,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
      charSpacing: 2,
    });

    // Title
    slideCover.addText('Reporte Ejecutivo de Integraciones', {
      x: 1.0,
      y: 2.1,
      w: 11.33,
      h: 1.2,
      fontSize: 34,
      fontFace: 'Arial',
      color: C_WHITE,
      bold: true,
    });

    // Subtitle
    slideCover.addText(
      'Estado General del Programa, Catálogo de Servicios, Conectores y Avance de Releases',
      {
        x: 1.0,
        y: 3.3,
        w: 11.0,
        h: 0.6,
        fontSize: 16,
        fontFace: 'Arial',
        color: C_MUTED,
      }
    );

    // 4 High-impact KPI Cards on Cover
    const coverKPIs = [
      { num: `${totalCount}`, label: 'INTEGRACIONES', sub: 'Proyectos & conectores', color: C_CYAN },
      { num: `${totalServicios}`, label: 'SERVICIOS', sub: 'APIs implementadas', color: C_EMERALD },
      { num: `${totalDespliegues}`, label: 'DESPLIEGUES', sub: 'Frontend + Backend', color: C_BLUE },
      { num: `${avgProgreso}%`, label: 'AVANCE GENERAL', sub: 'Promedio consolidado', color: C_AMBER },
    ];

    coverKPIs.forEach((kpi, idx) => {
      const xPos = 1.0 + idx * 2.85;
      slideCover.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.3,
        w: 2.65,
        h: 1.8,
        rectRadius: 0.12,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });

      slideCover.addText(kpi.num, {
        x: xPos + 0.2,
        y: 4.5,
        w: 2.25,
        h: 0.6,
        fontSize: 28,
        color: kpi.color,
        bold: true,
      });

      slideCover.addText(kpi.label, {
        x: xPos + 0.2,
        y: 5.15,
        w: 2.25,
        h: 0.3,
        fontSize: 11,
        color: C_WHITE,
        bold: true,
      });

      slideCover.addText(kpi.sub, {
        x: xPos + 0.2,
        y: 5.45,
        w: 2.25,
        h: 0.4,
        fontSize: 9,
        color: C_MUTED,
      });
    });

    // Cover Footer
    slideCover.addText(`Generado el: ${formattedDate}  •  Área de Arquitectura e Integraciones Middleware`, {
      x: 1.0,
      y: 6.6,
      w: 11.33,
      h: 0.35,
      fontSize: 10,
      color: C_MUTED,
    });

    // ----------------------------------------------------
    // SLIDE 2: ESTADO GENERAL DEL PROYECTO (Exact Replica)
    // ----------------------------------------------------
    const slideStatus = pptx.addSlide();
    slideStatus.background = { color: 'FFFFFF' };

    // Badge
    slideStatus.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.5,
      w: 2.2,
      h: 0.35,
      rectRadius: 0.17,
      fill: { color: '1E3A8A' },
      line: { color: '1E3A8A' },
    });
    slideStatus.addText('Resumen ejecutivo', {
      x: 0.8,
      y: 0.5,
      w: 2.2,
      h: 0.35,
      fontSize: 10,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
    });

    // Title
    slideStatus.addText('Estado general del proyecto', {
      x: 0.8,
      y: 0.95,
      w: 11.5,
      h: 0.5,
      fontSize: 24,
      color: '1E293B',
      bold: true,
    });
    slideStatus.addText('Resumen de estado del equipo Middleware y proyectos activos', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.3,
      fontSize: 11,
      color: '64748B',
    });

    // Left Gauge / Donut Card
    slideStatus.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.0,
      w: 2.8,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });
    slideStatus.addShape(pptx.ShapeType.ellipse, {
      x: 1.25,
      y: 2.5,
      w: 1.9,
      h: 1.9,
      fill: { color: 'FFFFFF' },
      line: { color: '1E3A8A', width: 8 },
    });
    slideStatus.addText(`${avgProgreso}%`, {
      x: 1.25,
      y: 3.0,
      w: 1.9,
      h: 0.5,
      fontSize: 26,
      color: '1E293B',
      bold: true,
      align: 'center',
    });
    slideStatus.addText('Avance general', {
      x: 1.25,
      y: 3.5,
      w: 1.9,
      h: 0.3,
      fontSize: 10,
      color: '64748B',
      align: 'center',
    });
    slideStatus.addText('EQUIPO MIDDLEWARE', {
      x: 0.9,
      y: 4.8,
      w: 2.6,
      h: 0.25,
      fontSize: 9,
      color: '1E3A8A',
      bold: true,
      align: 'center',
    });
    slideStatus.addText('Proyectos y APIs en curso', {
      x: 0.9,
      y: 5.1,
      w: 2.6,
      h: 0.3,
      fontSize: 10,
      color: '475569',
      align: 'center',
    });

    // Top 4 Light KPI Cards
    const mwNames = list.slice(0, 5).map((i) => i.nombre.split(' ')[0]).join(', ');
    const mwCards = [
      { num: `${maxMeses}`, unit: 'Meses', sub: 'Ejecución del programa' },
      { num: `${totalDespliegues}`, unit: 'Despliegues', sub: 'Frontend + Backend' },
      { num: `${totalServicios}`, unit: 'Servicios', sub: 'Implementadas' },
      { num: `${totalCount}`, unit: 'Integraciones', sub: mwNames },
    ];

    mwCards.forEach((c, idx) => {
      const xCard = 3.9 + idx * 2.25;
      slideStatus.addShape(pptx.ShapeType.roundRect, {
        x: xCard,
        y: 2.2,
        w: 2.1,
        h: 1.5,
        rectRadius: 0.12,
        fill: { color: 'F1F5F9' },
        line: { color: 'E2E8F0', width: 1 },
      });
      slideStatus.addText(c.num, {
        x: xCard + 0.6,
        y: 2.4,
        w: 1.3,
        h: 0.6,
        fontSize: 26,
        color: '1E293B',
        bold: true,
        align: 'right',
      });
      slideStatus.addText(c.unit, {
        x: xCard + 0.6,
        y: 3.0,
        w: 1.3,
        h: 0.3,
        fontSize: 10,
        color: '475569',
        bold: true,
        align: 'right',
      });
      slideStatus.addText(c.sub, {
        x: xCard,
        y: 3.8,
        w: 2.1,
        h: 0.6,
        fontSize: 9,
        color: '475569',
      });
    });

    // Dark Green Card (Release actual - Validación funcional)
    slideStatus.addShape(pptx.ShapeType.roundRect, {
      x: 3.9,
      y: 4.8,
      w: 3.2,
      h: 1.3,
      rectRadius: 0.15,
      fill: { color: '0F5132' },
      line: { color: '0F5132' },
    });
    slideStatus.addText(activeRelease, {
      x: 4.2,
      y: 4.95,
      w: 2.7,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      bold: true,
      align: 'right',
    });
    slideStatus.addText('Release actual', {
      x: 4.2,
      y: 5.45,
      w: 2.7,
      h: 0.3,
      fontSize: 10,
      color: 'A7F3D0',
      align: 'right',
    });
    slideStatus.addText('Validación funcional', {
      x: 3.9,
      y: 6.2,
      w: 3.2,
      h: 0.3,
      fontSize: 10,
      color: '475569',
    });

    // Right Side: List of Applications
    slideStatus.addShape(pptx.ShapeType.roundRect, {
      x: 7.4,
      y: 4.8,
      w: 5.4,
      h: 1.8,
      rectRadius: 0.12,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });
    slideStatus.addText('APLICACIONES & CONECTORES REGISTRADOS', {
      x: 7.6,
      y: 4.95,
      w: 5.0,
      h: 0.25,
      fontSize: 9,
      color: '1E3A8A',
      bold: true,
    });
    list.slice(0, 4).forEach((intItem, iIdx) => {
      const yItem = 5.25 + iIdx * 0.32;
      slideStatus.addText(`•  ${intItem.nombre} (${intItem.codigoApp || 'MW'}) - ${intItem.estado}`, {
        x: 7.6,
        y: yItem,
        w: 4.0,
        h: 0.25,
        fontSize: 9,
        color: '334155',
      });
      slideStatus.addText(`${intItem.progreso}%`, {
        x: 11.6,
        y: yItem,
        w: 1.0,
        h: 0.25,
        fontSize: 9,
        color: '1E3A8A',
        bold: true,
        align: 'right',
      });
    });

    // ----------------------------------------------------
    // SLIDE 3: MATRIZ CONSOLIDADA DE INTEGRACIONES (TABLA)
    // ----------------------------------------------------
    const slideTable = pptx.addSlide();
    slideTable.background = { color: C_DARK_BG };

    slideTable.addText('Catálogo Consolidado de Integraciones', {
      x: 0.8,
      y: 0.5,
      w: 11.5,
      h: 0.5,
      fontSize: 22,
      color: C_WHITE,
      bold: true,
    });
    slideTable.addText('Matriz detallada de proyectos, estados, avance y servicios activos', {
      x: 0.8,
      y: 1.0,
      w: 11.5,
      h: 0.3,
      fontSize: 11,
      color: C_MUTED,
    });

    const tableHeaders = [
      { text: 'CÓDIGO', options: { bold: true, fill: '1E293B', color: '38BDF8', align: 'left' } },
      { text: 'PLATAFORMA / GRUPO', options: { bold: true, fill: '1E293B', color: '60A5FA', align: 'left' } },
      { text: 'APLICACIÓN / INTEGRACIÓN', options: { bold: true, fill: '1E293B', color: 'FFFFFF', align: 'left' } },
      { text: 'CATEGORÍA', options: { bold: true, fill: '1E293B', color: 'CBD5E1', align: 'left' } },
      { text: 'ESTADO', options: { bold: true, fill: '1E293B', color: 'CBD5E1', align: 'center' } },
      { text: 'AVANCE', options: { bold: true, fill: '1E293B', color: 'F59E0B', align: 'center' } },
      { text: 'SERVICIOS', options: { bold: true, fill: '1E293B', color: 'CBD5E1', align: 'center' } },
      { text: 'DESPLIEGUES', options: { bold: true, fill: '1E293B', color: 'CBD5E1', align: 'center' } },
      { text: 'RELEASE', options: { bold: true, fill: '1E293B', color: '10B981', align: 'center' } },
    ];

    const tableRows = list.map((item, idx) => {
      const bg = idx % 2 === 0 ? '0F172A' : '1E293B';
      const statusColor = item.estado === 'En Producción' ? '10B981' : item.estado === 'En Desarrollo' ? '38BDF8' : 'F59E0B';
      return [
        { text: item.codigoApp || `MW-${idx + 1}`, options: { fill: bg, color: '38BDF8', bold: true, fontSize: 9 } },
        { text: item.plataformaGrupo || 'General', options: { fill: bg, color: '93C5FD', bold: true, fontSize: 8 } },
        { text: item.nombre, options: { fill: bg, color: 'FFFFFF', bold: true, fontSize: 9 } },
        { text: item.categoria, options: { fill: bg, color: '94A3B8', fontSize: 9 } },
        { text: item.estado, options: { fill: bg, color: statusColor, bold: true, align: 'center', fontSize: 9 } },
        { text: `${item.progreso}%`, options: { fill: bg, color: 'FFFFFF', bold: true, align: 'center', fontSize: 9 } },
        { text: `${item.serviciosCount || 0}`, options: { fill: bg, color: 'E2E8F0', align: 'center', fontSize: 9 } },
        { text: `${item.desplieguesCount || 0}`, options: { fill: bg, color: 'E2E8F0', align: 'center', fontSize: 9 } },
        { text: item.releaseActual || '-', options: { fill: bg, color: '10B981', bold: true, align: 'center', fontSize: 9 } },
      ];
    });

    slideTable.addTable([tableHeaders as any, ...tableRows as any], {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      colW: [1.2, 2.2, 2.7, 1.6, 1.2, 0.9, 0.9, 1.0, 1.03],
      rowH: 0.4,
      border: { pt: 0.5, color: '334155' },
    });

    // ----------------------------------------------------
    // SLIDES 4+: FICHAS TÉCNICAS INDIVIDUALES (DEEP DIVE)
    // ----------------------------------------------------
    list.forEach((item, iIdx) => {
      const slideDetail = pptx.addSlide();
      slideDetail.background = { color: C_DARK_BG };

      // Top Accent Line
      slideDetail.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 0.12,
        fill: { color: C_BLUE },
        line: { color: C_BLUE },
      });

      // Header Badge (App Code)
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 0.45,
        w: 1.8,
        h: 0.32,
        rectRadius: 0.08,
        fill: { color: '1E3A8A' },
        line: { color: '3B82F6', width: 0.5 },
      });
      slideDetail.addText(item.codigoApp || `MW-${iIdx + 1}`, {
        x: 0.8,
        y: 0.45,
        w: 1.8,
        h: 0.32,
        fontSize: 10,
        color: C_WHITE,
        bold: true,
        align: 'center',
      });

      // Status Badge
      const statusBg = item.estado === 'En Producción' ? '064E3B' : '1E293B';
      const statusText = item.estado === 'En Producción' ? '34D399' : '38BDF8';
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 2.8,
        y: 0.45,
        w: 1.8,
        h: 0.32,
        rectRadius: 0.08,
        fill: { color: statusBg },
        line: { color: statusText, width: 0.5 },
      });
      slideDetail.addText(item.estado, {
        x: 2.8,
        y: 0.45,
        w: 1.8,
        h: 0.32,
        fontSize: 10,
        color: statusText,
        bold: true,
        align: 'center',
      });

      // Project Name
      slideDetail.addText(item.nombre, {
        x: 0.8,
        y: 0.85,
        w: 11.5,
        h: 0.6,
        fontSize: 24,
        color: C_WHITE,
        bold: true,
      });

      const metaSub = [
        item.codigoApp ? `Nº GDD: ${item.codigoApp}` : '',
        item.plataformaGrupo ? `Plataforma / Grupo: ${item.plataformaGrupo}` : '',
        `Categoría: ${item.categoria}`,
        item.desarrolladorACargo ? `Dev a Cargo: ${item.desarrolladorACargo}` : '',
        `Responsable: ${item.responsable || 'Equipo Middleware'}`
      ].filter(Boolean).join('  •  ');

      slideDetail.addText(metaSub, {
        x: 0.8,
        y: 1.45,
        w: 11.5,
        h: 0.3,
        fontSize: 11,
        color: C_MUTED,
      });

      // 4 Metric cards for this integration
      const itemMetrics = [
        { label: 'AVANCE', val: `${item.progreso}%`, sub: 'Completitud', color: C_AMBER },
        { label: 'MESES', val: `${item.mesesEjecucion || 0}`, sub: 'En ejecución', color: C_CYAN },
        { label: 'DESPLIEGUES', val: `${item.desplieguesCount || 0}`, sub: 'Frontend + Backend', color: C_BLUE },
        { label: 'SERVICIOS', val: `${item.serviciosCount || 0}`, sub: 'APIs activas', color: C_EMERALD },
      ];

      itemMetrics.forEach((m, mIdx) => {
        const xPos = 0.8 + mIdx * 2.95;
        slideDetail.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: 1.9,
          w: 2.75,
          h: 1.3,
          rectRadius: 0.1,
          fill: { color: C_CARD_BG },
          line: { color: C_CARD_BORDER, width: 1 },
        });

        slideDetail.addText(m.val, {
          x: xPos + 0.2,
          y: 2.05,
          w: 2.35,
          h: 0.5,
          fontSize: 22,
          color: m.color,
          bold: true,
        });

        slideDetail.addText(`${m.label} • ${m.sub}`, {
          x: xPos + 0.2,
          y: 2.6,
          w: 2.35,
          h: 0.3,
          fontSize: 9,
          color: C_MUTED,
          bold: true,
        });
      });

      // Progress Bar
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.4,
        w: 11.73,
        h: 0.18,
        rectRadius: 0.09,
        fill: { color: '1E293B' },
        line: { color: '334155', width: 0.5 },
      });
      const barFillW = Math.max(0.2, (11.73 * (item.progreso || 0)) / 100);
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.4,
        w: barFillW,
        h: 0.18,
        rectRadius: 0.09,
        fill: { color: '3B82F6' },
        line: { color: '3B82F6' },
      });

      // Description Box
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.8,
        w: 6.8,
        h: 2.8,
        rectRadius: 0.12,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slideDetail.addText('DESCRIPCIÓN Y ALCANCE FUNCIONAL', {
        x: 1.0,
        y: 3.95,
        w: 6.4,
        h: 0.3,
        fontSize: 10,
        color: C_CYAN,
        bold: true,
      });
      slideDetail.addText(item.descripcion || 'Sin descripción detallada.', {
        x: 1.0,
        y: 4.3,
        w: 6.4,
        h: 1.8,
        fontSize: 11,
        color: C_TEXT,
        lineSpacingMultiple: 1.2,
      });
      slideDetail.addText(`Release Actual: ${item.releaseActual || '1.0.0'}`, {
        x: 1.0,
        y: 6.15,
        w: 6.4,
        h: 0.3,
        fontSize: 10,
        color: C_EMERALD,
        bold: true,
      });

      // Technical Stack & Endpoints Box (Right)
      slideDetail.addShape(pptx.ShapeType.roundRect, {
        x: 7.8,
        y: 3.8,
        w: 4.73,
        h: 2.8,
        rectRadius: 0.12,
        fill: { color: C_CARD_BG },
        line: { color: C_CARD_BORDER, width: 1 },
      });
      slideDetail.addText('STACK TECNOLÓGICO & ARQUITECTURA', {
        x: 8.0,
        y: 3.95,
        w: 4.33,
        h: 0.3,
        fontSize: 10,
        color: C_CYAN,
        bold: true,
      });

      const techStr = item.tecnologias && item.tecnologias.length > 0 
        ? item.tecnologias.join(' • ') 
        : 'APIs REST, Webhooks, Docker';
      slideDetail.addText(`Tecnologías:\n${techStr}`, {
        x: 8.0,
        y: 4.3,
        w: 4.33,
        h: 0.8,
        fontSize: 10,
        color: C_TEXT,
      });

      const endpointStr = item.endpointBase ? `Endpoint: ${item.endpointBase}` : 'Endpoint: /api/v1/integrations';
      const repoStr = item.repoUrl ? `Repo: ${item.repoUrl}` : 'Repo: git.enterprise.internal/middleware';
      slideDetail.addText(`${endpointStr}\n${repoStr}`, {
        x: 8.0,
        y: 5.2,
        w: 4.33,
        h: 0.8,
        fontSize: 9,
        color: C_MUTED,
      });
    });

    // ----------------------------------------------------
    // SLIDE FINAL: GOBERNANZA Y ROADMAP MIDDLEWARE
    // ----------------------------------------------------
    const slideEnd = pptx.addSlide();
    slideEnd.background = { color: C_DARK_BG };

    slideEnd.addText('EQUIPO MIDDLEWARE & INTEGRACIONES', {
      x: 1.0,
      y: 2.0,
      w: 11.33,
      h: 0.35,
      fontSize: 13,
      color: C_CYAN,
      bold: true,
      align: 'center',
      charSpacing: 2,
    });
    slideEnd.addText('Gobernanza, Estabilidad y Trazabilidad de APIs', {
      x: 1.0,
      y: 2.45,
      w: 11.33,
      h: 0.9,
      fontSize: 30,
      color: C_WHITE,
      bold: true,
      align: 'center',
    });
    slideEnd.addText(
      'Monitoreo continuo de integraciones, homologación de contratos OpenAPI y validación funcional en producción.',
      {
        x: 2.0,
        y: 3.5,
        w: 9.33,
        h: 0.8,
        fontSize: 14,
        color: C_MUTED,
        align: 'center',
        lineSpacingMultiple: 1.2,
      }
    );

    // Save File
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `${fileNamePrefix}_${dateStr}_${timeStr}.pptx`;

    await pptx.writeFile({ fileName: filename });
    return true;
  } catch (error) {
    console.error('Error generating Middleware PowerPoint presentation:', error);
    alert('Ocurrió un error al generar la presentación de Middleware. Por favor intente nuevamente.');
    return false;
  }
}
