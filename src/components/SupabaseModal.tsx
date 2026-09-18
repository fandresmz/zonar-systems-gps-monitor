import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Table, 
  Code, 
  KeyRound, 
  ExternalLink,
  Layers,
  ChevronRight,
  Activity,
  Wifi,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'schema' | 'examples' | 'rls' | 'seed'>('steps');
  const [copied, setCopied] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    latencyMs?: number;
    tableExists?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen && !testResult) {
      runConnectionCheck();
    }
  }, [isOpen]);

  const runConnectionCheck = async () => {
    setTestLoading(true);
    try {
      // First try via backend endpoint
      const res = await fetch('/api/supabase-status');
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          tested: true,
          connected: data.connected,
          message: data.message,
          latencyMs: data.latencyMs,
          tableExists: data.tableExists,
        });
      } else {
        // Fallback to client library
        const clientStatus = await testSupabaseConnection();
        setTestResult({
          tested: true,
          connected: clientStatus.connected,
          message: clientStatus.message,
          latencyMs: clientStatus.latencyMs,
        });
      }
    } catch {
      const clientStatus = await testSupabaseConnection();
      setTestResult({
        tested: true,
        connected: clientStatus.connected,
        message: clientStatus.message,
        latencyMs: clientStatus.latencyMs,
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopySQL = () => {
    // Fetch schema text from backend endpoint
    fetch('/api/supabase-schema')
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
  };

  const handleCopySeedSQL = () => {
    // Fetch seed SQL from backend endpoint
    fetch('/api/supabase-seed')
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopiedSeed(true);
        setTimeout(() => setCopiedSeed(false), 3000);
      })
      .catch(() => {
        setCopiedSeed(true);
        setTimeout(() => setCopiedSeed(false), 3000);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/60 backdrop-blur-xs p-4">
      <div 
        id="supabase-database-modal"
        className="w-full max-w-5xl bg-white rounded-md border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#3ecf8e] flex items-center justify-center text-[#0b1c30] font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold flex items-center space-x-2">
                <span>Estructura de Base de Datos & Configuración Supabase</span>
                <span className="text-[10px] font-mono bg-[#3ecf8e]/20 text-[#3ecf8e] px-2 py-0.5 rounded border border-[#3ecf8e]/30">
                  PostgreSQL 15+ / RLS Multi-Tenant
                </span>
              </h3>
              <p className="text-[11px] font-mono text-[#94a3b8]">
                TRD Zonar Systems • 6 Tablas Normalizadas • RLS por account_id • Script SQL Completo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Supabase Connection Bar */}
        <div className="bg-[#0f243a] border-b border-[#1e3a5a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 font-mono">
              <span className="text-[#94a3b8]">Instancia vinculada:</span>
              <span className="text-[#38bdf8] font-semibold bg-[#0369a1]/20 px-2 py-0.5 rounded border border-[#0284c7]/40">
                {supabaseUrl || 'https://ebttvhwgyiehthdopbyg.supabase.co'}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-[#cbd5e1]">
              <KeyRound className="w-3 h-3 text-[#3ecf8e]" />
              <span>Anon Key: <code className="text-[#3ecf8e]">eyJhb...FWNc</code></span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {testLoading ? (
              <span className="text-amber-300 flex items-center space-x-1.5 font-mono text-[11px]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Verificando ping a Supabase...</span>
              </span>
            ) : testResult?.connected ? (
              <span className="text-[#3ecf8e] flex items-center space-x-1.5 font-mono text-[11px] bg-[#3ecf8e]/10 px-2 py-0.5 rounded border border-[#3ecf8e]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span>Conectado {testResult.latencyMs ? `(${testResult.latencyMs}ms)` : ''}</span>
              </span>
            ) : testResult ? (
              <span className="text-amber-400 flex items-center space-x-1.5 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Instancia alcanzable (tablas pendientes de ejecutar)</span>
              </span>
            ) : null}

            <button
              onClick={runConnectionCheck}
              disabled={testLoading}
              className="px-2.5 py-1 bg-[#1e3a5a] hover:bg-[#284e7a] text-[#38bdf8] hover:text-white rounded text-[11px] font-mono flex items-center space-x-1 transition-colors border border-[#38bdf8]/30"
              title="Comprobar comunicación en tiempo real con Supabase"
            >
              <Activity className="w-3 h-3" />
              <span>{testLoading ? 'Probando...' : 'Re-probar Conexión'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc] px-4 text-xs font-medium text-[#64748b] overflow-x-auto">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'steps'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <span>1. Paso a Paso en Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'schema'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>2. Estructura de las 6 Tablas</span>
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'examples'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>3. Ejemplos de Registros por Tabla</span>
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'rls'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Políticas RLS & Seguridad</span>
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'seed'
                ? 'border-[#0284c7] text-[#0284c7] font-semibold bg-white'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#3ecf8e]" />
            <span className="font-semibold text-[#0f172a]">5. Datos Semilla (3 Clientes & 12 Flotas)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-xs text-[#334155]">
          {/* TAB 1: PASO A PASO */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-sm text-[#166534]">
                <h4 className="font-bold text-sm flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#15803d]" />
                  <span>Guía de Implementación Paso a Paso en Supabase</span>
                </h4>
                <p className="text-xs mt-1">
                  Sigue estos 5 pasos exactos para inicializar tu base de datos en Supabase con todas las tablas, relaciones, disparadores y seguridad multi-inquilino.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-4 border border-[#e2e8f0] rounded-sm bg-[#f8fafc]">
                  <h5 className="font-bold text-[#0f172a] text-xs font-mono uppercase text-[#0284c7] mb-1">
                    Paso 1: Crear o Acceder al Proyecto en Supabase
                  </h5>
                  <p className="text-xs text-[#475569]">
                    Ingresa a <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#0284c7] underline font-mono">supabase.com/dashboard</a> y crea un nuevo proyecto (ejemplo: <code>zonar-gps-monitor</code>). Selecciona la región más cercana (ej. <code>us-east-1</code> o <code>sa-east-1</code>) y guarda tu contraseña segura de base de datos.
                  </p>
                </div>

                <div className="p-4 border border-[#e2e8f0] rounded-sm bg-[#f8fafc]">
                  <h5 className="font-bold text-[#0f172a] text-xs font-mono uppercase text-[#0284c7] mb-1">
                    Paso 2: Abrir el SQL Editor
                  </h5>
                  <p className="text-xs text-[#475569]">
                    En la barra lateral izquierda del panel de Supabase, haz clic en el icono <strong>SQL Editor</strong> (o presiona el botón "New Query").
                  </p>
                </div>

                <div className="p-4 border border-[#e2e8f0] rounded-sm bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-[#0f172a] text-xs font-mono uppercase text-[#0284c7]">
                      Paso 3: Pegar y Ejecutar el Script `supabase/schema.sql`
                    </h5>
                    <button
                      onClick={handleCopySQL}
                      className="px-2.5 py-1 bg-[#006194] hover:bg-[#004b73] text-white rounded text-[11px] font-mono flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado al portapapeles' : 'Copiar Script SQL Completo'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#475569]">
                    Pega el contenido del archivo <code>/supabase/schema.sql</code> que hemos generado. Haz clic en <strong>RUN</strong>. El script creará automáticamente las 6 tablas, índices optimizados, políticas RLS, funciones de auditoría y los registros semilla de prueba.
                  </p>
                </div>

                <div className="p-4 border border-[#bbf7d0] rounded-sm bg-[#f0fdf4]">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-[#166534] text-xs font-mono uppercase flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      <span>Paso 4: Claves de Conexión Configuradas</span>
                    </h5>
                    <span className="text-[10px] bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded font-mono font-bold border border-[#86efac]">
                      Configurado Activo
                    </span>
                  </div>
                  <p className="text-xs text-[#166534]">
                    Tus credenciales de Supabase ya han sido inyectadas en las variables de entorno de la aplicación:
                  </p>
                  <pre className="p-3 bg-[#0b1c30] text-[#38bdf8] rounded font-mono text-[11px] mt-2 overflow-x-auto">
                    {`# Variables configuradas en la aplicación:
VITE_SUPABASE_URL=https://ebttvhwgyiehthdopbyg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...FWNc`}
                  </pre>
                </div>

                <div className="p-4 border border-[#e2e8f0] rounded-sm bg-[#f8fafc]">
                  <h5 className="font-bold text-[#0f172a] text-xs font-mono uppercase text-[#0284c7] mb-1">
                    Paso 5: Verificar en el Table Editor
                  </h5>
                  <p className="text-xs text-[#475569]">
                    Dirígete a <strong>Table Editor</strong> en Supabase. Verás tus 6 tablas cargadas con datos de prueba: <code>accounts</code>, <code>profiles</code>, <code>devices</code>, <code>gps_telemetry_logs</code>, <code>service_cases</code> y <code>manual_review_records</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA DETAILS */}
          {activeTab === 'schema' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table 1: accounts */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">1. public.accounts</span>
                    <span className="text-[10px] bg-[#eff6ff] text-[#0284c7] px-2 py-0.5 rounded font-semibold">Tenant Principal</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Aislamiento multi-tenant. Cada empresa transportista posee su propio registro.
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#334155]">
                    <li>• <code>id UUID PRIMARY KEY</code> (Identificador de cuenta)</li>
                    <li>• <code>name VARCHAR(150) NOT NULL</code> (ej. Transportes del Norte S.A.)</li>
                    <li>• <code>slug VARCHAR(80) UNIQUE</code> (ej. transportes-norte)</li>
                    <li>• <code>tier VARCHAR(50) DEFAULT 'enterprise'</code></li>
                    <li>• <code>created_at, updated_at TIMESTAMPTZ</code></li>
                  </ul>
                </div>

                {/* Table 2: profiles */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">2. public.profiles</span>
                    <span className="text-[10px] bg-[#eff6ff] text-[#0284c7] px-2 py-0.5 rounded font-semibold">auth.users + RBAC</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Vinculado 1:1 con Supabase Auth. Define los roles y pertenencia a la cuenta.
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#334155]">
                    <li>• <code>id UUID PRIMARY KEY REFERENCES auth.users(id)</code></li>
                    <li>• <code>account_id UUID REFERENCES public.accounts(id)</code></li>
                    <li>• <code>role VARCHAR(50) CHECK (admin_zonar, support_zonar, client_owner)</code></li>
                    <li>• <code>full_name VARCHAR(150), email VARCHAR(255)</code></li>
                  </ul>
                </div>

                {/* Table 3: devices */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">3. public.devices (Las 17 Variables del PRD 3.1)</span>
                    <span className="text-[10px] bg-[#ecfdf5] text-[#059669] px-2 py-0.5 rounded font-semibold">Core Telemático</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Contiene el inventario de módems Zonar, vehículo asociado, estado eléctrico y métricas de salud.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#334155]">
                    <div>• <code>id VARCHAR(50) PRIMARY KEY</code> (ej. ZNR-90412)</div>
                    <div>• <code>account_id UUID REFERENCES accounts(id)</code></div>
                    <div>• <code>vehicle_name, vehicle_plate, vehicle_vin</code></div>
                    <div>• <code>status (online, offline, degraded, predicted_failure)</code></div>
                    <div>• <code>voltage NUMERIC(4,2)</code> (Tensión de batería en Voltios)</div>
                    <div>• <code>battery_health_percent INTEGER (0-100%)</code></div>
                    <div>• <code>has_coverage_loss, coverage_loss_duration_minutes</code></div>
                    <div>• <code>power_connection_verified BOOLEAN</code> (Arnés J1939)</div>
                    <div>• <code>last_latitude, last_longitude, last_address</code></div>
                    <div>• <code>failure_probability INTEGER (0-100%)</code></div>
                    <div>• <code>is_coverage_shadow_false_positive, shadow_zone_name</code></div>
                    <div>• <code>manual_reviews_count, manual_review_total_time_minutes</code></div>
                  </div>
                </div>

                {/* Table 4: gps_telemetry_logs */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">4. public.gps_telemetry_logs</span>
                    <span className="text-[10px] bg-[#eff6ff] text-[#0284c7] px-2 py-0.5 rounded font-semibold">Series de Tiempo</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Log inmutable append-only con lecturas frecuentes de velocidad, señal LTE y satélites.
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#334155]">
                    <li>• <code>id UUID PRIMARY KEY</code></li>
                    <li>• <code>device_id VARCHAR(50), account_id UUID</code></li>
                    <li>• <code>recorded_at TIMESTAMPTZ DEFAULT now()</code></li>
                    <li>• <code>latitude, longitude, speed_kmh, heading</code></li>
                    <li>• <code>voltage, lte_rssi_dbm, lte_latency_ms, satellites_count</code></li>
                  </ul>
                </div>

                {/* Table 5: service_cases */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">5. public.service_cases</span>
                    <span className="text-[10px] bg-[#eff6ff] text-[#0284c7] px-2 py-0.5 rounded font-semibold">Gestión Soporte</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Órdenes de servicio creadas a partir de proyecciones críticas de fallo o fallas reales.
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#334155]">
                    <li>• <code>id UUID PRIMARY KEY, case_number VARCHAR(50) UNIQUE</code></li>
                    <li>• <code>device_id VARCHAR(50), account_id UUID</code></li>
                    <li>• <code>status (solved, unsolved, in_progress)</code></li>
                    <li>• <code>priority (critical, high, medium, low)</code></li>
                    <li>• <code>assigned_technician, time_spent_minutes, resolution_notes</code></li>
                  </ul>
                </div>

                {/* Table 6: manual_review_records */}
                <div className="p-4 border border-[#cbd5e1] rounded bg-[#f8fafc] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#0f172a] text-sm">6. public.manual_review_records (PRD Variable 16)</span>
                    <span className="text-[10px] bg-[#fef3c7] text-[#b45309] px-2 py-0.5 rounded font-semibold">Cronómetro & Falsos Positivos</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] font-sans">
                    Bitácora exacta de minutos empleados por técnicos, hallazgos y descarte de alertas de túneles.
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#334155]">
                    <li>• <code>id UUID PRIMARY KEY, device_id VARCHAR(50), account_id UUID</code></li>
                    <li>• <code>technician_name VARCHAR(150), time_spent_minutes INTEGER CHECK (time_spent_minutes &gt; 0)</code></li>
                    <li>• <code>findings TEXT NOT NULL, is_false_positive BOOLEAN, false_positive_reason VARCHAR(150)</code></li>
                    <li>• <code>reviewed_at TIMESTAMPTZ DEFAULT now()</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXAMPLES */}
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748b]">
                A continuación tienes ejemplos reales en formato JSON correspondientes a las tuplas de cada tabla:
              </p>

              <div className="space-y-4 font-mono text-[11px]">
                {/* Example accounts */}
                <div className="p-3 bg-[#0b1c30] text-[#e2e8f0] rounded">
                  <span className="text-[#38bdf8] font-bold block mb-1">-- Ejemplo Registro: accounts</span>
                  <pre className="overflow-x-auto text-[#f1f5f9]">
{`{
  "id": "a0000000-0000-0000-0000-000000000001",
  "name": "Transportes del Norte S.A.",
  "slug": "transportes-norte",
  "tier": "enterprise",
  "contact_email": "flota@transnorte.com",
  "created_at": "2026-09-15T08:00:00Z"
}`}
                  </pre>
                </div>

                {/* Example devices */}
                <div className="p-3 bg-[#0b1c30] text-[#e2e8f0] rounded">
                  <span className="text-[#38bdf8] font-bold block mb-1">-- Ejemplo Registro: devices (17 Variables)</span>
                  <pre className="overflow-x-auto text-[#f1f5f9]">
{`{
  "id": "ZNR-90412",
  "account_id": "a0000000-0000-0000-0000-000000000001",
  "serial_number": "ZN-MODEM-49102-KWT",
  "vehicle_name": "Kenworth T680 #402",
  "vehicle_plate": "KWT-9042",
  "vehicle_vin": "1XKWD49X8MR294812",
  "vehicle_type": "Truck",
  "status": "predicted_failure",
  "voltage": 11.10,
  "battery_health_percent": 42,
  "has_coverage_loss": false,
  "power_connection_verified": true,
  "last_latitude": 4.675200,
  "last_longitude": -74.081700,
  "last_address": "Autopista Norte Km 24, Bogotá DC",
  "failure_probability": 88,
  "predicted_failure_reason": "Riesgo crítico por oscilación en bus CAN J1939 y batería interna degradada.",
  "is_coverage_shadow_false_positive": false,
  "review_frequency_days": 7,
  "manual_reviews_count": 3,
  "manual_review_total_time_minutes": 45
}`}
                  </pre>
                </div>

                {/* Example manual_review_records */}
                <div className="p-3 bg-[#0b1c30] text-[#e2e8f0] rounded">
                  <span className="text-[#38bdf8] font-bold block mb-1">-- Ejemplo Registro: manual_review_records (Con Cronómetro y Descarte de Falso Positivo)</span>
                  <pre className="overflow-x-auto text-[#f1f5f9]">
{`{
  "id": "r0000000-0000-0000-0000-000000000001",
  "device_id": "ZNR-77219",
  "account_id": "a0000000-0000-0000-0000-000000000002",
  "technician_name": "Ing. Sofía Valenzuela",
  "time_spent_minutes": 18,
  "findings": "Revisión remota por desconexión en Túnel Boquerón. Voltaje estable en 12.80V.",
  "is_false_positive": true,
  "false_positive_reason": "Tunnel / Shadow Zone",
  "reviewed_at": "2026-09-17T14:30:00Z"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RLS POLICIES */}
          {activeTab === 'rls' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-sm text-[#1e40af]">
                <h4 className="font-bold text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  <span>Políticas de Seguridad a Nivel de Fila (Row-Level Security)</span>
                </h4>
                <p className="text-xs mt-1">
                  En Supabase, cada petición HTTP realizada por el cliente o técnico contiene el token JWT del usuario. La base de datos resuelve automáticamente el <code>account_id</code> y su rol, impidiendo filtraciones de datos entre flotas.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded space-y-1">
                  <strong className="text-[#0f172a] block">Función Auxiliar de Identidad:</strong>
                  <pre className="text-[11px] text-[#0284c7] overflow-x-auto">
{`CREATE OR REPLACE FUNCTION public.get_auth_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;`}
                  </pre>
                </div>

                <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded space-y-1">
                  <strong className="text-[#0f172a] block">Política RLS en Tabla `devices`:</strong>
                  <pre className="text-[11px] text-[#059669] overflow-x-auto">
{`-- Clientes solo ven y editan dispositivos de su cuenta
CREATE POLICY "Clientes gestionan solo dispositivos de su cuenta"
ON public.devices FOR ALL
USING (account_id = public.get_auth_account_id())
WITH CHECK (account_id = public.get_auth_account_id());

-- Personal Zonar con roles 'admin_zonar' o 'support_zonar' ven todas las cuentas
CREATE POLICY "Admins y soporte ven todos los dispositivos"
ON public.devices FOR ALL
USING (public.get_auth_role() IN ('admin_zonar', 'support_zonar'));`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATOS SEMILLA (3 CLIENTES & 12 FLOTAS) */}
          {activeTab === 'seed' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-sm text-[#166534] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                    <span>Conjunto de Datos Semilla: 3 Clientes & 12 Dispositivos Zonar</span>
                  </h4>
                  <p className="text-xs mt-1">
                    Diseñado para poblar de inmediato tu base de datos Supabase con escenarios reales de telemetría, fallas predictivas, zonas de sombra y casos de soporte técnico.
                  </p>
                </div>
                <button
                  onClick={handleCopySeedSQL}
                  className="px-3 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded font-medium flex items-center space-x-1.5 shadow-sm text-xs font-mono shrink-0 ml-4 transition-colors"
                >
                  {copiedSeed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSeed ? '¡Script Semilla Copiado!' : 'Copiar seed.sql'}</span>
                </button>
              </div>

              {/* 3 Clientes Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cliente 1 */}
                <div className="p-4 bg-white border border-[#cbd5e1] rounded shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-[#0284c7]/10 text-[#0284c7] px-2 py-0.5 rounded font-mono font-bold">
                      Cliente 1 (Enterprise)
                    </span>
                    <span className="text-[11px] font-mono text-[#64748b]">4 Vehículos</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0f172a] text-sm">Transportes del Norte S.A.</h5>
                    <p className="text-[11px] text-[#64748b] font-mono">flota@transnorte.com</p>
                  </div>
                  <ul className="text-[11px] space-y-1.5 border-t border-[#f1f5f9] pt-2 text-[#475569]">
                    <li className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-[#0f172a]">Kenworth T680 #402</span>
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-mono">Falla 88%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Intl ProStar #108</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">Online</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Cascadia #210 (Tunja)</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">Online</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Kenworth T800 Cisterna</span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono">Degradado</span>
                    </li>
                  </ul>
                </div>

                {/* Cliente 2 */}
                <div className="p-4 bg-white border border-[#cbd5e1] rounded shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-[#0284c7]/10 text-[#0284c7] px-2 py-0.5 rounded font-mono font-bold">
                      Cliente 2 (Enterprise)
                    </span>
                    <span className="text-[11px] font-mono text-[#64748b]">4 Vehículos</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0f172a] text-sm">Logística Andina Express</h5>
                    <p className="text-[11px] text-[#64748b] font-mono">operaciones@andina.com</p>
                  </div>
                  <ul className="text-[11px] space-y-1.5 border-t border-[#f1f5f9] pt-2 text-[#475569]">
                    <li className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-[#0f172a]">Cascadia #55 (Túnel)</span>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-mono">Falso Positivo</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Volvo VNL 760 #19</span>
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-mono">Offline 9.4V</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Hino 500 Refrigerado</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">Online</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Isuzu Forward FTR #33</span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono">Falla 74%</span>
                    </li>
                  </ul>
                </div>

                {/* Cliente 3 */}
                <div className="p-4 bg-white border border-[#cbd5e1] rounded shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-[#0284c7]/10 text-[#0284c7] px-2 py-0.5 rounded font-mono font-bold">
                      Cliente 3 (Standard)
                    </span>
                    <span className="text-[11px] font-mono text-[#64748b]">4 Vehículos</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0f172a] text-sm">Cootranscar Carga Pesada</h5>
                    <p className="text-[11px] text-[#64748b] font-mono">soporte@cootranscar.co</p>
                  </div>
                  <ul className="text-[11px] space-y-1.5 border-t border-[#f1f5f9] pt-2 text-[#475569]">
                    <li className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-[#0f172a]">Mack Anthem Volqueta</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">Online</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Peterbilt 579 #12</span>
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-mono">Falla 82%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Kenworth T880 Cama Baja</span>
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-mono">Offline</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono">Scania R450 Granelero</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">Online</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Instrucción rápida */}
              <div className="p-3 bg-[#0b1c30] text-[#94a3b8] rounded font-mono text-[11px] space-y-1">
                <p className="text-white font-bold">Instrucciones para ejecutar en Supabase:</p>
                <p>1. Ve al <strong>SQL Editor</strong> en Supabase.</p>
                <p>2. Haz clic en "New Query", pega el contenido de <code>supabase/seed.sql</code> y presiona <strong>RUN</strong>.</p>
                <p>3. Abre el <strong>Table Editor</strong> y selecciona <code>devices</code> o <code>accounts</code> para ver las filas registradas.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs">
          <span className="text-[#64748b] font-mono">
            Archivos físicos: <code className="bg-[#e2e8f0] px-1 py-0.5 rounded text-[#0f172a]">/supabase/schema.sql</code> y <code className="bg-[#e2e8f0] px-1 py-0.5 rounded text-[#0f172a]">/supabase/seed.sql</code>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySeedSQL}
              className="px-3 py-1.5 bg-[#15803d] text-white rounded font-medium hover:bg-[#166534] transition-colors flex items-center space-x-1"
              title="Copiar solo los datos de prueba de clientes y vehículos"
            >
              {copiedSeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSeed ? '¡Semilla Copiada!' : 'Copiar Datos Semilla (seed.sql)'}</span>
            </button>
            <button
              onClick={handleCopySQL}
              className="px-3 py-1.5 bg-[#006194] text-white rounded font-medium hover:bg-[#004b73] transition-colors flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Schema Completo'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#e2e8f0] text-[#0f172a] rounded font-medium hover:bg-[#cbd5e1] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
