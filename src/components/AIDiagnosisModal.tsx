import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  Cpu, 
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { DeviceTelemetry } from '../types/fleet';

interface AIDiagnosisModalProps {
  device: DeviceTelemetry | null;
  onClose: () => void;
  onStartManualReview: (device: DeviceTelemetry) => void;
}

export const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({
  device,
  onClose,
  onStartManualReview,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!device) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch('/api/diagnose-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: device.id }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Error al generar diagnóstico');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error en el motor analítico');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [device]);

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4">
      <div 
        id="ai-diagnosis-modal"
        className="w-full max-w-xl bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#0284c7] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold">
                Motor Analítico de Proyección de Fallos
              </h3>
              <p className="text-[11px] font-mono text-[#94a3b8]">
                Dispositivo {device.id} • {device.vehicle.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-[#64748b]">
                Analizando series temporales en TimescaleDB & correlación con Zonar API...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded text-xs text-[#dc2626]">
              {error}
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Classification Tag */}
              <div className={`p-4 rounded border ${
                result.isFalsePositive
                  ? 'bg-[#eff6ff] border-[#bfdbfe]'
                  : 'bg-[#fef2f2] border-[#fecaca]'
              }`}>
                <div className="flex items-center space-x-2">
                  {result.isFalsePositive ? (
                    <ShieldCheck className="w-5 h-5 text-[#0284c7]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#ef4444]" />
                  )}
                  <h4 className="text-sm font-display font-bold">
                    {result.isFalsePositive ? 'FALSO POSITIVO VALIDADO' : 'FALLO PROYECTADO CRÍTICO'}
                  </h4>
                  <span className="text-[11px] font-mono ml-auto font-semibold px-2 py-0.5 rounded bg-white text-[#0f172a] border border-[#cbd5e1]">
                    Confianza: {result.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs mt-2 font-sans text-[#334155]">
                  {result.diagnosticSummary}
                </p>
              </div>

              {/* Categorization & Model Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-[#64748b] block">Categoría Raíz:</span>
                  <span className="font-bold text-[#0f172a]">{result.rootCauseCategory}</span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-[#64748b] block">Tiempo Estimado Solución:</span>
                  <span className="font-bold text-[#0284c7]">{result.estimatedTimeToResolutionMinutes} min</span>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white border border-[#e2e8f0] rounded p-3.5 space-y-2">
                <h5 className="text-xs font-mono font-bold text-[#0f172a] uppercase flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Protocolo de Acción Recomendado:</span>
                </h5>
                <ul className="space-y-1.5">
                  {result.recommendedActions?.map((act: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-[#334155]">
                      <span className="font-mono text-[#0284c7] font-bold shrink-0">{idx + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI & Engine Details */}
              <div className="p-2.5 bg-[#f1f5f9] rounded text-[11px] font-mono text-[#64748b] flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-[#0284c7]" />
                  <span>Motor: {result.model || 'FastAPI ML Projection'}</span>
                </span>
                <span>{result.aiPowered ? 'Gemini 3.8 Flash' : 'Reglas TRD v1.0'}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#0f172a] font-sans"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onStartManualReview(device);
            }}
            className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Iniciar Revisión Manual con Temporizador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
