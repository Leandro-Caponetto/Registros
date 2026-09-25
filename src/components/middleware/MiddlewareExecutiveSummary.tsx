import React from 'react';
import { 
  Calendar, 
  Rocket, 
  Puzzle, 
  Link as LinkIcon, 
  ShieldCheck,
  Presentation,
  RefreshCw
} from 'lucide-react';
import { MiddlewareIntegration } from '../../types/integration';

interface MiddlewareExecutiveSummaryProps {
  integrations: MiddlewareIntegration[];
  onExportPowerPoint?: () => void;
  isExporting?: boolean;
}

export const MiddlewareExecutiveSummary: React.FC<MiddlewareExecutiveSummaryProps> = ({
  integrations,
  onExportPowerPoint,
  isExporting = false,
}) => {
  // Calculations
  const totalIntegrations = integrations.length;
  
  const totalServicios = integrations.reduce((acc, curr) => acc + (curr.serviciosCount || 0), 0);
  const totalDespliegues = integrations.reduce((acc, curr) => acc + (curr.desplieguesCount || 0), 0);
  const maxMeses = integrations.length > 0 
    ? Math.max(...integrations.map((i) => i.mesesEjecucion || 0)) 
    : 0;

  // Average progress or weighted progress
  const averageProgress = totalIntegrations > 0 
    ? Math.round(integrations.reduce((acc, curr) => acc + (curr.progreso || 0), 0) / totalIntegrations)
    : 0;

  // Latest release found among active integrations
  const activeRelease = integrations.find((i) => i.estado === 'En Producción')?.releaseActual 
    || (integrations.length > 0 ? integrations[0].releaseActual : 'Release 1.0.0');

  // Integrations names list for Card 4 summary
  const sampleNames = integrations.length > 0 
    ? integrations.slice(0, 5).map((i) => i.nombre.split(' ')[0]).join(', ')
    : 'Wocommerce, Tienda Nube, Renaper, Envío Nube, Mercadolibre';

  // SVG Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageProgress / 100) * circumference;

  return (
    <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 transition-all">
      
      {/* Header Badge & Action */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-900 text-white shadow-xs">
          Resumen ejecutivo
        </span>

        {onExportPowerPoint && (
          <button
            type="button"
            onClick={onExportPowerPoint}
            disabled={isExporting}
            title="Descargar presentación exclusiva de Middleware en PowerPoint (.pptx)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>Generando PPTX...</span>
              </>
            ) : (
              <>
                <Presentation className="w-3.5 h-3.5 text-orange-600" />
                <span>Presentación PPTX Middleware</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          Estado general del proyecto
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
          Resumen de estado del equipo Middleware y proyectos activos
        </p>
      </div>

      {/* Main Stats Row matching User Reference Image */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-10">
        
        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
              {/* Background Track Circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-slate-100"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Active Progress Circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-blue-950 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-blue-950 tracking-tight">
                {averageProgress}%
              </span>
              <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Avance general
              </span>
            </div>
          </div>
        </div>

        {/* 4 Light KPI Cards + 1 Dark Green Card (Matching Image) */}
        <div className="flex-1 w-full flex flex-col gap-5">
          
          {/* Top 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Meses */}
            <div className="flex flex-col">
              <div className="bg-slate-100/90 rounded-2xl p-4 flex items-center justify-between min-h-[72px] border border-slate-200/80">
                <Calendar className="w-6 h-6 text-blue-950 shrink-0 stroke-[2]" />
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-950 leading-none block">
                    {maxMeses}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Meses</span>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-2 px-1">
                Ejecución del programa
              </span>
            </div>

            {/* Card 2: Despliegues */}
            <div className="flex flex-col">
              <div className="bg-slate-100/90 rounded-2xl p-4 flex items-center justify-between min-h-[72px] border border-slate-200/80">
                <Rocket className="w-6 h-6 text-blue-950 shrink-0 stroke-[2]" />
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-950 leading-none block">
                    {totalDespliegues}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Despliegues</span>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-2 px-1">
                Frontend + Backend
              </span>
            </div>

            {/* Card 3: Servicios */}
            <div className="flex flex-col">
              <div className="bg-slate-100/90 rounded-2xl p-4 flex items-center justify-between min-h-[72px] border border-slate-200/80">
                <Puzzle className="w-6 h-6 text-blue-950 shrink-0 stroke-[2]" />
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-950 leading-none block">
                    {totalServicios}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Servicios</span>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-2 px-1">
                Implementadas
              </span>
            </div>

            {/* Card 4: Integraciones */}
            <div className="flex flex-col">
              <div className="bg-slate-100/90 rounded-2xl p-4 flex items-center justify-between min-h-[72px] border border-slate-200/80">
                <LinkIcon className="w-6 h-6 text-blue-950 shrink-0 stroke-[2]" />
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-950 leading-none block">
                    {totalIntegrations}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Integraciones</span>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-2 px-1 line-clamp-2" title={sampleNames}>
                {sampleNames}
              </span>
            </div>

          </div>

          {/* Bottom Green Card: Release Actual */}
          <div className="flex flex-col max-w-xs">
            <div className="bg-[#0F5132] text-white rounded-2xl p-4 flex items-center justify-between min-h-[72px] shadow-sm">
              <ShieldCheck className="w-7 h-7 text-emerald-300 shrink-0 stroke-[2]" />
              <div className="text-right">
                <span className="text-xl font-bold text-white leading-none block">
                  {activeRelease}
                </span>
                <span className="text-xs font-medium text-emerald-200">Release actual</span>
              </div>
            </div>
            <span className="text-xs text-slate-600 font-medium mt-2 px-1">
              Validación funcional
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
