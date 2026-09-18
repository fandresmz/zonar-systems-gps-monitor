import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Activity,
  Layers,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { DeviceTelemetry } from '../types/fleet';

interface PredictiveEngineViewProps {
  devices: DeviceTelemetry[];
  onSelectDevice: (device: DeviceTelemetry) => void;
  onRequestDiagnosis: (device: DeviceTelemetry) => void;
}

export const PredictiveEngineView: React.FC<PredictiveEngineViewProps> = ({
  devices,
  onSelectDevice,
  onRequestDiagnosis,
}) => {
  // Compute risk distributions
  const criticalRisk = devices.filter((d) => d.failureProbability >= 75 && !d.isCoverageShadowFalsePositive);
  const moderateRisk = devices.filter((d) => d.failureProbability >= 40 && d.failureProbability < 75 && !d.isCoverageShadowFalsePositive);
  const lowRisk = devices.filter((d) => d.failureProbability < 40 && !d.isCoverageShadowFalsePositive);
  const falsePositives = devices.filter((d) => d.isCoverageShadowFalsePositive);

  const pieData = [
    { name: 'Riesgo Crítico (>75%)', value: criticalRisk.length, color: '#ef4444' },
    { name: 'Riesgo Moderado (40-74%)', value: moderateRisk.length, color: '#f59e0b' },
    { name: 'Salud Óptima (<40%)', value: lowRisk.length, color: '#10b981' },
    { name: 'Falsos Positivos (Sombra RF)', value: falsePositives.length, color: '#0284c7' },
  ];

  const barData = devices.map((d) => ({
    id: d.id,
    plate: d.vehicle.plate,
    risk: d.failureProbability,
    voltage: d.voltage,
    isFP: d.isCoverageShadowFalsePositive,
  }));

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded bg-[#0284c7]/10 text-[#0284c7]">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-display font-bold text-[#0f172a]">
              Motor Predictivo de Proyección de Fallas & Machine Learning (Fase 2)
            </h2>
          </div>
          <p className="text-xs text-[#64748b] font-sans mt-1 max-w-3xl">
            Procesamiento analítico de series temporales en TimescaleDB con modelos de proyección de fallas. 
            Anticipa desconexiones críticas evaluando oscilogramas de tensión, jitter de latencia LTE y discriminación de zonas de sombra.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 bg-[#eff6ff] border border-[#bfdbfe] rounded text-right">
            <span className="text-[10px] text-[#0284c7] block">Algoritmo Zonar:</span>
            <span className="font-bold text-[#0f172a]">FastAPI ML + Pydantic</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Distribution */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-sm shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase mb-2">
            Distribución de Salud Telemática de Flota
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-2">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="text-[#64748b]">{p.name.split(' ')[0]}:</span>
                <strong className="text-[#0f172a]">{p.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Risk Spectrum */}
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-sm shadow-2xs lg:col-span-2">
          <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase mb-2">
            Espectro de Probabilidad de Fallo por Dispositivo (%)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="plate" stroke="#94a3b8" fontSize={9} fontStyle="JetBrains Mono" />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar 
                  dataKey="risk" 
                  name="Probabilidad Fallo (%)" 
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[#64748b] font-sans mt-2">
            Unidades con barra superior al 70% presentan micro-cortes o degradación severa de módem.
          </p>
        </div>
      </div>

      {/* Critical Projections List */}
      <div className="bg-white border border-[#e2e8f0] rounded-sm p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase">
              Unidades con Proyección Crítica de Fallo (Acción Inmediata)
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Dispositivos que aún están reportando o en degradación temprana antes de quedar completamente offline.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] font-semibold border border-[#fca5a5]">
            {criticalRisk.length} Equipos en Riesgo Inminente
          </span>
        </div>

        <div className="space-y-3">
          {criticalRisk.map((device) => (
            <div
              key={device.id}
              className="p-4 border border-[#fecaca] bg-[#fffbfb] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#ef4444] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-[#0f172a]">{device.id}</span>
                  <span className="text-xs font-semibold text-[#0f172a]">{device.vehicle.name} ({device.vehicle.plate})</span>
                  <span className="text-[#cbd5e1]">|</span>
                  <span className="text-xs text-[#64748b]">{device.accountName}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#fee2e2] text-[#991b1b] rounded border border-[#fca5a5]">
                    Riesgo: {device.failureProbability}%
                  </span>
                </div>

                <p className="text-xs text-[#7f1d1d] font-sans">
                  <strong>Causa Proyectada:</strong> {device.predictedFailureReason}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#64748b] pt-1">
                  <span>Tensión: {device.voltage}V</span>
                  <span>•</span>
                  <span>Tiempo estimado fallo: ~{device.estimatedTimeToTotalFailureHours} horas</span>
                  <span>•</span>
                  <span>Firmware: {device.firmwareVersion}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onRequestDiagnosis(device)}
                  className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium rounded flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diagnóstico IA</span>
                </button>
                <button
                  onClick={() => onSelectDevice(device)}
                  className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-medium rounded flex items-center space-x-1 transition-colors"
                >
                  <span>Examinar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
