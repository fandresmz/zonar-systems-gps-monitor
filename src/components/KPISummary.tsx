import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { DeviceTelemetry, ServiceCase, ManualReviewRecord } from '../types/fleet';

interface KPISummaryProps {
  devices: DeviceTelemetry[];
  cases: ServiceCase[];
  manualReviews: ManualReviewRecord[];
  onFilterByStatus?: (status: string) => void;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  devices,
  cases,
  manualReviews,
  onFilterByStatus,
}) => {
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const predictedFailures = devices.filter((d) => d.status === 'predicted_failure' || d.failureProbability >= 75).length;
  const falsePositives = devices.filter((d) => d.isCoverageShadowFalsePositive).length;

  const totalManualReviewMinutes = manualReviews.reduce((acc, r) => acc + r.timeSpentMinutes, 0);
  const totalManualReviewHours = (totalManualReviewMinutes / 60).toFixed(1);

  const solvedCases = cases.filter((c) => c.status === 'solved').length;
  const totalCases = cases.length;
  const solvedRate = totalCases > 0 ? Math.round((solvedCases / totalCases) * 100) : 100;

  return (
    <div id="zonar-kpi-summary-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {/* 1. Total & Online Devices */}
      <div 
        onClick={() => onFilterByStatus?.('all')}
        className="bg-white border border-[#e2e8f0] hover:border-[#0284c7] p-3.5 rounded-sm transition-all shadow-[0_1px_2px_rgba(15,23,42,0.02)] cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px]">Flota Activa</span>
          <Wifi className="w-4 h-4 text-[#0284c7]" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-display font-bold text-[#0f172a]">
            {totalDevices}
          </span>
          <span className="text-xs font-mono text-[#059669] font-medium">
            {onlineDevices} online
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span>Disp. 99.8%</span>
          <span className="text-[#0284c7] group-hover:underline">Ver todos &rarr;</span>
        </div>
      </div>

      {/* 2. Offline Devices (PRD 3.1) */}
      <div 
        onClick={() => onFilterByStatus?.('offline')}
        className={`bg-white border p-3.5 rounded-sm transition-all shadow-[0_1px_2px_rgba(15,23,42,0.02)] cursor-pointer group ${
          offlineDevices > 0 ? 'border-[#ef4444]/40 bg-[#fef2f2]/30' : 'border-[#e2e8f0]'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px] text-[#dc2626]">
            Unidades Offline
          </span>
          <WifiOff className="w-4 h-4 text-[#ef4444]" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-display font-bold text-[#dc2626]">
            {offlineDevices}
          </span>
          <span className="text-xs font-mono text-[#991b1b]">
            {((offlineDevices / (totalDevices || 1)) * 100).toFixed(0)}% de flota
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span className="text-[#dc2626]">Prioridad Tier 1</span>
          <span className="text-[#dc2626] group-hover:underline">Filtrar &rarr;</span>
        </div>
      </div>

      {/* 3. Predictive Failures (Proyección de Fallos) */}
      <div 
        onClick={() => onFilterByStatus?.('predicted_failure')}
        className="bg-white border border-[#f59e0b]/50 bg-[#fffbeb]/20 p-3.5 rounded-sm transition-all shadow-[0_1px_2px_rgba(15,23,42,0.02)] cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px] text-[#b45309]">
            Fallo Proyectado AI
          </span>
          <Cpu className="w-4 h-4 text-[#f59e0b]" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-display font-bold text-[#b45309]">
            {predictedFailures}
          </span>
          <span className="text-[11px] font-mono text-[#d97706] font-medium">
            Proactivo
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span>Riesgo &gt; 75%</span>
          <span className="text-[#b45309] group-hover:underline">Examinar &rarr;</span>
        </div>
      </div>

      {/* 4. KPI: Reducción Tiempo Detección (PRD 1.3) */}
      <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-sm shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px]">
            Tiempo Detección
          </span>
          <TrendingDown className="w-4 h-4 text-[#059669]" />
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-display font-bold text-[#059669]">
            -78%
          </span>
          <span className="text-xs font-mono text-[#64748b]">
            vs manual
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span className="text-[#059669]">Prom: 4.2 min</span>
          <span className="text-[#64748b]">Previo: 28m</span>
        </div>
      </div>

      {/* 5. KPI: Revisiones Manuales & Horas Invertidas (PRD 3.1) */}
      <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-sm shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px]">
            Revisiones Soporte
          </span>
          <Clock className="w-4 h-4 text-[#0284c7]" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-display font-bold text-[#0f172a]">
            {manualReviews.length}
          </span>
          <span className="text-xs font-mono text-[#64748b]">
            ({totalManualReviewHours} hrs)
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span className="text-[#059669] font-medium">{falsePositives} túnel/sombra</span>
          <span className="text-[#64748b]">Ahorro 32h</span>
        </div>
      </div>

      {/* 6. Casos Solucionados / Efectividad (PRD 3.1) */}
      <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-sm shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
          <span className="font-sans font-medium uppercase tracking-wider text-[11px]">
            Casos Resueltos
          </span>
          <CheckCircle2 className="w-4 h-4 text-[#00855b]" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-display font-bold text-[#00855b]">
            {solvedRate}%
          </span>
          <span className="text-xs font-mono text-[#64748b]">
            {solvedCases}/{totalCases}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-[#64748b] flex items-center justify-between">
          <span className="text-[#00855b]">Meta &gt;80%</span>
          <span className="text-[#64748b]">MTTR: 1.8h</span>
        </div>
      </div>
    </div>
  );
};
