import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Battery, 
  Wifi, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Bus,
  Wrench
} from 'lucide-react';
import { DeviceTelemetry, DeviceStatus, ClientPriority } from '../types/fleet';

interface DeviceTableProps {
  devices: DeviceTelemetry[];
  onSelectDevice: (device: DeviceTelemetry) => void;
  onRequestDiagnosis: (device: DeviceTelemetry) => void;
  onRequestManualReview: (device: DeviceTelemetry) => void;
  initialStatusFilter?: string;
}

type SortField = 'priority' | 'offlineDuration' | 'failureProbability' | 'lastReport' | 'voltage';

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onSelectDevice,
  onRequestDiagnosis,
  onRequestManualReview,
  initialStatusFilter = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [falsePositiveOnly, setFalsePositiveOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and sort
  const filteredDevices = useMemo(() => {
    return devices
      .filter((d) => {
        // Search filter
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matches =
            d.id.toLowerCase().includes(q) ||
            d.vehicle.name.toLowerCase().includes(q) ||
            d.vehicle.plate.toLowerCase().includes(q) ||
            d.vehicle.vin.toLowerCase().includes(q) ||
            d.accountName.toLowerCase().includes(q) ||
            d.model.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && d.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && d.clientPriority !== priorityFilter) {
          return false;
        }

        // False positive filter
        if (falsePositiveOnly && !d.isCoverageShadowFalsePositive) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'priority') {
          // Tier 1 > Tier 2 > Tier 3 then by offline duration
          const weightA = a.clientPriority.includes('Crítico') ? 3 : a.clientPriority.includes('Alto') ? 2 : 1;
          const weightB = b.clientPriority.includes('Crítico') ? 3 : b.clientPriority.includes('Alto') ? 2 : 1;
          diff = weightB - weightA;
          if (diff === 0) {
            diff = b.offlineDurationMinutes - a.offlineDurationMinutes;
          }
        } else if (sortField === 'offlineDuration') {
          diff = b.offlineDurationMinutes - a.offlineDurationMinutes;
        } else if (sortField === 'failureProbability') {
          diff = b.failureProbability - a.failureProbability;
        } else if (sortField === 'voltage') {
          diff = a.voltage - b.voltage;
        }

        return sortAsc ? -diff : diff;
      });
  }, [devices, searchTerm, statusFilter, priorityFilter, falsePositiveOnly, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: DeviceStatus, isFalsePositive: boolean, shadowZone?: string) => {
    if (isFalsePositive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#eff6ff] text-[#0284c7] border border-[#bfdbfe]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] mr-1.5"></span>
          Falso Positivo (Túnel/Sombra)
        </span>
      );
    }

    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5"></span>
            Online
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mr-1.5"></span>
            Offline
          </span>
        );
      case 'predicted_failure':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#fffbeb] text-[#d97706] border border-[#fde68a] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mr-1.5"></span>
            Fallo Proyectado
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] mr-1.5"></span>
            Degradado
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: ClientPriority) => {
    if (priority.includes('Crítico')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] font-semibold">
          Tier 1 (Crítico)
        </span>
      );
    } else if (priority.includes('Alto')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
          Tier 2 (Alto)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
        Tier 3 (Estándar)
      </span>
    );
  };

  return (
    <div id="zonar-device-table-container" className="bg-white border border-[#e2e8f0] rounded-sm shadow-[0_1px_3px_rgba(15,23,42,0.02)] mb-8 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID GPS, Placa, VIN, Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded text-[#0f172a] placeholder-[#94a3b8] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/15 font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-[#0f172a]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clear Filter */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || falsePositiveOnly || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setFalsePositiveOnly(false);
                setSearchTerm('');
              }}
              className="px-2.5 py-1.5 text-xs font-sans text-[#64748b] hover:text-[#0f172a] flex items-center space-x-1 border border-[#cbd5e1] rounded bg-white"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status select */}
          <div className="flex items-center space-x-1 bg-white border border-[#cbd5e1] rounded px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="text-[#64748b] text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-[#0f172a] focus:ring-0 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="all">Todos ({devices.length})</option>
              <option value="predicted_failure">Fallo Proyectado</option>
              <option value="offline">Offline</option>
              <option value="degraded">Degradado</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Priority select */}
          <div className="flex items-center space-x-1 bg-white border border-[#cbd5e1] rounded px-2 py-1">
            <span className="text-[#64748b] text-[11px]">Prioridad:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-[#0f172a] focus:ring-0 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="all">Todas</option>
              <option value="Tier 1 - Crítico">Tier 1 (Crítico)</option>
              <option value="Tier 2 - Alto">Tier 2 (Alto)</option>
              <option value="Tier 3 - Estándar">Tier 3 (Estándar)</option>
            </select>
          </div>

          {/* False positive toggle button */}
          <button
            onClick={() => setFalsePositiveOnly(!falsePositiveOnly)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center space-x-1.5 border ${
              falsePositiveOnly
                ? 'bg-[#0284c7] text-white border-[#0369a1]'
                : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Falsos Positivos ({devices.filter(d => d.isCoverageShadowFalsePositive).length})</span>
          </button>
        </div>
      </div>

      {/* Sorting bar notice */}
      <div className="px-4 py-2 bg-[#f1f5f9] border-b border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span>Mostrando {filteredDevices.length} de {devices.length} dispositivos telemáticos</span>
          <span>|</span>
          <span className="text-[#0284c7]">
            Orden: {sortField === 'priority' ? 'Prioridad Cliente + Tiempo Offline' : sortField} ({sortAsc ? 'Asc' : 'Desc'})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSort('priority')}
            className="hover:text-[#0284c7] font-sans text-xs underline decoration-dotted"
          >
            Ordenar por Prioridad & Desconexión
          </button>
        </div>
      </div>

      {/* Dense Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] text-[#64748b] font-mono text-[10px] uppercase tracking-wider border-b border-[#e2e8f0]">
              <th className="py-2.5 px-3 font-semibold">
                <button 
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-[#0f172a]"
                >
                  <span>Dispositivo / Modelo</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">Vehículo / VIN</th>
              <th className="py-2.5 px-3 font-semibold">Cliente / Prioridad</th>
              <th className="py-2.5 px-3 font-semibold">
                <button 
                  onClick={() => handleSort('offlineDuration')}
                  className="flex items-center space-x-1 hover:text-[#0f172a]"
                >
                  <span>Estado & Inactividad</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                <button 
                  onClick={() => handleSort('voltage')}
                  className="flex items-center space-x-1 hover:text-[#0f172a]"
                >
                  <span>Telemetría (V / dBm / Sat)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                <button 
                  onClick={() => handleSort('failureProbability')}
                  className="flex items-center space-x-1 hover:text-[#0f172a]"
                >
                  <span>Proyección Fallo (AI)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">Revisiones / Casos</th>
              <th className="py-2.5 px-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#64748b] font-sans">
                  No se encontraron dispositivos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => {
                const isCriticalRisk = device.failureProbability >= 75 || device.status === 'predicted_failure';
                const isOffline = device.status === 'offline';

                return (
                  <tr
                    key={device.id}
                    className={`hover:bg-[#f8fafc] transition-colors group cursor-pointer ${
                      isCriticalRisk && !device.isCoverageShadowFalsePositive
                        ? 'bg-[#fffbeb]/20'
                        : isOffline && !device.isCoverageShadowFalsePositive
                        ? 'bg-[#fef2f2]/15'
                        : ''
                    }`}
                    onClick={() => onSelectDevice(device)}
                  >
                    {/* 1. Device ID & Model */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-6 rounded-xs bg-transparent group-hover:bg-[#0284c7] transition-all"></div>
                        <div>
                          <span className="font-mono font-bold text-[#0f172a] text-xs">
                            {device.id}
                          </span>
                          <p className="text-[10px] text-[#64748b] font-sans">
                            {device.model}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Vehicle & VIN */}
                    <td className="py-2.5 px-3">
                      <div>
                        <div className="flex items-center space-x-1.5 font-medium text-[#0f172a]">
                          {device.vehicle.type === 'Truck' ? (
                            <Truck className="w-3.5 h-3.5 text-[#64748b]" />
                          ) : (
                            <Bus className="w-3.5 h-3.5 text-[#64748b]" />
                          )}
                          <span>{device.vehicle.name}</span>
                          <span className="text-[10px] font-mono bg-[#f1f5f9] px-1 rounded text-[#475569]">
                            {device.vehicle.plate}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#94a3b8]">
                          VIN: {device.vehicle.vin.slice(0, 10)}...
                        </span>
                      </div>
                    </td>

                    {/* 3. Account & Priority */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <p className="font-medium text-[#0f172a] truncate max-w-[170px]" title={device.accountName}>
                          {device.accountName}
                        </p>
                        {getPriorityBadge(device.clientPriority)}
                      </div>
                    </td>

                    {/* 4. Status & Inactivity */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div>{getStatusBadge(device.status, device.isCoverageShadowFalsePositive, device.shadowZoneName)}</div>
                        <div className="text-[10px] font-mono text-[#64748b] flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{device.inactivityTimeFormatted}</span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Telemetry Metrics (Voltage / Latency / Sats) */}
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <Battery className={`w-3.5 h-3.5 ${device.voltage < 11.5 ? 'text-[#dc2626]' : 'text-[#059669]'}`} />
                          <span className={device.voltage < 11.5 ? 'text-[#dc2626] font-bold' : 'text-[#0f172a]'}>
                            {device.voltage} V
                          </span>
                          <span className="text-[10px] text-[#64748b]">({device.batteryHealthPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] text-[#64748b]">
                          <Wifi className="w-3 h-3 text-[#0284c7]" />
                          <span>{device.cellularSignalDbm} dBm</span>
                          <span>|</span>
                          <span>{device.connectionHistory[0]?.satellitesConnected ?? 0} sats</span>
                        </div>
                      </div>
                    </td>

                    {/* 6. AI Failure Projection */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={isCriticalRisk ? 'text-[#dc2626] font-bold' : 'text-[#0f172a]'}>
                            {device.failureProbability}%
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {device.failureProbability > 70 ? 'Riesgo Alto' : device.failureProbability > 30 ? 'Medio' : 'Bajo'}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              device.failureProbability >= 75
                                ? 'bg-[#ef4444]'
                                : device.failureProbability >= 40
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#10b981]'
                            }`}
                            style={{ width: `${device.failureProbability}%` }}
                          ></div>
                        </div>
                        {device.estimatedTimeToTotalFailureHours && (
                          <span className="text-[9px] font-mono text-[#b45309] block">
                            Falla en ~{device.estimatedTimeToTotalFailureHours}h
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 7. Manual Reviews & Cases */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-mono text-[#0f172a]">
                          {device.manualReviewsCount} rev. ({device.manualReviewTotalTimeMinutes} min)
                        </div>
                        {device.casesHistory.length > 0 ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            device.casesHistory[0].status === 'solved'
                              ? 'bg-[#ecfdf5] text-[#059669]'
                              : 'bg-[#fee2e2] text-[#991b1b]'
                          }`}>
                            Caso {device.casesHistory[0].caseNumber} ({device.casesHistory[0].status})
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#94a3b8]">Sin casos</span>
                        )}
                      </div>
                    </td>

                    {/* 8. Action Buttons */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onRequestDiagnosis(device)}
                          className="p-1.5 text-xs text-[#0284c7] hover:bg-[#eff6ff] rounded border border-[#bfdbfe] transition-colors"
                          title="Diagnóstico IA Proactivo"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestManualReview(device)}
                          className="p-1.5 text-xs text-[#475569] hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] transition-colors"
                          title="Registrar Revisión Manual (Técnico)"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="p-1.5 text-xs text-[#0f172a] hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] transition-colors"
                          title="Ver Detalle de Telemetría"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
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
    </div>
  );
};
