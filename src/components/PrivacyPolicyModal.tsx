import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4">
      <div 
        id="privacy-policy-modal"
        className="w-full max-w-2xl bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-display font-bold">
              Política de Privacidad Telemática & Normativa Legal (PRD 4.1)
            </h3>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#334155] leading-relaxed">
          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded">
            <h4 className="font-bold text-[#0f172a] text-xs font-mono uppercase mb-1">
              1. Cumplimiento Regulatorio FMCSA / DOT (49 CFR) - ELD & HOS
            </h4>
            <p>
              El Sistema de Monitoreo Telemático de Zonar Systems garantiza que las capas de analítica predictiva y proyección de fallos no alteran, sobreescriben ni comprometen los registros oficiales regulados de Horas de Servicio (HOS) ni los reportes de inspección electrónica de vehículos (EVIR).
            </p>
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded">
            <h4 className="font-bold text-[#0f172a] text-xs font-mono uppercase mb-1">
              2. Aislamiento Multi-Tenant & Protección de Datos (CCPA / GDPR)
            </h4>
            <p>
              Todos los datos telemáticos, trayectorias satelitales (GNSS), números de identificación vehicular (VIN) y códigos de diagnóstico vehicular (DTC) se encuentran estrictamente particionados a nivel de base de datos mediante políticas de Row-Level Security (RLS) en PostgreSQL + TimescaleDB. Queda terminantemente impedido el cruce de datos entre clientes.
            </p>
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded">
            <h4 className="font-bold text-[#0f172a] text-xs font-mono uppercase mb-1">
              3. Guardrails de Seguridad de Hardware (PRD 4.2)
            </h4>
            <p>
              Está expresamente bloqueado el envío de comandos críticos de corte de combustible, apagado remoto de motores o reescritura no autorizada de firmware en vehículos en tránsito.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#006194] text-white rounded text-xs font-medium hover:bg-[#004b73]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
