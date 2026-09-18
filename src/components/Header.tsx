import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  FileText, 
  Radio, 
  Building2, 
  UserCheck, 
  MapPin, 
  ListChecks, 
  Cpu,
  Database
} from 'lucide-react';
import { UserSession, AccountTenant } from '../types/fleet';

interface HeaderProps {
  currentSession: UserSession;
  onSessionChange: (session: UserSession) => void;
  availableUsers: UserSession[];
  accounts: AccountTenant[];
  selectedAccountFilter: string;
  onAccountFilterChange: (accId: string) => void;
  activeView: 'dashboard' | 'map' | 'cases' | 'predictive';
  onViewChange: (view: 'dashboard' | 'map' | 'cases' | 'predictive') => void;
  onOpenArchitecture: () => void;
  onOpenSecurity: () => void;
  onOpenPrivacy: () => void;
  onOpenSupabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  onSessionChange,
  availableUsers,
  accounts,
  selectedAccountFilter,
  onAccountFilterChange,
  activeView,
  onViewChange,
  onOpenArchitecture,
  onOpenSecurity,
  onOpenPrivacy,
  onOpenSupabase,
}) => {
  return (
    <header id="zonar-app-header" className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      {/* Top Telemetric Notice Bar */}
      <div className="bg-[#0b1c30] text-white px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center space-x-1.5 text-[#38bdf8]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="font-semibold tracking-wide">ZONAR OMI API INGESTION: ACTIVE</span>
          </span>
          <span className="text-[#94a3b8] hidden sm:inline">|</span>
          <span className="text-[#cbd5e1] hidden sm:inline">
            TimescaleDB Hypertable: <span className="text-[#38bdf8]">Append-Only (RLS Enabled)</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSupabase}
            className="text-xs hover:text-[#3ecf8e] flex items-center space-x-1 text-[#3ecf8e] font-semibold transition-colors bg-[#3ecf8e]/10 px-2 py-0.5 rounded border border-[#3ecf8e]/30"
            title="Estructura de base de datos Supabase, tablas y scripts SQL"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase DB & Scripts</span>
          </button>
          <button
            onClick={onOpenSecurity}
            className="text-xs hover:text-[#38bdf8] flex items-center space-x-1 text-[#cbd5e1] transition-colors"
            title="Ver auditoría de seguridad y controles OWASP"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="hidden md:inline">OWASP & RLS Audit</span>
          </button>
          <button
            onClick={onOpenArchitecture}
            className="text-xs hover:text-[#38bdf8] flex items-center space-x-1 text-[#cbd5e1] transition-colors"
            title="Ver diagramas de arquitectura del sistema"
          >
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Arquitectura Zonar</span>
          </button>
          <button
            onClick={onOpenPrivacy}
            className="text-xs hover:text-[#38bdf8] flex items-center space-x-1 text-[#94a3b8] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">FMCSA / Privacy</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-[#006194] flex items-center justify-center text-white font-display font-bold text-xl shadow-sm">
            Z
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-display font-bold text-[#0f172a] tracking-tight leading-none">
                Zonar Systems
              </h1>
              <span className="bg-[#eff4ff] text-[#006194] text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#cce5ff] uppercase">
                GPS Monitor v1.0
              </span>
            </div>
            <p className="text-xs text-[#64748b] font-sans mt-0.5">
              Sistema Proactivo de Monitoreo y Proyección de Fallos Telemáticos
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center space-x-1 bg-[#f1f5f9] p-1 rounded-md border border-[#e2e8f0]">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-all flex items-center space-x-1.5 ${
              activeView === 'dashboard'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#006194]" />
            <span>Tablero Flota</span>
          </button>
          <button
            onClick={() => onViewChange('predictive')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-all flex items-center space-x-1.5 ${
              activeView === 'predictive'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Motor Predictivo ML</span>
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-all flex items-center space-x-1.5 ${
              activeView === 'map'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#00855b]" />
            <span>Mapa Satelital</span>
          </button>
          <button
            onClick={() => onViewChange('cases')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded transition-all flex items-center space-x-1.5 ${
              activeView === 'cases'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Casos & Revisiones</span>
          </button>
        </nav>

        {/* Multi-Tenant & RBAC Switchers */}
        <div className="flex items-center space-x-2">
          {/* Tenant selector if admin or support */}
          {currentSession.role !== 'client_owner' ? (
            <div className="relative">
              <label htmlFor="tenant-select" className="sr-only">Filtrar por Cuenta Cliente</label>
              <div className="flex items-center space-x-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded px-2.5 py-1 text-xs">
                <Building2 className="w-3.5 h-3.5 text-[#64748b]" />
                <select
                  id="tenant-select"
                  value={selectedAccountFilter}
                  onChange={(e) => onAccountFilterChange(e.target.value)}
                  className="bg-transparent border-none text-xs text-[#0f172a] focus:ring-0 focus:outline-hidden font-sans cursor-pointer"
                >
                  <option value="all">Todas las Cuentas (1.000+)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.contractTier.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-[#eff4ff] border border-[#cce5ff] rounded px-2.5 py-1 text-xs text-[#006194]">
              <Building2 className="w-3.5 h-3.5" />
              <span className="font-semibold">{currentSession.accountName}</span>
              <span className="text-[10px] bg-[#006194] text-white px-1.5 py-0.2 rounded font-mono">
                RLS Activo
              </span>
            </div>
          )}

          {/* Role switcher simulation */}
          <div className="relative">
            <label htmlFor="role-select" className="sr-only">Cambiar Rol RBAC</label>
            <div className="flex items-center space-x-1.5 bg-[#ffffff] border border-[#006194] rounded px-2.5 py-1 text-xs shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-[#006194]" />
              <select
                id="role-select"
                value={currentSession.id}
                onChange={(e) => {
                  const found = availableUsers.find((u) => u.id === e.target.value);
                  if (found) onSessionChange(found);
                }}
                className="bg-transparent border-none text-xs text-[#0f172a] font-medium focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role === 'admin_zonar' ? 'Admin' : user.role === 'support_zonar' ? 'Soporte' : 'Cliente'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
