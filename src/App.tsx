/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPISummary } from './components/KPISummary';
import { DeviceTable } from './components/DeviceTable';
import { DeviceDetailDrawer } from './components/DeviceDetailDrawer';
import { AIDiagnosisModal } from './components/AIDiagnosisModal';
import { ManualReviewModal } from './components/ManualReviewModal';
import { FleetMapView } from './components/FleetMapView';
import { CasesView } from './components/CasesView';
import { PredictiveEngineView } from './components/PredictiveEngineView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SecurityComplianceDrawer } from './components/SecurityComplianceDrawer';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { NewCaseModal } from './components/NewCaseModal';
import { CookieConsent } from './components/CookieConsent';
import { SupabaseModal } from './components/SupabaseModal';

import { 
  UserSession, 
  DeviceTelemetry, 
  ServiceCase, 
  ManualReviewRecord, 
  AccountTenant,
  ManualReviewInput,
  ServiceCaseCreateInput
} from './types/fleet';

import { 
  INITIAL_ACCOUNTS, 
  INITIAL_USERS, 
  INITIAL_DEVICES, 
  INITIAL_CASES, 
  INITIAL_MANUAL_REVIEWS 
} from './data/mockFleetData';

export default function App() {
  // Session & RBAC
  const [currentSession, setCurrentSession] = useState<UserSession>(INITIAL_USERS[0]);
  const [availableUsers] = useState<UserSession[]>(INITIAL_USERS);
  const [accounts, setAccounts] = useState<AccountTenant[]>(INITIAL_ACCOUNTS);

  // Core Data
  const [devices, setDevices] = useState<DeviceTelemetry[]>(INITIAL_DEVICES);
  const [cases, setCases] = useState<ServiceCase[]>(INITIAL_CASES);
  const [manualReviews, setManualReviews] = useState<ManualReviewRecord[]>(INITIAL_MANUAL_REVIEWS);

  // Views & Filters
  const [activeView, setActiveView] = useState<'dashboard' | 'map' | 'cases' | 'predictive'>('dashboard');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');

  // Modals & Drawers
  const [selectedDeviceForDrawer, setSelectedDeviceForDrawer] = useState<DeviceTelemetry | null>(null);
  const [selectedDeviceForDiagnosis, setSelectedDeviceForDiagnosis] = useState<DeviceTelemetry | null>(null);
  const [selectedDeviceForReview, setSelectedDeviceForReview] = useState<DeviceTelemetry | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isSecurityDrawerOpen, setIsSecurityDrawerOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial Fetch from backend (BFF)
  useEffect(() => {
    fetch('/api/devices')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDevices(data);
        }
      })
      .catch(() => {
        // Fallback to local state
      });

    fetch('/api/cases')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data)) setCases(data);
      })
      .catch(() => {});

    fetch('/api/manual-reviews')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data)) setManualReviews(data);
      })
      .catch(() => {});
  }, []);

  // Multi-Tenant RLS Filtered Devices
  const visibleDevices = React.useMemo(() => {
    // If client_owner, strictly enforce accountId isolation (Row-Level Security simulation)
    if (currentSession.role === 'client_owner' && currentSession.accountId) {
      return devices.filter((d) => d.accountId === currentSession.accountId);
    }
    // If admin or support with account filter
    if (selectedAccountFilter !== 'all') {
      return devices.filter((d) => d.accountId === selectedAccountFilter);
    }
    return devices;
  }, [devices, currentSession, selectedAccountFilter]);

  // Handle Manual Review Submit
  const handleManualReviewSubmit = async (input: ManualReviewInput) => {
    try {
      const res = await fetch('/api/manual-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error('Error al registrar revisión en backend');
      }

      const data = await res.json();
      if (data.review) {
        setManualReviews((prev) => [data.review, ...prev]);
      }

      // Update local device state
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === input.deviceId) {
            const updated = { ...d };
            updated.manualReviewsCount += 1;
            updated.manualReviewTotalTimeMinutes += input.timeSpentMinutes;
            if (input.isFalsePositive) {
              updated.isCoverageShadowFalsePositive = true;
              updated.shadowZoneName = input.falsePositiveReason;
              updated.failureProbability = Math.min(updated.failureProbability, 15);
            }
            return updated;
          }
          return d;
        })
      );

      // Refresh cases if solved
      if (input.markCaseSolved) {
        setCases((prev) =>
          prev.map((c) => {
            if (c.deviceId === input.deviceId) {
              return {
                ...c,
                status: 'solved',
                resolvedAt: new Date().toISOString(),
                resolutionNotes: input.caseNotes || input.findings,
              };
            }
            return c;
          })
        );
      }

      showToast(`Revisión técnica guardada exitosamente (${input.timeSpentMinutes} min registrados).`);
    } catch (err: any) {
      // Fallback local update
      const fallbackReview: ManualReviewRecord = {
        id: `rev-${Date.now()}`,
        deviceId: input.deviceId,
        deviceCode: input.deviceId,
        vehicleName: devices.find((d) => d.id === input.deviceId)?.vehicle.name || 'Unidad',
        technicianName: currentSession.name,
        timestamp: new Date().toISOString(),
        timeSpentMinutes: input.timeSpentMinutes,
        findings: input.findings,
        isFalsePositive: input.isFalsePositive,
        falsePositiveReason: input.falsePositiveReason,
        caseCreated: !input.isFalsePositive,
      };

      setManualReviews((prev) => [fallbackReview, ...prev]);
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === input.deviceId) {
            return {
              ...d,
              manualReviewsCount: d.manualReviewsCount + 1,
              manualReviewTotalTimeMinutes: d.manualReviewTotalTimeMinutes + input.timeSpentMinutes,
              isCoverageShadowFalsePositive: input.isFalsePositive,
            };
          }
          return d;
        })
      );
      showToast(`Revisión guardada (${input.timeSpentMinutes} min).`);
    }
  };

  // Handle Create New Case
  const handleCreateCase = async (input: ServiceCaseCreateInput) => {
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error('Error al registrar caso');
      const newCase = await res.json();
      setCases((prev) => [newCase, ...prev]);
      showToast(`Caso ${newCase.caseNumber} creado exitosamente.`);
    } catch {
      const fallbackCase: ServiceCase = {
        id: `case-${Date.now()}`,
        caseNumber: `CAS-2026-${Math.floor(100 + Math.random() * 900)}`,
        deviceId: input.deviceId,
        vehicleName: devices.find((d) => d.id === input.deviceId)?.vehicle.name || 'Unidad',
        accountName: devices.find((d) => d.id === input.deviceId)?.accountName || 'Cliente',
        title: input.title,
        description: input.description,
        status: 'in_progress',
        priority: input.priority,
        createdAt: new Date().toISOString(),
        assignedTechnician: input.assignedTechnician,
        timeSpentMinutes: 0,
      };
      setCases((prev) => [fallbackCase, ...prev]);
      showToast(`Caso ${fallbackCase.caseNumber} creado exitosamente.`);
    }
  };

  return (
    <div id="zonar-gps-monitor-root" className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      {/* Global Header */}
      <Header
        currentSession={currentSession}
        onSessionChange={(session) => {
          setCurrentSession(session);
          if (session.role === 'client_owner' && session.accountId) {
            setSelectedAccountFilter(session.accountId);
          } else {
            setSelectedAccountFilter('all');
          }
          showToast(`Sesión cambiada a: ${session.name} (${session.role})`);
        }}
        availableUsers={availableUsers}
        accounts={accounts}
        selectedAccountFilter={selectedAccountFilter}
        onAccountFilterChange={(accId) => setSelectedAccountFilter(accId)}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenSecurity={() => setIsSecurityDrawerOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Toast alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-[#006194] text-white text-xs font-mono rounded shadow-md flex items-center justify-between animate-fadeIn">
            <span>ℹ️ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Global KPI Summary */}
        <KPISummary
          devices={visibleDevices}
          cases={cases}
          manualReviews={manualReviews}
          onFilterByStatus={(status) => {
            setActiveView('dashboard');
            setTableStatusFilter(status);
          }}
        />

        {/* Dynamic View Sections */}
        {activeView === 'dashboard' && (
          <DeviceTable
            devices={visibleDevices}
            initialStatusFilter={tableStatusFilter}
            onSelectDevice={(device) => setSelectedDeviceForDrawer(device)}
            onRequestDiagnosis={(device) => setSelectedDeviceForDiagnosis(device)}
            onRequestManualReview={(device) => setSelectedDeviceForReview(device)}
          />
        )}

        {activeView === 'predictive' && (
          <PredictiveEngineView
            devices={visibleDevices}
            onSelectDevice={(device) => setSelectedDeviceForDrawer(device)}
            onRequestDiagnosis={(device) => setSelectedDeviceForDiagnosis(device)}
          />
        )}

        {activeView === 'map' && (
          <FleetMapView
            devices={visibleDevices}
            onSelectDevice={(device) => setSelectedDeviceForDrawer(device)}
            onRequestDiagnosis={(device) => setSelectedDeviceForDiagnosis(device)}
          />
        )}

        {activeView === 'cases' && (
          <CasesView
            cases={cases}
            manualReviews={manualReviews}
            devices={visibleDevices}
            onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
            onOpenManualReview={(device) => setSelectedDeviceForReview(device)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 px-6 text-xs text-[#64748b] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span>Zonar Systems GPS Monitor & Telematics Failure Projection</span>
          <span>•</span>
          <span>TimescaleDB RLS Partitioning</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:text-[#0f172a] underline decoration-dotted"
          >
            Aviso de Privacidad (FMCSA / CCPA)
          </button>
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="hover:text-[#0f172a] underline decoration-dotted text-[#006194] font-medium"
          >
            Base de Datos Supabase (SQL)
          </button>
          <button
            onClick={() => setIsSecurityDrawerOpen(true)}
            className="hover:text-[#0f172a] underline decoration-dotted"
          >
            Auditoría de Seguridad
          </button>
          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="hover:text-[#0f172a] underline decoration-dotted"
          >
            Diagramas Arquitectura
          </button>
        </div>
      </footer>

      {/* Slide-over Detail Drawer */}
      <DeviceDetailDrawer
        device={selectedDeviceForDrawer}
        onClose={() => setSelectedDeviceForDrawer(null)}
        onRequestDiagnosis={(d) => {
          setSelectedDeviceForDiagnosis(d);
        }}
        onRequestManualReview={(d) => {
          setSelectedDeviceForReview(d);
        }}
      />

      {/* AI Diagnosis Modal (Gemini API with Fallback) */}
      <AIDiagnosisModal
        device={selectedDeviceForDiagnosis}
        onClose={() => setSelectedDeviceForDiagnosis(null)}
        onStartManualReview={(d) => {
          setSelectedDeviceForReview(d);
        }}
      />

      {/* Manual Review Modal (Timer + Form) */}
      <ManualReviewModal
        device={selectedDeviceForReview}
        onClose={() => setSelectedDeviceForReview(null)}
        onSubmitReview={handleManualReviewSubmit}
      />

      {/* New Service Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        devices={visibleDevices}
        onCreateCase={handleCreateCase}
      />

      {/* Architecture & Portfolio Diagrams Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Security & RLS Compliance Drawer */}
      <SecurityComplianceDrawer
        isOpen={isSecurityDrawerOpen}
        onClose={() => setIsSecurityDrawerOpen(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Supabase Database & SQL Scripts Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
