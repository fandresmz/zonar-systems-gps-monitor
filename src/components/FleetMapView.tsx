import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Info, 
  Truck, 
  WifiOff, 
  ShieldCheck, 
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import { DeviceTelemetry } from '../types/fleet';

interface FleetMapViewProps {
  devices: DeviceTelemetry[];
  onSelectDevice: (device: DeviceTelemetry) => void;
  onRequestDiagnosis: (device: DeviceTelemetry) => void;
}

export const FleetMapView: React.FC<FleetMapViewProps> = ({
  devices,
  onSelectDevice,
  onRequestDiagnosis,
}) => {
  const [selectedPin, setSelectedPin] = useState<DeviceTelemetry | null>(devices[0] || null);

  // Shadow zones in corridors
  const shadowZones = [
    { name: 'Túnel Boquerón Km 38 (Sombra RF)', x: 420, y: 380, radius: 45, reason: 'Paso bajo cordillera oriental - Pérdida celular natural' },
    { name: 'Túnel de La Línea Km 22', x: 260, y: 460, radius: 55, reason: '8.65 km subterráneo - Falsos positivos filtrados' },
    { name: 'Cañón del Chicamocha Km 70', x: 530, y: 220, radius: 40, reason: 'Orografía profunda - Cobertura satelital intermitente' },
  ];

  // Map coordinates projection helper (approximate bounding box for visualization)
  // Lat: 2.0 to 12.0 N, Lng: -78.0 to -72.0 W
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = 2.5;
    const maxLat = 11.5;
    const minLng = -77.5;
    const maxLng = -72.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50;

    return {
      x: Math.max(50, Math.min(750, x)),
      y: Math.max(50, Math.min(550, y)),
    };
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-sm shadow-[0_1px_3px_rgba(15,23,42,0.02)] overflow-hidden">
      {/* Map Control Bar */}
      <div className="p-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-mono text-[#0f172a] font-bold">
            <Navigation className="w-4 h-4 text-[#006194]" />
            <span>GEO-TELEMETRÍA SATELITAL EN VIVO</span>
          </div>
          <span className="text-[#cbd5e1]">|</span>
          <span className="text-[#64748b] font-mono text-[11px]">
            {devices.length} unidades rastreadas con corrección de sombras RF
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Online</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
            <span>Offline Real</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <span>Fallo Proyectado</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
            <span>Falso Positivo (Túnel)</span>
          </span>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full h-[540px] bg-[#eff4ff]/40 overflow-hidden select-none">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle, #f0f6ff 0%, #e2eaf8 100%)' }}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dbeafe" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Major Highway Corridors */}
          <path
            d="M 220 540 Q 320 420 400 340 T 480 200 T 520 80"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="3"
            strokeDasharray="6 3"
          />
          <path
            d="M 400 340 Q 300 320 220 300"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          <path
            d="M 400 340 L 580 440"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Highway labels */}
          <text x="510" y="90" fontSize="10" fill="#64748b" fontFamily="JetBrains Mono">Ruta Nacional 90 (Barranquilla)</text>
          <text x="360" y="325" fontSize="10" fill="#0f172a" fontFamily="JetBrains Mono" fontWeight="bold">Corredor Bogotá Central</text>
          <text x="180" y="295" fontSize="10" fill="#64748b" fontFamily="JetBrains Mono">Ruta al Valle / Cali</text>

          {/* Shadow Zones (Túneles y Cañones con Falsos Positivos) */}
          {shadowZones.map((sz, i) => (
            <g key={i}>
              <circle
                cx={sz.x}
                cy={sz.y}
                r={sz.radius}
                fill="#38bdf8"
                fillOpacity="0.15"
                stroke="#0284c7"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={sz.x - sz.radius + 5}
                y={sz.y - sz.radius - 6}
                fontSize="9"
                fill="#0284c7"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                ⚠️ {sz.name}
              </text>
            </g>
          ))}

          {/* Vehicle Markers */}
          {devices.map((d) => {
            const pos = getMapPosition(d.vehicle.currentLocation.lat, d.vehicle.currentLocation.lng);
            const isSelected = selectedPin?.id === d.id;

            let pinColor = '#10b981'; // online
            if (d.isCoverageShadowFalsePositive) pinColor = '#0284c7';
            else if (d.status === 'predicted_failure' || d.failureProbability >= 75) pinColor = '#f59e0b';
            else if (d.status === 'offline') pinColor = '#ef4444';

            return (
              <g
                key={d.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedPin(d)}
              >
                {/* Ripple ring for critical or predicted failure */}
                {(d.failureProbability >= 75 || isSelected) && (
                  <circle
                    r={isSelected ? 16 : 12}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Base pin */}
                <circle
                  r={isSelected ? 9 : 7}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="shadow-md drop-shadow"
                />

                {/* Label text */}
                <text
                  x="12"
                  y="4"
                  fontSize="10"
                  fill="#0f172a"
                  fontFamily="JetBrains Mono"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="bg-white/80"
                >
                  {d.vehicle.plate} ({d.id})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Vehicle Float Inspector Card */}
        {selectedPin && (
          <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md border border-[#cbd5e1] rounded shadow-xl p-4 text-xs z-10">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-2.5">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0f172a]">
                  {selectedPin.vehicle.name}
                </h4>
                <p className="font-mono text-[10px] text-[#64748b]">
                  {selectedPin.id} • {selectedPin.vehicle.plate}
                </p>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-[#94a3b8] hover:text-[#0f172a]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Estado Telemático:</span>
                <span className="font-mono font-bold uppercase text-[#0284c7]">
                  {selectedPin.isCoverageShadowFalsePositive
                    ? 'Falso Positivo (Túnel)'
                    : selectedPin.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Ubicación Actual:</span>
                <span className="font-medium text-[#0f172a] text-right truncate max-w-[150px]">
                  {selectedPin.vehicle.currentLocation.address}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono">
                <span className="text-[#64748b]">Velocidad & Rumbo:</span>
                <span className="text-[#0f172a]">
                  {selectedPin.vehicle.currentLocation.speedKmh} km/h • {selectedPin.vehicle.currentLocation.heading}°
                </span>
              </div>

              <div className="flex items-center justify-between font-mono">
                <span className="text-[#64748b]">Tensión / Batería:</span>
                <span className={selectedPin.voltage < 11.5 ? 'text-[#dc2626] font-bold' : 'text-[#059669]'}>
                  {selectedPin.voltage} V ({selectedPin.batteryHealthPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between font-mono">
                <span className="text-[#64748b]">Riesgo Fallo Proyectado:</span>
                <span className="font-bold text-[#b45309]">
                  {selectedPin.failureProbability}%
                </span>
              </div>

              {selectedPin.isCoverageShadowFalsePositive && (
                <div className="p-2 bg-[#eff6ff] border border-[#bfdbfe] rounded text-[11px] text-[#1e40af]">
                  <strong>Zona de Sombra:</strong> {selectedPin.shadowZoneName}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
              <button
                onClick={() => onRequestDiagnosis(selectedPin)}
                className="flex-1 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#0284c7] font-medium rounded text-[11px] transition-colors text-center border border-[#bfdbfe]"
              >
                Diagnóstico IA
              </button>
              <button
                onClick={() => onSelectDevice(selectedPin)}
                className="flex-1 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white font-medium rounded text-[11px] transition-colors text-center"
              >
                Ver 17 Variables
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
