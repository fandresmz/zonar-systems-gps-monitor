-- ==============================================================================
-- ZONAR SYSTEMS GPS MONITOR - SEED DATA SCRIPT
-- Datos de prueba para 3 clientes con dispositivos, telemetría, casos y revisiones
-- Compatible con: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. LIMPIEZA PREVIA (Opcional si deseas regenerar)
-- DELETE FROM public.manual_review_records;
-- DELETE FROM public.service_cases;
-- DELETE FROM public.gps_telemetry_logs;
-- DELETE FROM public.devices;
-- DELETE FROM public.accounts;

-- ==============================================================================
-- 2. CLIENTES / CUENTAS (3 ORGANIZACIONES MULTI-TENANT)
-- ==============================================================================
INSERT INTO public.accounts (id, name, slug, tier, contact_email) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Transportes del Norte S.A.',
    'transportes-norte',
    'enterprise',
    'flota@transnorte.com'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Logística Andina Express S.A.S.',
    'logistica-andina',
    'enterprise',
    'operaciones@andina.com'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Cootranscar Carga Pesada & Minería',
    'cootranscar',
    'standard',
    'soporte@cootranscar.co'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tier = EXCLUDED.tier,
    contact_email = EXCLUDED.contact_email;


-- ==============================================================================
-- 3. DISPOSITIVOS GPS POR CLIENTE (12 UNIDADES CON LAS 17 VARIABLES PRD 3.1)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CLIENTE 1: Transportes del Norte S.A. (4 Vehículos: Bogotá, Medellín, Tunja, Bucaramanga)
-- ------------------------------------------------------------------------------
INSERT INTO public.devices (
    id, account_id, serial_number, vehicle_name, vehicle_plate, vehicle_vin, vehicle_type,
    firmware_version, status, voltage, battery_health_percent, has_coverage_loss,
    coverage_loss_duration_minutes, power_connection_verified, last_latitude, last_longitude,
    last_address, last_speed_kmh, last_heading, last_telemetry_at, failure_probability,
    predicted_failure_reason, estimated_time_to_total_failure_hours,
    is_coverage_shadow_false_positive, shadow_zone_name, review_frequency_days,
    manual_reviews_count, manual_review_total_time_minutes
) VALUES
(
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'ZN-MODEM-49102-KWT',
    'Kenworth T680 #402',
    'KWT-9042',
    '1XKWD49X8MR294812',
    'Truck',
    'v4.18.2',
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
    timezone('utc'::text, now()) - interval '3 minutes',
    88,
    'Riesgo crítico de desconexión inminente por caída progresiva de tensión en bus CAN J1939 y batería interna degradada.',
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
    'v4.18.2',
    'online',
    13.60,
    94,
    false,
    0,
    true,
    6.244200,
    -75.581200,
    'Vía Las Palmas Km 12, Medellín, Antioquia',
    74.0,
    215,
    timezone('utc'::text, now()) - interval '1 minute',
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
    'ZNR-54120',
    'a0000000-0000-0000-0000-000000000001',
    'ZN-MODEM-54120-FRT',
    'Freightliner Cascadia #210',
    'FRT-5412',
    '1FUJGLDR2DL482910',
    'Truck',
    'v4.19.0',
    'online',
    13.80,
    98,
    false,
    0,
    true,
    5.535300,
    -73.367800,
    'Avenida Universitaria, Tunja, Boyacá',
    52.0,
    45,
    timezone('utc'::text, now()) - interval '2 minutes',
    4,
    NULL,
    NULL,
    false,
    NULL,
    30,
    0,
    0
),
(
    'ZNR-31908',
    'a0000000-0000-0000-0000-000000000001',
    'ZN-MODEM-31908-KWT',
    'Kenworth T800 Cisterna #77',
    'KWT-3190',
    '1XKWD49X6LR102938',
    'Truck',
    'v4.17.4',
    'degraded',
    12.10,
    65,
    false,
    0,
    true,
    7.125400,
    -73.119800,
    'Vía Palenque - Café Madrid Km 4, Bucaramanga',
    41.5,
    140,
    timezone('utc'::text, now()) - interval '8 minutes',
    45,
    'Caída sostenida de tensión durante ralentí prolongado. Se sugiere revisión de batería secundaria.',
    72,
    false,
    NULL,
    15,
    2,
    26
),

-- ------------------------------------------------------------------------------
-- CLIENTE 2: Logística Andina Express S.A.S. (4 Vehículos: Cali, Yumbo, Pereira, Melgar)
-- ------------------------------------------------------------------------------
(
    'ZNR-77219',
    'a0000000-0000-0000-0000-000000000002',
    'ZN-MODEM-77219-FRT',
    'Freightliner Cascadia #55',
    'FRT-7721',
    '1FUJGLDR8CL892301',
    'Truck',
    'v4.18.2',
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
    timezone('utc'::text, now()) - interval '28 minutes',
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
    'v4.18.2',
    'offline',
    9.40,
    18,
    true,
    240,
    false,
    3.451600,
    -76.532000,
    'Parque Industrial Acopi, Yumbo, Valle del Cauca',
    0.0,
    0,
    timezone('utc'::text, now()) - interval '4 hours',
    96,
    'Desconexión total por corte de arnés de alimentación principal y batería de respaldo agotada.',
    0,
    false,
    NULL,
    7,
    4,
    72
),
(
    'ZNR-42301',
    'a0000000-0000-0000-0000-000000000002',
    'ZN-MODEM-42301-HIN',
    'Hino 500 Refrigerado #82',
    'HIN-4230',
    '7HNJH7J98M829104',
    'Van',
    'v4.19.0',
    'online',
    13.40,
    91,
    false,
    0,
    true,
    3.437200,
    -76.522500,
    'Autopista Suroriental con Calle 26, Cali, Valle',
    60.0,
    180,
    timezone('utc'::text, now()) - interval '1 minute',
    12,
    NULL,
    NULL,
    false,
    NULL,
    30,
    1,
    15
),
(
    'ZNR-91044',
    'a0000000-0000-0000-0000-000000000002',
    'ZN-MODEM-91044-ISU',
    'Isuzu Forward FTR #33',
    'ISU-9104',
    'JALC4J193K719283',
    'Truck',
    'v4.18.2',
    'predicted_failure',
    11.45,
    52,
    false,
    0,
    true,
    4.813300,
    -75.696100,
    'Variante La Romelia - El Pollo Km 8, Pereira, Risaralda',
    65.0,
    270,
    timezone('utc'::text, now()) - interval '4 minutes',
    74,
    'Pérdida de señal GPS intermitente asociada a microcortes en el conector FAKRA de antena.',
    28,
    false,
    NULL,
    15,
    2,
    30
),

-- ------------------------------------------------------------------------------
-- CLIENTE 3: Cootranscar Carga Pesada & Minería (4 Vehículos: Barranquilla, Cartagena, Sta Marta, Valledupar)
-- ------------------------------------------------------------------------------
(
    'ZNR-22109',
    'a0000000-0000-0000-0000-000000000003',
    'ZN-MODEM-22109-MCK',
    'Mack Anthem Volqueta #501',
    'MCK-2210',
    '1M2AX19C4LM291039',
    'Heavy Equipment',
    'v4.19.0',
    'online',
    13.70,
    96,
    false,
    0,
    true,
    10.968500,
    -74.781300,
    'Vía 40 con Calle 85, Corredor Portuario, Barranquilla',
    48.0,
    30,
    timezone('utc'::text, now()) - interval '2 minutes',
    6,
    NULL,
    NULL,
    false,
    NULL,
    30,
    0,
    0
),
(
    'ZNR-81745',
    'a0000000-0000-0000-0000-000000000003',
    'ZN-MODEM-81745-PTB',
    'Peterbilt 579 Tractomula #12',
    'PTB-8174',
    '1XP9DB9X3MD192847',
    'Truck',
    'v4.18.2',
    'predicted_failure',
    11.25,
    48,
    false,
    0,
    true,
    10.391000,
    -75.479400,
    'Zona Industrial Mamonal Km 7, Cartagena, Bolívar',
    55.2,
    195,
    timezone('utc'::text, now()) - interval '5 minutes',
    82,
    'Resistencia anómala en bus CAN J1939 detectada durante ciclo de encendido.',
    18,
    false,
    NULL,
    7,
    3,
    50
),
(
    'ZNR-19830',
    'a0000000-0000-0000-0000-000000000003',
    'ZN-MODEM-19830-KWT',
    'Kenworth T880 Cama Baja #04',
    'KWT-1983',
    '1XKWD49X1KR920194',
    'Trailer',
    'v4.17.0',
    'offline',
    10.20,
    25,
    true,
    180,
    false,
    11.240800,
    -74.199000,
    'Terminal Portuario de Pozos Colorados, Santa Marta',
    0.0,
    0,
    timezone('utc'::text, now()) - interval '3 hours',
    89,
    'Desconexión prolongada sin respuesta de módem celular. Voltaje en 10.20V.',
    6,
    false,
    NULL,
    7,
    3,
    40
),
(
    'ZNR-60312',
    'a0000000-0000-0000-0000-000000000003',
    'ZN-MODEM-60312-SCN',
    'Scania R450 Granelero #88',
    'SCN-6031',
    'YS2R4X2000592810',
    'Truck',
    'v4.19.0',
    'online',
    13.50,
    92,
    false,
    0,
    true,
    10.463100,
    -73.253200,
    'Vía Bosconia - Valledupar Km 42, Cesar',
    78.0,
    80,
    timezone('utc'::text, now()) - interval '1 minute',
    10,
    NULL,
    NULL,
    false,
    NULL,
    30,
    1,
    10
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    voltage = EXCLUDED.voltage,
    battery_health_percent = EXCLUDED.battery_health_percent,
    last_latitude = EXCLUDED.last_latitude,
    last_longitude = EXCLUDED.last_longitude,
    last_address = EXCLUDED.last_address,
    last_speed_kmh = EXCLUDED.last_speed_kmh,
    failure_probability = EXCLUDED.failure_probability,
    predicted_failure_reason = EXCLUDED.predicted_failure_reason,
    estimated_time_to_total_failure_hours = EXCLUDED.estimated_time_to_total_failure_hours,
    is_coverage_shadow_false_positive = EXCLUDED.is_coverage_shadow_false_positive,
    shadow_zone_name = EXCLUDED.shadow_zone_name,
    manual_reviews_count = EXCLUDED.manual_reviews_count,
    manual_review_total_time_minutes = EXCLUDED.manual_review_total_time_minutes,
    updated_at = timezone('utc'::text, now());


-- ==============================================================================
-- 4. HISTORIAL DE TELEMETRÍA (gps_telemetry_logs)
-- ==============================================================================
INSERT INTO public.gps_telemetry_logs (
    device_id, account_id, recorded_at, latitude, longitude, speed_kmh,
    heading, voltage, battery_health_percent, lte_rssi_dbm, lte_latency_ms,
    satellites_count, connectivity_state, is_shadow_zone, raw_payload
) VALUES
-- Telemetría Cliente 1 (Kenworth T680 #402)
('ZNR-90412', 'a0000000-0000-0000-0000-000000000001', now() - interval '20 minutes', 4.6710, -74.0830, 71.0, 18, 11.20, 42, -92, 140, 11, 'connected', false, '{"can_j1939_bus_ok": false, "rpm": 1450}'::jsonb),
('ZNR-90412', 'a0000000-0000-0000-0000-000000000001', now() - interval '10 minutes', 4.6735, -74.0824, 69.2, 18, 11.15, 42, -95, 180, 10, 'connected', false, '{"can_j1939_bus_ok": false, "rpm": 1420}'::jsonb),
('ZNR-90412', 'a0000000-0000-0000-0000-000000000001', now() - interval '3 minutes', 4.6752, -74.0817, 68.5, 18, 11.10, 42, -98, 220, 9, 'connected', false, '{"can_j1939_bus_ok": false, "rpm": 1400}'::jsonb),

-- Telemetría Cliente 2 (Freightliner Cascadia #55 - Túnel Boquerón)
('ZNR-77219', 'a0000000-0000-0000-0000-000000000002', now() - interval '35 minutes', 4.2960, -74.8050, 62.0, 90, 12.85, 89, -88, 95, 12, 'connected', false, '{"tunnel_detected": false}'::jsonb),
('ZNR-77219', 'a0000000-0000-0000-0000-000000000002', now() - interval '28 minutes', 4.2981, -74.8021, 55.0, 90, 12.80, 89, -118, 990, 3, 'degraded', true, '{"tunnel_detected": true, "zone": "Boquerón"}'::jsonb),

-- Telemetría Cliente 3 (Peterbilt 579 - Mamonal Cartagena)
('ZNR-81745', 'a0000000-0000-0000-0000-000000000003', now() - interval '15 minutes', 10.3880, -75.4810, 58.0, 195, 11.35, 48, -84, 110, 13, 'connected', false, '{"alternator_v": 11.4}'::jsonb),
('ZNR-81745', 'a0000000-0000-0000-0000-000000000003', now() - interval '5 minutes', 10.3910, -75.4794, 55.2, 195, 11.25, 48, -91, 150, 12, 'connected', false, '{"alternator_v": 11.2}'::jsonb)
ON CONFLICT DO NOTHING;


-- ==============================================================================
-- 5. CASOS DE SERVICIO (service_cases)
-- ==============================================================================
INSERT INTO public.service_cases (
    id, case_number, device_id, account_id, title, description, status, priority,
    assigned_technician, time_spent_minutes, resolution_notes
) VALUES
-- Caso Cliente 1
(
    'c0000000-0000-0000-0000-000000000001',
    'CAS-2026-891',
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'Alerta predictiva: Caída crítica de tensión en Kenworth #402',
    'El motor analítico proyecta desconexión total en ~14 horas. Voltaje actual de 11.10V indica sulfatación en terminales o falla del regulador del alternador.',
    'in_progress',
    'critical',
    'Ing. Mateo Morales (Soporte N2)',
    45,
    NULL
),
-- Caso Cliente 1
(
    'c0000000-0000-0000-0000-000000000002',
    'CAS-2026-304',
    'ZNR-88301',
    'a0000000-0000-0000-0000-000000000001',
    'Mantenimiento preventivo programado ProStar #108',
    'Inspección trimestral rutinaria de arnés J1939 y actualización de firmware a v4.18.2.',
    'solved',
    'low',
    'Ing. Sofía Valenzuela',
    12,
    'Conector FAKRA azul ajustado correctamente y firmware v4.18.2 validado en banco.'
),
-- Caso Cliente 2
(
    'c0000000-0000-0000-0000-000000000003',
    'CAS-2026-612',
    'ZNR-65490',
    'a0000000-0000-0000-0000-000000000002',
    'Falla física de arnés y desconexión en Volvo #19',
    'Unidad dejó de reportar hace 4 horas. Voltaje cayó a 9.40V tras ingreso a patio de mantenimiento en Yumbo.',
    'unsolved',
    'high',
    'Téc. Carlos Pardo',
    72,
    NULL
),
-- Caso Cliente 3
(
    'c0000000-0000-0000-0000-000000000004',
    'CAS-2026-449',
    'ZNR-81745',
    'a0000000-0000-0000-0000-000000000003',
    'Diagnóstico de bus J1939 en Peterbilt #12',
    'Alertas de resistencia alta en bus de datos durante rutas de carga pesada en Mamonal.',
    'in_progress',
    'critical',
    'Ing. Diego Rueda',
    50,
    NULL
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    time_spent_minutes = EXCLUDED.time_spent_minutes;


-- ==============================================================================
-- 6. BITÁCORA DE REVISIONES MANUALES (manual_review_records)
-- ==============================================================================
INSERT INTO public.manual_review_records (
    id, device_id, account_id, case_id, technician_name, time_spent_minutes,
    findings, is_false_positive, false_positive_reason, reviewed_at
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'ZNR-77219',
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    'Ing. Sofía Valenzuela',
    18,
    'Revisión remota por desconexión en Túnel Boquerón. Se confirma que el voltaje se mantuvo en 12.80V y la velocidad crucero fue constante antes de ingresar. Falso positivo confirmado por sombra RF de túnel.',
    true,
    'Túnel Boquerón Km 38 (Sombra RF)',
    now() - interval '25 minutes'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'ZNR-90412',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Ing. Mateo Morales (Soporte N2)',
    25,
    'Comprobación remota del bus CAN J1939. Se valida fluctuación de 11.10V a 10.95V. Riesgo alto de parada no programada.',
    false,
    NULL,
    now() - interval '1 hour'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'ZNR-81745',
    'a0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'Ing. Diego Rueda',
    20,
    'Telemetría de alternador indica oscilación térmica en bornes de alimentación. Se coordina revisión técnica en Mamonal.',
    false,
    NULL,
    now() - interval '40 minutes'
)
ON CONFLICT (id) DO NOTHING;
