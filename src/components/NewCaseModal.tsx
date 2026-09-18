import React, { useState } from 'react';
import { X, Plus, AlertTriangle, User, Building2 } from 'lucide-react';
import { DeviceTelemetry, ServiceCaseCreateInput } from '../types/fleet';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceTelemetry[];
  onCreateCase: (input: ServiceCaseCreateInput) => Promise<void>;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  devices,
  onCreateCase,
}) => {
  const [deviceId, setDeviceId] = useState(devices[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [assignedTechnician, setAssignedTechnician] = useState('Ing. Sofía Valenzuela');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreateCase({
        deviceId,
        title,
        description,
        priority,
        assignedTechnician,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el caso de servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4">
      <div 
        id="new-case-modal"
        className="w-full max-w-lg bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="text-sm font-display font-bold">
              Crear Nuevo Caso de Soporte / Mantenimiento
            </h3>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded text-[#dc2626]">
              {error}
            </div>
          )}

          <div>
            <label className="block font-mono font-semibold text-[#0f172a] uppercase mb-1">
              Dispositivo / Unidad Afectada:
            </label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} - {d.vehicle.name} ({d.accountName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono font-semibold text-[#0f172a] uppercase mb-1">
              Título de la Incidencia:
            </label>
            <input
              type="text"
              required
              placeholder="ej. Caída de tensión por arnés J1939 flojo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
            />
          </div>

          <div>
            <label className="block font-mono font-semibold text-[#0f172a] uppercase mb-1">
              Descripción & Diagnóstico Inicial:
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detallar las lecturas telemáticas, código de fallo DTC y acciones requeridas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-semibold text-[#0f172a] uppercase mb-1">
                Prioridad:
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
              >
                <option value="critical">Crítica (Riesgo Desconexión)</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-semibold text-[#0f172a] uppercase mb-1">
                Técnico Asignado:
              </label>
              <input
                type="text"
                required
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[#64748b] hover:text-[#0f172a]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Caso de Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
