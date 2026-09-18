import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wrench, 
  Battery, 
  Wifi, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  History, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Layers,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DeviceTelemetry } from '../types/fleet';

interface DeviceDetailDrawerProps {
  device: DeviceTelemetry | null;
  onClose: () => void;
  onRequestManualReview: (device: DeviceTelemetry) => void;
  onRequestDiagnosis: (device: DeviceTelemetry) => void;
  onDiagnoseAISubmit?: (deviceId: string) => Promise<any>;
}

export const DeviceDetailDrawer: React.FC<DeviceDetailDrawerProps> = ({
  device,
  onClose,
  onRequestManualReview,
  onRequestDiagnosis,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'faults' | 'history'>('overview');

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0b1c30]/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        id="device-detail-drawer"
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#cbd5e1] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#f8fafc] sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#0284c7]/10 border border-[#0284c7]/20 flex items-center justify-center text-[#0284c7]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-display font-bold text-[#0f172a]">
                  {device.vehicle.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 bg-[#eff6ff] text-[#0284c7] rounded border border-[#bfdbfe]">
                  {device.id}
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                {device.accountName} • <span className="font-semibold text-[#0f172a]">{device.clientPriority}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRequestDiagnosis(device)}
              className="px-2.5 py-1.5 text-xs bg-[#0284c7] text-white hover:bg-[#0369a1] rounded flex items-center space-x-1.5 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnóstico IA</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2e8f0] px-5 bg-white text-xs font-medium text-[#64748b]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            Resumen General (17 Variables)
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'telemetry'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            Curva de Degradación & Sensores
          </button>
          <button
            onClick={() => setActiveTab('faults')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'faults'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            Historial de Fallas & DTC ({device.faultHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            Revisiones ({device.manualReviewsCount}) & Casos
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 bg-[#f8fafc]/50">
          {/* TAB 1: OVERVIEW & 17 MANDATORY VARIABLES */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Alert Status Banner */}
              {device.isCoverageShadowFalsePositive ? (
                <div className="bg-[#eff6ff] border border-[#bfdbfe] p-3.5 rounded-sm flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0284c7] uppercase tracking-wider font-mono">
                      Falso Positivo Detectado: Sombra RF / Túnel
                    </h4>
                    <p className="text-xs text-[#1e40af] mt-1">
                      El algoritmo descartó fallo de hardware. La unidad se encuentra en trayecto por{' '}
                      <strong>{device.shadowZoneName || 'Zona de Sombra'}</strong>. La tensión de batería está normal ({device.voltage}V).
                    </p>
                  </div>
                </div>
              ) : device.failureProbability >= 75 ? (
                <div className="bg-[#fef2f2] border border-[#fecaca] p-3.5 rounded-sm flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#dc2626] uppercase tracking-wider font-mono">
                      Alerta Proactiva: Riesgo de Fallo Inminente ({device.failureProbability}%)
                    </h4>
                    <p className="text-xs text-[#991b1b] mt-1">
                      {device.predictedFailureReason || 'Anomalía en bus de datos y micro-cortes de alimentación detectados.'}
                    </p>
                    {device.estimatedTimeToTotalFailureHours && (
                      <p className="text-[11px] font-mono text-[#b91c1c] mt-1 font-semibold">
                        Tiempo estimado antes de desconexión irreversible: ~{device.estimatedTimeToTotalFailureHours} horas
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* 17 Mandatory Telemetric Variables Grid (PRD 3.1) */}
              <div className="bg-white border border-[#e2e8f0] rounded-sm p-4 shadow-2xs">
                <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Matriz de Variables Telemáticas Oficiales (PRD 3.1)</span>
                  <span className="text-[10px] text-[#64748b]">17 / 17 Registradas</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">1. ID del dispositivo GPS:</span>
                    <span className="font-mono font-bold text-[#0f172a]">{device.id}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">2. Cuenta o cliente:</span>
                    <span className="font-medium text-[#0f172a]">{device.accountName}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">3. Vehículo asociado:</span>
                    <span className="font-medium text-[#0f172a]">
                      {device.vehicle.name} ({device.vehicle.plate}) • VIN: {device.vehicle.vin}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">4. Modelo / tipo de GPS:</span>
                    <span className="font-mono text-[#0f172a]">{device.model}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">5. Estado del dispositivo:</span>
                    <span className="font-mono font-bold uppercase text-[#0284c7]">{device.status}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">6. Fecha/hora último reporte:</span>
                    <span className="font-mono text-[#0f172a]">{device.lastReportTime}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">7. Tiempo offline:</span>
                    <span className="font-mono font-bold text-[#dc2626]">
                      {device.offlineDurationMinutes} minutos ({device.inactivityTimeFormatted})
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">8. Conexiones / Desconexiones:</span>
                    <span className="font-mono text-[#0f172a]">{device.connectionHistory.length} eventos en log inmutable</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">9. Historial de fallas / DTC:</span>
                    <span className="font-mono text-[#0f172a]">{device.faultHistory.length} códigos registrados</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">10. Historial de mantenimientos:</span>
                    <span className="font-mono text-[#0f172a]">{device.maintenanceHistory.length} órdenes de servicio</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">11. Fecha de instalación:</span>
                    <span className="font-mono text-[#0f172a]">{device.installDate}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">12. Prioridad del cliente:</span>
                    <span className="font-bold text-[#b45309]">{device.clientPriority}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">13. Dispositivos offline detectados:</span>
                    <span className="font-mono text-[#0f172a]">6 en la flota activa</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">14. Tiempo de inactividad:</span>
                    <span className="font-mono text-[#0f172a]">{device.inactivityTimeFormatted}</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">15. Revisiones manuales realizadas:</span>
                    <span className="font-mono text-[#0f172a]">{device.manualReviewsCount} inspecciones</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                    <span className="text-[10px] font-mono text-[#64748b] block">16. Tiempo en revisiones manuales:</span>
                    <span className="font-mono font-semibold text-[#0284c7]">{device.manualReviewTotalTimeMinutes} minutos totales</span>
                  </div>

                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#f1f5f9] sm:col-span-2">
                    <span className="text-[10px] font-mono text-[#64748b] block">17. Casos solucionados y no solucionados:</span>
                    <span className="font-medium text-[#0f172a]">
                      {device.casesHistory.length === 0
                        ? 'Sin incidencias pendientes'
                        : device.casesHistory.map((c) => `${c.caseNumber} [${c.status.toUpperCase()}]`).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer inside tab */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => onRequestManualReview(device)}
                  className="px-3 py-2 bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <Wrench className="w-4 h-4 text-[#0284c7]" />
                  <span>Registrar Revisión Manual (Timer)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & DEGRADATION CURVE */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#e2e8f0] rounded-sm p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase tracking-wider">
                      Curva de Proyección de Fallo y Tensión (24h)
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Monitoreo continuo de caída de voltaje vs riesgo de fallo calculado por TimescaleDB ML
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#0284c7] font-semibold bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                    V: {device.voltage}V | Lat: {device.recentDegradationTrend[device.recentDegradationTrend.length - 1]?.latency}ms
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={device.recentDegradationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} fontStyle="JetBrains Mono" />
                      <YAxis yAxisId="left" stroke="#0284c7" fontSize={10} domain={[8, 16]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', fontFamily: 'JetBrains Mono' }} 
                      />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="voltage" 
                        stroke="#0284c7" 
                        name="Tensión Batería (V)" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="failureRisk" 
                        stroke="#ef4444" 
                        name="Riesgo de Fallo (%)" 
                        strokeWidth={2} 
                        strokeDasharray="4 4" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Live Sensor Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#e2e8f0] p-3 rounded-sm">
                  <span className="text-[10px] font-mono text-[#64748b] block">Tensión Alimentación</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Battery className={`w-4 h-4 ${device.voltage < 11.5 ? 'text-[#dc2626]' : 'text-[#059669]'}`} />
                    <span className="text-base font-mono font-bold text-[#0f172a]">{device.voltage} V</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">Nominal: 13.8V - 14.4V</span>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-3 rounded-sm">
                  <span className="text-[10px] font-mono text-[#64748b] block">Señal Celular LTE</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Wifi className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-base font-mono font-bold text-[#0f172a]">{device.cellularSignalDbm} dBm</span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">Umbral Crítico: -115 dBm</span>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-3 rounded-sm">
                  <span className="text-[10px] font-mono text-[#64748b] block">Satélites GNSS</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Activity className="w-4 h-4 text-[#10b981]" />
                    <span className="text-base font-mono font-bold text-[#0f172a]">
                      {device.connectionHistory[0]?.satellitesConnected ?? 10} sats
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">HDOP: 0.9 (Preciso)</span>
                </div>

                <div className="bg-white border border-[#e2e8f0] p-3 rounded-sm">
                  <span className="text-[10px] font-mono text-[#64748b] block">Velocidad & Rumbo</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Truck className="w-4 h-4 text-[#64748b]" />
                    <span className="text-base font-mono font-bold text-[#0f172a]">
                      {device.vehicle.currentLocation.speedKmh} km/h
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748b]">Rumbo: {device.vehicle.currentLocation.heading}°</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAULT HISTORY & DTC */}
          {activeTab === 'faults' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase">
                  Códigos de Diagnóstico Telemático (DTC & Alertas)
                </h3>
                <span className="text-xs font-mono text-[#64748b]">{device.faultHistory.length} registros</span>
              </div>

              {device.faultHistory.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#e2e8f0] rounded-sm">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <p className="text-xs font-sans text-[#0f172a] font-medium">Sin fallas registradas</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">El transceptor y bus de datos operan sin DTCs activos.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {device.faultHistory.map((fault) => (
                    <div key={fault.id} className="p-3 bg-white border border-[#e2e8f0] rounded-sm flex items-start space-x-3">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        fault.severity === 'critical' ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#0f172a]">{fault.code}</span>
                          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                            fault.severity === 'critical' ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#fef3c7] text-[#92400e]'
                          }`}>
                            {fault.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#334155] mt-1 font-sans">{fault.description}</p>
                        <div className="flex items-center space-x-3 mt-2 text-[10px] font-mono text-[#94a3b8]">
                          <span>Componente: {fault.component}</span>
                          <span>•</span>
                          <span>Timestamp: {fault.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS & CASES */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#0f172a] uppercase">
                  Historial de Casos y Revisiones Técnicas
                </h3>
                <button
                  onClick={() => onRequestManualReview(device)}
                  className="px-2.5 py-1 bg-[#0284c7] text-white rounded text-xs font-medium hover:bg-[#0369a1]"
                >
                  + Nueva Revisión Manual
                </button>
              </div>

              {device.casesHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono text-[#64748b] uppercase">Casos de Servicio Vinculados:</h4>
                  {device.casesHistory.map((c) => (
                    <div key={c.id} className="p-3 bg-white border border-[#e2e8f0] rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#0f172a]">{c.caseNumber}</span>
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                          c.status === 'solved'
                            ? 'bg-[#ecfdf5] text-[#059669]'
                            : c.status === 'in_progress'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : 'bg-[#fee2e2] text-[#991b1b]'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#0f172a] mt-1">{c.title}</p>
                      <p className="text-[11px] text-[#64748b] mt-0.5">{c.description}</p>
                      {c.resolutionNotes && (
                        <div className="mt-2 p-2 bg-[#f8fafc] border border-[#f1f5f9] rounded text-[11px] text-[#059669]">
                          <strong>Resolución:</strong> {c.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
