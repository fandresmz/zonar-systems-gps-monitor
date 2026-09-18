import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Network, 
  GitBranch, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Server, 
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'sequence' | 'activity' | 'database'>('network');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/60 backdrop-blur-xs p-4">
      <div 
        id="architecture-spec-modal"
        className="w-full max-w-5xl bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#0284c7] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold">
                Arquitectura del Sistema & Diagramas Oficiales (Zonar Systems)
              </h3>
              <p className="text-[11px] font-mono text-[#94a3b8]">
                TRD / PRD / Plan de Desarrollo - Especificación Técnica 1.0 (15 Sep 2026)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc] px-4 text-xs font-medium text-[#64748b] overflow-x-auto">
          <button
            onClick={() => setActiveTab('network')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'network'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>1. Contenedores & Red (VPC / BFF / Cloud Run)</span>
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'sequence'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>2. Secuencia & Validación CI/CD (Gates)</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'activity'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>3. Flujo de Actividad (Falsos Positivos vs Hardware)</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'database'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>4. Modelo DB PostgreSQL + TimescaleDB (RLS)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-xs text-[#334155]">
          {/* TAB 1: CONTAINER & NETWORK ARCHITECTURE */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-4 font-mono text-[11px] leading-relaxed">
                <h4 className="font-bold text-[#0f172a] text-xs uppercase mb-2 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-[#0284c7]" />
                  <span>Arquitectura de Contenedores y Red Multi-VPC (TRD 1.1)</span>
                </h4>
                <p className="text-[#475569] mb-3">
                  Implementación de arquitectura desacoplada orientada a eventos con BFF en Node.js, mensajería Kafka/Redis y persistencia temporal en TimescaleDB con RLS.
                </p>

                {/* Visual Architecture Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                  <div className="p-3 bg-white border border-[#bfdbfe] rounded shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase">Public VPC (Cloud Run)</span>
                    <div className="p-2 bg-[#eff6ff] rounded text-[#0f172a]">
                      <strong>React Frontend</strong> (Vite + Tailwind)
                    </div>
                    <div className="p-2 bg-[#eff6ff] rounded text-[#0f172a]">
                      <strong>Node.js BFF Proxy</strong> con sanitización Zod y gestión de sesiones JWT
                    </div>
                    <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[#64748b] text-[10px]">
                      Secret Manager (Cero tokens en cliente)
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#fde68a] rounded shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold text-[#b45309] uppercase">Private VPC (Analytics)</span>
                    <div className="p-2 bg-[#fffbeb] rounded text-[#0f172a]">
                      <strong>Apache Kafka</strong> (3 Brokers de eventos)
                    </div>
                    <div className="p-2 bg-[#fffbeb] rounded text-[#0f172a]">
                      <strong>Redis Cache</strong> para estados inmediatos
                    </div>
                    <div className="p-2 bg-[#fffbeb] rounded text-[#0f172a]">
                      <strong>Python FastAPI + Celery</strong> (Motor ML predictivo)
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#a7f3d0] rounded shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold text-[#047857] uppercase">Persistence Subnet</span>
                    <div className="p-2 bg-[#ecfdf5] rounded text-[#0f172a]">
                      <strong>PostgreSQL + TimescaleDB</strong>
                    </div>
                    <div className="p-2 bg-[#ecfdf5] rounded text-[#0f172a]">
                      <strong>Row-Level Security (RLS)</strong> por account_id
                    </div>
                    <div className="p-2 bg-[#ecfdf5] rounded text-[#0f172a]">
                      <strong>Hypertables Append-Only</strong> inmutables para telemetría
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] mt-2 text-[#64748b]">
                  <div>• Integraciones externas: Zonar OMI API (Ground Traffic Control), Twilio (SMS), SendGrid (Email).</div>
                  <div>• Seguridad perimetral: WAF / Rate Limiting en API Gateway contra ataques de fuerza bruta.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEQUENCE & CI/CD GATES */}
          {activeTab === 'sequence' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-4 font-mono text-[11px] leading-relaxed">
                <h4 className="font-bold text-[#0f172a] text-xs uppercase mb-2 flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-[#0284c7]" />
                  <span>Flujo de Ingesta Telemática & Validation Gates (Plan 2 & 3)</span>
                </h4>

                <div className="space-y-3 my-3">
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded">
                    <strong className="text-[#0284c7]">Paso 1:</strong> Zonar API emite evento telemático REST/Webhook &rarr; Node.js BFF valida esquema Zod.
                  </div>
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded">
                    <strong className="text-[#0284c7]">Paso 2:</strong> BFF encola evento en Apache Kafka &rarr; Celery Worker desencola y ejecuta modelo ML en FastAPI.
                  </div>
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded">
                    <strong className="text-[#0284c7]">Paso 3:</strong> Algoritmo calcula probabilidad de fallo (0-100%) &rarr; Persiste en TimescaleDB con RLS.
                  </div>
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded">
                    <strong className="text-[#0284c7]">Paso 4:</strong> Si el fallo proyectado es crítico (&gt;75%), emite alerta automática vía SendGrid/Twilio y se despliega en React Dashboard.
                  </div>
                </div>

                {/* Validation Gates Table */}
                <h5 className="font-bold text-[#0f172a] text-[11px] uppercase mt-4 mb-2">
                  Puertas de Calidad y Criterios de Parada (Validation Gates):
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white border border-[#a7f3d0] rounded">
                    <span className="text-[10px] font-bold text-[#059669] block">Gate 1: CI/CD Automatizado</span>
                    <p className="text-[10px] text-[#475569] mt-1">100% pruebas PyTest y Vitest sin advertencias de linter.</p>
                  </div>
                  <div className="p-2.5 bg-white border border-[#bfdbfe] rounded">
                    <span className="text-[10px] font-bold text-[#0284c7] block">Gate 2: Validación de Datos</span>
                    <p className="text-[10px] text-[#475569] mt-1">0 violaciones de esquemas en pruebas de estrés con Zod y Pydantic.</p>
                  </div>
                  <div className="p-2.5 bg-white border border-[#fde68a] rounded">
                    <span className="text-[10px] font-bold text-[#b45309] block">Gate 3: Aprobación Humana</span>
                    <p className="text-[10px] text-[#475569] mt-1">Revisión de arquitectura por Líder Técnico y Product Owner antes de producción.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM ACTIVITY FLOW */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-4 font-mono text-[11px] leading-relaxed">
                <h4 className="font-bold text-[#0f172a] text-xs uppercase mb-2 flex items-center space-x-1.5">
                  <Workflow className="w-4 h-4 text-[#0284c7]" />
                  <span>Flujo de Actividad: Detección de Falsos Positivos vs Fallas Reales (PRD 5.1)</span>
                </h4>
                <p className="text-[#475569] mb-3">
                  Mecanismo crítico para prevenir alertas innecesarias (*Alert Storms*) cuando los vehículos atraviesan túneles o cañones con sombras orográficas.
                </p>

                <div className="p-3 bg-white border border-[#cbd5e1] rounded space-y-2">
                  <div className="flex items-center space-x-2 text-[#0284c7] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lógica de Discriminación de Falsos Positivos:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[#334155]">
                    <li><strong>Caso Sombra RF / Túnel (Falso Positivo):</strong> Caída abrupta de señal LTE (&lt; -110 dBm) con tensión de batería normal (&gt; 12.8V) en proximidad geográfica a túnel conocido. Se categoriza como <em>Passive Coverage Loss</em> sin generar orden de cambio de hardware.</li>
                    <li><strong>Caso Falla Eléctrica Real:</strong> Caída progresiva de tensión en bus CAN J1939 (&lt; 11.2V) o DTC de fallo interno en módem. Se clasifica como <em>Predicted Failure</em> y se genera caso técnico inmediato.</li>
                    <li><strong>Módulo de Bitácora Manual:</strong> El técnico de soporte confirma el hallazgo, registra los minutos invertidos y cierra el caso en el sistema.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & RLS MULTI-TENANT MODEL */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-4 font-mono text-[11px] leading-relaxed">
                <h4 className="font-bold text-[#0f172a] text-xs uppercase mb-2 flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-[#0284c7]" />
                  <span>Modelo de Datos PostgreSQL + TimescaleDB con RLS Nativo</span>
                </h4>
                <p className="text-[#475569] mb-3">
                  Esquema relacional y de series de tiempo asegurando aislamiento estricto entre las 1.000+ cuentas cliente de Zonar Systems.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                  <div className="p-3 bg-white border border-[#cbd5e1] rounded space-y-1">
                    <strong className="text-[#0284c7] block">Tabla `accounts`</strong>
                    <div>id (PK, UUID)</div>
                    <div>name (VARCHAR 150)</div>
                    <div>created_at (TIMESTAMPTZ)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#cbd5e1] rounded space-y-1">
                    <strong className="text-[#0284c7] block">Tabla `users` (RBAC)</strong>
                    <div>id (PK, UUID)</div>
                    <div>account_id (FK &rarr; accounts.id)</div>
                    <div>email (VARCHAR)</div>
                    <div>role (admin_zonar, support_zonar, client_owner)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#cbd5e1] rounded space-y-1">
                    <strong className="text-[#0284c7] block">Tabla `devices`</strong>
                    <div>id (PK, VARCHAR)</div>
                    <div>account_id (FK &rarr; accounts.id)</div>
                    <div>serial_number (VARCHAR)</div>
                    <div>status (online, offline, degraded, predicted_failure)</div>
                    <div>firmware_version (VARCHAR)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#00855b] rounded space-y-1">
                    <strong className="text-[#00855b] block">Hypertable `gps_telemetry_logs` (TimescaleDB)</strong>
                    <div>time (PK, TIMESTAMPTZ - Partition Key)</div>
                    <div>device_id (FK &rarr; devices.id)</div>
                    <div>account_id (FK &rarr; accounts.id)</div>
                    <div>latitude / longitude / speed / latency / connectivity_state</div>
                    <div className="text-[10px] text-[#00855b] font-semibold pt-1">
                      🛡️ RLS Policy: WHERE account_id = current_setting('app.current_account_id')
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs">
          <span className="text-[#64748b] font-mono">
            Conforme a especificaciones TRD, PRD y PLAN de Zonar Systems
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#006194] text-white rounded font-medium hover:bg-[#004b73] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
