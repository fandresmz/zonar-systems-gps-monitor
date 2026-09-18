-- ==============================================================================
-- ZONAR SYSTEMS GPS MONITOR - SUPABASE DATABASE MIGRATION SCRIPT
-- Compatible con: PostgreSQL 15+ / Supabase con RLS (Row-Level Security)
-- Basado en: TRD 1.1, PRD 3.1 (17 Variables Telemáticas) & Diagrama de Arquitectura 4
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- 2.1 TABLA: accounts (Cuentas Cliente / Multi-Tenant Isolation)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'enterprise',
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.accounts IS 'Organizaciones / Cuentas de clientes con aislamiento estricto RLS.';

-- 2.2 TABLA: profiles (Usuarios vinculados a auth.users con RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin_zonar', 'support_zonar', 'client_owner')),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Perfil de usuario extendido desde auth.users con definición de roles y cuenta asignada.';

-- 2.3 TABLA: devices (Dispositivos GPS & Unidades de Flota - 17 Variables PRD 3.1)
CREATE TABLE IF NOT EXISTS public.devices (
    id VARCHAR(50) PRIMARY KEY, -- Código Zonar (ej. 'ZNR-90412')
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    vehicle_name VARCHAR(120) NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    vehicle_vin VARCHAR(50),
    vehicle_type VARCHAR(50) DEFAULT 'Truck' CHECK (vehicle_type IN ('Truck', 'Van', 'Bus', 'Trailer', 'Heavy Equipment')),
    firmware_version VARCHAR(50) DEFAULT 'v4.18.2',
    
    -- Variables telemáticas operativas
    status VARCHAR(50) NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'degraded', 'predicted_failure')),
    voltage NUMERIC(4,2) NOT NULL DEFAULT 12.60,
    battery_health_percent INTEGER NOT NULL DEFAULT 100 CHECK (battery_health_percent BETWEEN 0 AND 100),
    has_coverage_loss BOOLEAN DEFAULT FALSE,
    coverage_loss_duration_minutes INTEGER DEFAULT 0,
    power_connection_verified BOOLEAN DEFAULT TRUE,
    
    -- Ubicación y odometría
    last_latitude NUMERIC(9,6) NOT NULL,
    last_longitude NUMERIC(9,6) NOT NULL,
    last_address TEXT,
    last_speed_kmh NUMERIC(5,2) DEFAULT 0,
    last_heading INTEGER DEFAULT 0,
    last_telemetry_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Motor Predictivo & Proyección de Fallos (PRD 5.1)
    failure_probability INTEGER DEFAULT 0 CHECK (failure_probability BETWEEN 0 AND 100),
    predicted_failure_reason TEXT,
    estimated_time_to_total_failure_hours INTEGER,
    is_coverage_shadow_false_positive BOOLEAN DEFAULT FALSE,
    shadow_zone_name VARCHAR(150),
    
    -- Métricas de Gestión y Soporte (Variables 14, 15, 16)
    review_frequency_days INTEGER DEFAULT 15,
    manual_reviews_count INTEGER DEFAULT 0,
    manual_review_total_time_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.devices IS 'Dispositivos telemáticos GPS y vehículos con las 17 variables obligatorias del PRD 3.1.';

-- 2.4 TABLA: gps_telemetry_logs (Serie Temporal / Historial de Ingesta Append-Only)
CREATE TABLE IF NOT EXISTS public.gps_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(50) NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    speed_kmh NUMERIC(5,2) DEFAULT 0,
    heading INTEGER DEFAULT 0,
    voltage NUMERIC(4,2) NOT NULL,
    battery_health_percent INTEGER,
    lte_rssi_dbm INTEGER,
    lte_latency_ms INTEGER,
    satellites_count INTEGER,
    connectivity_state VARCHAR(30) DEFAULT 'connected',
    is_shadow_zone BOOLEAN DEFAULT FALSE,
    raw_payload JSONB
);

COMMENT ON TABLE public.gps_telemetry_logs IS 'Log append-only inmutable de telemetría de alta frecuencia para análisis temporal.';

-- 2.5 TABLA: service_cases (Casos de Soporte y Órdenes de Servicio)
CREATE TABLE IF NOT EXISTS public.service_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    device_id VARCHAR(50) NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('solved', 'unsolved', 'in_progress')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_technician VARCHAR(150) NOT NULL,
    time_spent_minutes INTEGER DEFAULT 0,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.service_cases IS 'Casos de soporte técnico derivados de fallos o inspecciones preventivas.';

-- 2.6 TABLA: manual_review_records (Bitácora de Revisiones Manuales - PRD 3.1 Var 16)
CREATE TABLE IF NOT EXISTS public.manual_review_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(50) NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.service_cases(id) ON DELETE SET NULL,
    technician_name VARCHAR(150) NOT NULL,
    time_spent_minutes INTEGER NOT NULL CHECK (time_spent_minutes > 0),
    findings TEXT NOT NULL,
    is_false_positive BOOLEAN DEFAULT FALSE,
    false_positive_reason VARCHAR(150),
    reviewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.manual_review_records IS 'Registro auditable de tiempo empleado en minutos por técnicos en revisiones manuales.';

-- ==============================================================================
-- 3. ÍNDICES DE RENDIMIENTO (Performance Tuning)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_devices_account_id ON public.devices(account_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_failure_prob ON public.devices(failure_probability);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON public.gps_telemetry_logs(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_account_id ON public.gps_telemetry_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_cases_device_id ON public.service_cases(device_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.service_cases(status);
CREATE INDEX IF NOT EXISTS idx_reviews_device_id ON public.manual_review_records(device_id);

-- ==============================================================================
-- 4. SEGURIDAD: ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==============================================================================

-- 4.1 Habilitar RLS en todas las tablas
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_review_records ENABLE ROW LEVEL SECURITY;

-- 4.2 Funciones auxiliares de seguridad
CREATE OR REPLACE FUNCTION public.get_auth_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4.3 POLÍTICAS RLS: accounts
CREATE POLICY "SuperAdmin y Soporte pueden ver todas las cuentas"
ON public.accounts FOR SELECT
USING (public.get_auth_role() IN ('admin_zonar', 'support_zonar'));

CREATE POLICY "Clientes ven únicamente su propia cuenta"
ON public.accounts FOR SELECT
USING (id = public.get_auth_account_id());

-- 4.4 POLÍTICAS RLS: profiles
CREATE POLICY "Usuarios ven perfiles autorizados"
ON public.profiles FOR SELECT
USING (
  public.get_auth_role() IN ('admin_zonar', 'support_zonar') 
  OR account_id = public.get_auth_account_id()
);

-- 4.5 POLÍTICAS RLS: devices
CREATE POLICY "Admins y soporte ven todos los dispositivos"
ON public.devices FOR ALL
USING (public.get_auth_role() IN ('admin_zonar', 'support_zonar'));

CREATE POLICY "Clientes gestionan solo dispositivos de su cuenta"
ON public.devices FOR ALL
USING (account_id = public.get_auth_account_id())
WITH CHECK (account_id = public.get_auth_account_id());

-- 4.6 POLÍTICAS RLS: gps_telemetry_logs
CREATE POLICY "Acceso a telemetría por aislamiento de cuenta"
ON public.gps_telemetry_logs FOR SELECT
USING (
  public.get_auth_role() IN ('admin_zonar', 'support_zonar')
  OR account_id = public.get_auth_account_id()
);

CREATE POLICY "Inserción de telemetría autorizada"
ON public.gps_telemetry_logs FOR INSERT
WITH CHECK (
  public.get_auth_role() IN ('admin_zonar', 'support_zonar')
  OR account_id = public.get_auth_account_id()
);

-- 4.7 POLÍTICAS RLS: service_cases & manual_review_records
CREATE POLICY "Acceso a casos por cuenta"
ON public.service_cases FOR ALL
USING (
  public.get_auth_role() IN ('admin_zonar', 'support_zonar')
  OR account_id = public.get_auth_account_id()
);

CREATE POLICY "Acceso a bitácora de revisiones por cuenta"
ON public.manual_review_records FOR ALL
USING (
  public.get_auth_role() IN ('admin_zonar', 'support_zonar')
  OR account_id = public.get_auth_account_id()
);

-- ==============================================================================
-- 5. TRIGGER AUTOMÁTICO: ACTUALIZACIÓN DE TOTALES EN REVISIONES MANUALES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_sync_device_review_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.devices
  SET 
    manual_reviews_count = manual_reviews_count + 1,
    manual_review_total_time_minutes = manual_review_total_time_minutes + NEW.time_spent_minutes,
    is_coverage_shadow_false_positive = CASE WHEN NEW.is_false_positive THEN TRUE ELSE is_coverage_shadow_false_positive END,
    shadow_zone_name = CASE WHEN NEW.is_false_positive THEN NEW.false_positive_reason ELSE shadow_zone_name END,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_manual_review_inserted
AFTER INSERT ON public.manual_review_records
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_device_review_metrics();

-- ==============================================================================
-- 6. DATOS SEMILLA DE PRUEBA (EJEMPLOS DE CADA TABLA)
-- ==============================================================================

-- 6.1 Cuentas cliente
INSERT INTO public.accounts (id, name, slug, tier, contact_email) VALUES
('a0000000-0000-0000-0000-000000000001', 'Transportes del Norte S.A.', 'transportes-norte', 'enterprise', 'flota@transnorte.com'),
('a0000000-0000-0000-0000-000000000002', 'Logística Andina Express', 'logistica-andina', 'enterprise', 'operaciones@andina.com'),
('a0000000-0000-0000-0000-000000000003', 'Cootranscar Carga Pesada', 'cootranscar', 'standard', 'soporte@cootranscar.co')
ON CONFLICT (id) DO NOTHING;

-- 6.2 Dispositivos Zonar GPS (17 Variables)
INSERT INTO public.devices (
    id, account_id, serial_number, vehicle_name, vehicle_plate, vehicle_vin, vehicle_type,
    status, voltage, battery_health_percent, has_coverage_loss, coverage_loss_duration_minutes,
    power_connection_verified, last_latitude, last_longitude, last_address, last_speed_kmh,
    last_heading, failure_probability, predicted_failure_reason, estimated_time_to_total_failure_hours,
    is_coverage_shadow_false_positive, shadow_zone_name, review_frequency_days, manual_reviews_count, manual_review_total_time_minutes
) VALUES
(
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'ZN-MODEM-49102-KWT',
    'Kenworth T680 #402',
    'KWT-9042',
    '1XKWD49X8MR294812',
    'Truck',
    'predicted_failure',
    11.10,
    42,
    false,
    0,
    true,
    4.675200,
    -74.081700,
    'Autopista Norte Km 24, Bogotá DC',
    68.5,
    18,
    88,
    'Riesgo crítico de desconexión inminente por caída progresiva de tensión en bus CAN J1939 y batería interna con resistencia alta.',
    14,
    false,
    NULL,
    7,
    3,
    45
),
(
    'ZNR-88301',
    'a0000000-0000-0000-0000-000000000001',
    'ZN-MODEM-33109-INT',
    'International ProStar #108',
    'INT-8830',
    '3HSDSARP4FN192834',
    'Truck',
    'online',
    13.60,
    94,
    false,
    0,
    true,
    6.244200,
    -75.581200,
    'Vía Las Palmas Km 12, Medellín',
    74.0,
    215,
    8,
    NULL,
    NULL,
    false,
    NULL,
    30,
    1,
    12
),
(
    'ZNR-77219',
    'a0000000-0000-0000-0000-000000000002',
    'ZN-MODEM-77219-FRT',
    'Freightliner Cascadia #55',
    'FRT-7721',
    '1FUJGLDR8CL892301',
    'Truck',
    'offline',
    12.80,
    89,
    true,
    28,
    true,
    4.298100,
    -74.802100,
    'Vía Boquerón - Melgar Km 38 (Túnel)',
    0.0,
    90,
    12,
    'Falso positivo validado por paso en Túnel Boquerón (pérdida celular transitoria sin degradación de hardware).',
    NULL,
    true,
    'Túnel Boquerón Km 38 (Sombra RF)',
    15,
    2,
    18
),
(
    'ZNR-65490',
    'a0000000-0000-0000-0000-000000000002',
    'ZN-MODEM-65490-VOL',
    'Volvo VNL 760 #19',
    'VOL-6549',
    '4V4NC9EH1KN782394',
    'Truck',
    'offline',
    9.40,
    18,
    true,
    240,
    false,
    3.451600,
    -76.532000,
    'Parque Industrial Acopi, Yumbo, Valle',
    0.0,
    0,
    96,
    'Desconexión total por corte de arnés de alimentación principal y batería agotada.',
    0,
    false,
    NULL,
    7,
    4,
    72
)
ON CONFLICT (id) DO NOTHING;

-- 6.3 Historial de Telemetría (gps_telemetry_logs)
INSERT INTO public.gps_telemetry_logs (
    device_id, account_id, recorded_at, latitude, longitude, speed_kmh,
    heading, voltage, battery_health_percent, lte_rssi_dbm, lte_latency_ms, satellites_count, connectivity_state
) VALUES
('ZNR-90412', 'a0000000-0000-0000-0000-000000000001', now() - interval '15 minutes', 4.6710, -74.0830, 71.0, 18, 11.20, 42, -92, 140, 11, 'connected'),
('ZNR-90412', 'a0000000-0000-0000-0000-000000000001', now() - interval '5 minutes', 4.6752, -74.0817, 68.5, 18, 11.10, 42, -96, 210, 9, 'connected'),
('ZNR-77219', 'a0000000-0000-0000-0000-000000000002', now() - interval '28 minutes', 4.2981, -74.8021, 55.0, 90, 12.80, 89, -118, 990, 3, 'degraded');

-- 6.4 Casos de Servicio (service_cases)
INSERT INTO public.service_cases (
    id, case_number, device_id, account_id, title, description, status, priority,
    assigned_technician, time_spent_minutes, resolution_notes
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'CAS-2026-891',
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'Alerta predictiva: Caída crítica de tensión en Kenworth #402',
    'El motor ML proyecta fallo en ~14 horas. Voltaje actual de 11.10V indica sulfatación de terminales o falla del regulador del alternador.',
    'in_progress',
    'critical',
    'Ing. Mateo Morales (Soporte N2)',
    45,
    NULL
),
(
    'c0000000-0000-0000-0000-000000000002',
    'CAS-2026-612',
    'ZNR-65490',
    'a0000000-0000-0000-0000-000000000002',
    'Falla física de arnés y desconexión en Volvo #19',
    'Unidad dejó de reportar hace 4 horas. Voltaje cayó a 9.40V tras entrada a patio de taller.',
    'unsolved',
    'high',
    'Téc. Carlos Pardo',
    72,
    NULL
),
(
    'c0000000-0000-0000-0000-000000000003',
    'CAS-2026-304',
    'ZNR-88301',
    'a0000000-0000-0000-0000-000000000001',
    'Revisión preventiva de conector FAKRA GPS',
    'Inspección trimestral programada. Ajuste de conector de antena y verificación de firmware.',
    'solved',
    'low',
    'Ing. Sofía Valenzuela',
    12,
    'Conector FAKRA azul ajustado correctamente y firmware v4.18.2 validado en banco.'
)
ON CONFLICT (id) DO NOTHING;

-- 6.5 Bitácora de Revisiones Manuales (manual_review_records)
INSERT INTO public.manual_review_records (
    id, device_id, account_id, case_id, technician_name, time_spent_minutes, findings, is_false_positive, false_positive_reason
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'ZNR-77219',
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    'Ing. Sofía Valenzuela',
    18,
    'Revisión remota por reporte de desconexión. Se coteja ubicación con el Túnel Boquerón. La unidad mantiene 12.80V de tensión y velocidad crucero previa. Se descarta reemplazo de hardware.',
    true,
    'Tunnel / Shadow Zone'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Ing. Mateo Morales (Soporte N2)',
    25,
    'Comprobación de bus de datos J1939 y lecturas de alternador. Se confirma oscilación severa en 11.1V. Se programa visita a patio en Bogotá para reapriete de arnés.',
    false,
    NULL
);
