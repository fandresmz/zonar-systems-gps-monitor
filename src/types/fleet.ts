import { z } from 'zod';

export type UserRole = 'admin_zonar' | 'support_zonar' | 'client_owner';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountId?: string; // If client_owner, restricted to this tenant
  accountName?: string;
}

export type DeviceStatus = 'online' | 'offline' | 'degraded' | 'predicted_failure';
export type ClientPriority = 'Tier 1 - Crítico' | 'Tier 2 - Alto' | 'Tier 3 - Estándar';
export type GPSModel = 'Zonar V4 (Heavy Duty)' | 'Zonar V3X (Fleet OBD-II)' | 'Zonar EVIR (Inspection)' | 'Zonar ZPass (Asset)';

export interface ConnectionEvent {
  id: string;
  timestamp: string;
  event: 'connect' | 'disconnect' | 'heartbeat';
  durationMinutes?: number;
  batteryVoltage: number;
  pingLatencyMs: number;
  cellularSignalDbm: number; // e.g. -75 dBm is good, -115 is shadow/tunnel
  satellitesConnected: number;
  speedKmh: number;
}

export interface FaultRecord {
  id: string;
  timestamp: string;
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: 'GPS Antenna' | 'Battery / Alternator' | 'CAN Bus / J1939' | 'Modem LTE' | 'Internal Firmware';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventive' | 'Corrective' | 'Firmware Check' | 'Harness Replacement';
  technician: string;
  notes: string;
  status: 'completed' | 'pending' | 'scheduled';
}

export interface ManualReviewRecord {
  id: string;
  deviceId: string;
  deviceCode: string;
  vehicleName: string;
  technicianName: string;
  timestamp: string;
  timeSpentMinutes: number;
  findings: string;
  isFalsePositive: boolean;
  falsePositiveReason?: 'Tunnel / Shadow Zone' | 'Maintenance Bay Power Cut' | 'Scheduled Engine Off' | 'Carrier Network Outage';
  caseCreated: boolean;
  caseId?: string;
}

export interface ServiceCase {
  id: string;
  caseNumber: string;
  deviceId: string;
  vehicleName: string;
  accountName: string;
  title: string;
  description: string;
  status: 'solved' | 'unsolved' | 'in_progress';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  resolvedAt?: string;
  assignedTechnician: string;
  timeSpentMinutes: number;
  resolutionNotes?: string;
}

export interface DeviceTelemetry {
  // PRD 3.1 17 Mandatory Variables
  id: string; // 1. ID del dispositivo GPS
  accountId: string; // 2. Cuenta o cliente al que pertenece
  accountName: string;
  vehicle: { // 3. Vehículo asociado
    name: string;
    plate: string;
    vin: string;
    type: 'Truck' | 'Van' | 'Bus' | 'Trailer';
    currentLocation: {
      lat: number;
      lng: number;
      address: string;
      heading: number;
      speedKmh: number;
    };
  };
  model: GPSModel; // 4. Modelo/tipo de GPS
  status: DeviceStatus; // 5. Estado del dispositivo (online/offline/etc)
  lastReportTime: string; // 6. Fecha y hora del último reporte/última conexión
  offlineDurationMinutes: number; // 7. Tiempo que lleva offline
  connectionHistory: ConnectionEvent[]; // 8. Historial/Duración de conexiones y desconexiones
  faultHistory: FaultRecord[]; // 9. Historial de fallas o novedades
  maintenanceHistory: MaintenanceRecord[]; // 10. Historial de mantenimientos
  installDate: string; // 11. Fecha de instalación del dispositivo
  clientPriority: ClientPriority; // 12. Nivel de prioridad del cliente
  offlineDeviceCountForAccount?: number; // 13. Cantidad de dispositivos offline detectados (resumen)
  inactivityTimeFormatted: string; // 14. Tiempo de inactividad de cada dispositivo
  manualReviewsCount: number; // 15. Cantidad de revisiones realizadas manualmente
  manualReviewTotalTimeMinutes: number; // 16. Tiempo empleado en las revisiones manuales
  casesHistory: ServiceCase[]; // 17. Historial de casos solucionados y no solucionados

  // Predictive Failure & AI Telemetrics
  failureProbability: number; // 0-100%
  predictedFailureReason?: string;
  estimatedTimeToTotalFailureHours?: number;
  batteryHealthPercent: number;
  voltage: number; // Current battery/power voltage
  cellularSignalDbm: number;
  isCoverageShadowFalsePositive: boolean;
  shadowZoneName?: string;
  firmwareVersion: string;
  recentDegradationTrend: {
    time: string;
    voltage: number;
    latency: number;
    failureRisk: number;
  }[];
}

export interface AccountTenant {
  id: string;
  name: string;
  contractTier: ClientPriority;
  totalDevices: number;
  activeContractSince: string;
  contactEmail: string;
}

// Zod validation schemas according to TRD (Node.js/TypeScript BFF sanitization)
export const ManualReviewInputSchema = z.object({
  deviceId: z.string().min(3),
  timeSpentMinutes: z.number().min(1).max(720),
  findings: z.string().min(5).max(1000),
  isFalsePositive: z.boolean(),
  falsePositiveReason: z.enum(['Tunnel / Shadow Zone', 'Maintenance Bay Power Cut', 'Scheduled Engine Off', 'Carrier Network Outage']).optional(),
  markCaseSolved: z.boolean().optional(),
  caseNotes: z.string().optional(),
});

export type ManualReviewInput = z.infer<typeof ManualReviewInputSchema>;

export const ServiceCaseCreateSchema = z.object({
  deviceId: z.string().min(3),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(1500),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  assignedTechnician: z.string().min(2),
});

export type ServiceCaseCreateInput = z.infer<typeof ServiceCaseCreateSchema>;
