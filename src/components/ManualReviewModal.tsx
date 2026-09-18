import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench,
  FileCheck
} from 'lucide-react';
import { DeviceTelemetry, ManualReviewInput } from '../types/fleet';

interface ManualReviewModalProps {
  device: DeviceTelemetry | null;
  onClose: () => void;
  onSubmitReview: (input: ManualReviewInput) => Promise<void>;
}

export const ManualReviewModal: React.FC<ManualReviewModalProps> = ({
  device,
  onClose,
  onSubmitReview,
}) => {
  // Timer state for measuring manual review duration
  const [seconds, setSeconds] = useState(180); // Default start with 3 minutes
  const [isRunning, setIsRunning] = useState(true);

  // Form states
  const [findings, setFindings] = useState('');
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [falsePositiveReason, setFalsePositiveReason] = useState<
    'Tunnel / Shadow Zone' | 'Maintenance Bay Power Cut' | 'Scheduled Engine Off' | 'Carrier Network Outage'
  >('Tunnel / Shadow Zone');
  const [markCaseSolved, setMarkCaseSolved] = useState(false);
  const [caseNotes, setCaseNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!device) return null;

  const minutesSpent = Math.max(1, Math.round(seconds / 60));

  const formatTimer = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings.trim() || findings.length < 5) {
      setValidationError('Por favor ingresa un detalle de hallazgos de al menos 5 caracteres.');
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      await onSubmitReview({
        deviceId: device.id,
        timeSpentMinutes: minutesSpent,
        findings,
        isFalsePositive,
        falsePositiveReason: isFalsePositive ? falsePositiveReason : undefined,
        markCaseSolved,
        caseNotes: markCaseSolved ? caseNotes : undefined,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Error al guardar la revisión manual.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4">
      <div 
        id="manual-review-modal"
        className="w-full max-w-lg bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#0f172a]">
                Registro de Revisión Manual & Casos (PRD 3.1)
              </h3>
              <p className="text-xs text-[#64748b] font-mono">
                {device.id} • {device.vehicle.name} • {device.accountName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#0f172a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Timer Section (PRD variable 16: "Tiempo empleado en las revisiones manuales") */}
          <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-[#0284c7]" />
              <div>
                <span className="text-[10px] font-mono text-[#0284c7] font-semibold uppercase block">
                  Cronómetro de Revisión Técnica
                </span>
                <span className="text-xl font-mono font-bold text-[#0f172a]">
                  {formatTimer()}
                </span>
                <span className="text-xs text-[#64748b] ml-2">
                  (~{minutesSpent} min a computar)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className="p-1.5 bg-white border border-[#cbd5e1] rounded text-[#0f172a] hover:bg-[#f1f5f9] text-xs"
                title={isRunning ? 'Pausar' : 'Reanudar'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#059669]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setSeconds(60);
                }}
                className="p-1.5 bg-white border border-[#cbd5e1] rounded text-[#64748b] hover:bg-[#f1f5f9] text-xs"
                title="Reiniciar a 1 min"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded text-xs text-[#dc2626]">
              {validationError}
            </div>
          )}

          {/* Findings Text Area */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[#0f172a] uppercase mb-1">
              Hallazgos Técnicos & Diagnóstico:
            </label>
            <textarea
              required
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describir las pruebas realizadas, verificación de arnés J1939, estado de cobertura o contactos..."
              className="w-full text-xs p-2.5 bg-white border border-[#cbd5e1] rounded text-[#0f172a] focus:outline-hidden focus:border-[#0284c7] font-sans"
            />
          </div>

          {/* False Positive Checkbox */}
          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm space-y-2">
            <label className="flex items-center space-x-2 text-xs font-medium text-[#0f172a] cursor-pointer">
              <input
                type="checkbox"
                checked={isFalsePositive}
                onChange={(e) => setIsFalsePositive(e.target.checked)}
                className="rounded border-[#cbd5e1] text-[#0284c7] focus:ring-0"
              />
              <span className="font-semibold">¿Es un Falso Positivo? (Descartar Alerta)</span>
            </label>

            {isFalsePositive && (
              <div className="pt-2 pl-6 space-y-1">
                <label className="text-[11px] font-mono text-[#64748b] block">
                  Motivo de la pérdida transitoria de telemetría:
                </label>
                <select
                  value={falsePositiveReason}
                  onChange={(e: any) => setFalsePositiveReason(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
                >
                  <option value="Tunnel / Shadow Zone">Túnel o Zona de Sombra Orográfica (RF Shadow)</option>
                  <option value="Maintenance Bay Power Cut">Corte de Energía en Bahía de Mantenimiento</option>
                  <option value="Scheduled Engine Off">Parada Programada con Motor Apagado</option>
                  <option value="Carrier Network Outage">Caída de Red del Operador Móvil</option>
                </select>
              </div>
            )}
          </div>

          {/* Mark case solved option */}
          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-sm space-y-2">
            <label className="flex items-center space-x-2 text-xs font-medium text-[#0f172a] cursor-pointer">
              <input
                type="checkbox"
                checked={markCaseSolved}
                onChange={(e) => setMarkCaseSolved(e.target.checked)}
                className="rounded border-[#cbd5e1] text-[#059669] focus:ring-0"
              />
              <span className="font-semibold text-[#059669]">
                Marcar caso / incidencia como SOLUCIONADO
              </span>
            </label>

            {markCaseSolved && (
              <div className="pt-2 pl-6">
                <input
                  type="text"
                  placeholder="Notas de resolución técnica (ej. Ajuste de conector FAKRA completado)..."
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#0f172a]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white rounded text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{submitting ? 'Guardando...' : 'Guardar Revisión Técnica'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
