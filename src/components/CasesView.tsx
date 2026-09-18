import React, { useState } from 'react';
import { 
  ListChecks, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  User,
  Building2,
  FileText
} from 'lucide-react';
import { ServiceCase, ManualReviewRecord, DeviceTelemetry } from '../types/fleet';

interface CasesViewProps {
  cases: ServiceCase[];
  manualReviews: ManualReviewRecord[];
  devices: DeviceTelemetry[];
  onOpenNewCaseModal: () => void;
  onOpenManualReview: (device: DeviceTelemetry) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  manualReviews,
  devices,
  onOpenNewCaseModal,
  onOpenManualReview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'reviews'>('cases');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'in_progress'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.vehicleName.toLowerCase().includes(q) ||
        c.accountName.toLowerCase().includes(q) ||
        c.assignedTechnician.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalTimeSpentReviews = manualReviews.reduce((sum, r) => sum + r.timeSpentMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Top Header & Subtabs */}
      <div className="bg-white border border-[#e2e8f0] p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base font-display font-bold text-[#0f172a] flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-[#006194]" />
            <span>Gestión Operativa de Casos y Revisiones Técnicas (PRD 3.1)</span>
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5 font-sans">
            Registro auditable de horas de soporte técnico, diagnósticos manuales y resolución de fallas telemáticas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewCaseModal}
            className="px-3 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Caso de Servicio</span>
          </button>
        </div>
      </div>

      {/* Subtab Toggle Buttons */}
      <div className="flex border-b border-[#e2e8f0] bg-white px-4 text-xs font-medium text-[#64748b]">
        <button
          onClick={() => setActiveSubTab('cases')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'cases'
              ? 'border-[#0284c7] text-[#0284c7] font-semibold'
              : 'border-transparent hover:text-[#0f172a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Casos de Soporte ({cases.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'reviews'
              ? 'border-[#0284c7] text-[#0284c7] font-semibold'
              : 'border-transparent hover:text-[#0f172a]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Bitácora de Revisiones Manuales ({manualReviews.length} • {Math.round(totalTimeSpentReviews / 60)}h {totalTimeSpentReviews % 60}m)</span>
        </button>
      </div>

      {/* CASES SUBTAB */}
      {activeSubTab === 'cases' && (
        <div className="bg-white border border-[#e2e8f0] rounded-sm p-4 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar caso, unidad, técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-[#cbd5e1] rounded text-[#0f172a] text-xs font-sans focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[#64748b]">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#cbd5e1] rounded text-xs px-2 py-1 text-[#0f172a]"
              >
                <option value="all">Todos los casos ({cases.length})</option>
                <option value="solved">Solucionados</option>
                <option value="in_progress">En Progreso</option>
                <option value="unsolved">No Solucionados / Pendientes</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center text-[#64748b] text-xs">
                No hay casos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border border-[#e2e8f0] rounded-sm hover:border-[#cbd5e1] transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#0f172a]">
                        {c.caseNumber}
                      </span>
                      <span className="text-[#cbd5e1]">|</span>
                      <span className="text-xs font-bold text-[#0f172a]">
                        {c.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                          c.status === 'solved'
                            ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                            : c.status === 'in_progress'
                            ? 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]'
                            : 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] font-sans">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#64748b]">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-[#64748b]" />
                        <span>{c.accountName}</span>
                      </span>
                      <span>•</span>
                      <span>Unidad: {c.vehicleName} ({c.deviceId})</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-[#64748b]" />
                        <span>Asignado: {c.assignedTechnician}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-[#0284c7]">
                        <Clock className="w-3 h-3" />
                        <span>Tiempo invertido: {c.timeSpentMinutes} min</span>
                      </span>
                    </div>

                    {c.resolutionNotes && (
                      <div className="mt-2 p-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs text-[#065f46]">
                        <strong>Resolución Técnica:</strong> {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MANUAL REVIEWS SUBTAB */}
      {activeSubTab === 'reviews' && (
        <div className="bg-white border border-[#e2e8f0] rounded-sm p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <p className="font-mono">
              Total acumulado en revisiones manuales: <strong className="text-[#0f172a]">{totalTimeSpentReviews} minutos</strong> (~{(totalTimeSpentReviews / 60).toFixed(1)} horas)
            </p>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {manualReviews.map((rev) => (
              <div key={rev.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#0f172a]">{rev.deviceCode}</span>
                    <span className="text-[#64748b]">({rev.vehicleName})</span>
                    <span className="text-[#cbd5e1]">|</span>
                    <span className="font-mono text-[#0284c7] font-semibold">
                      {rev.timeSpentMinutes} minutos empleados
                    </span>
                    {rev.isFalsePositive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#eff6ff] text-[#0284c7] border border-[#bfdbfe]">
                        Falso Positivo ({rev.falsePositiveReason || 'Túnel'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                        Falla Real Detectada
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#334155] font-sans">
                    {rev.findings}
                  </p>

                  <div className="text-[10px] font-mono text-[#94a3b8] flex items-center space-x-3">
                    <span>Técnico: {rev.technicianName}</span>
                    <span>•</span>
                    <span>Fecha: {rev.timestamp}</span>
                  </div>
                </div>

                <div>
                  {rev.caseCreated && rev.caseId ? (
                    <span className="text-[11px] font-mono bg-[#f1f5f9] text-[#0f172a] px-2 py-1 rounded border border-[#e2e8f0]">
                      Caso Vinculado
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#64748b]">
                      Sin ticket necesario
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
