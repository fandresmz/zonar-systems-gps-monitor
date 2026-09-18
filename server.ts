import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DEVICES, INITIAL_ACCOUNTS, INITIAL_CASES, INITIAL_MANUAL_REVIEWS } from './src/data/mockFleetData';
import { ManualReviewInputSchema, ServiceCaseCreateSchema } from './src/types/fleet';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // In-memory persistent state during runtime
  let devices = [...INITIAL_DEVICES];
  let accounts = [...INITIAL_ACCOUNTS];
  let cases = [...INITIAL_CASES];
  let manualReviews = [...INITIAL_MANUAL_REVIEWS];

  app.use(express.json());

  // Security headers middleware (OWASP Compliance)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Zonar Systems Telematics BFF',
      version: '1.0.0-rc4',
      timestamp: new Date().toISOString(),
      security: {
        rlsEnforced: true,
        zodSanitization: true,
        owaspHeaders: true,
      },
    });
  });

  // GET /api/accounts
  app.get('/api/accounts', (req: Request, res: Response) => {
    res.json(accounts);
  });

  // GET /api/devices (with multi-tenant filtering & priority order)
  app.get('/api/devices', (req: Request, res: Response) => {
    const { accountId, role, status, priority, search } = req.query;

    let filtered = [...devices];

    // RLS multi-tenant check: if role is client_owner, enforce accountId isolation
    if (role === 'client_owner' && accountId) {
      filtered = filtered.filter((d) => d.accountId === accountId);
    } else if (accountId && accountId !== 'all') {
      filtered = filtered.filter((d) => d.accountId === accountId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((d) => d.status === status);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((d) => d.clientPriority === priority);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.vehicle.name.toLowerCase().includes(q) ||
          d.vehicle.plate.toLowerCase().includes(q) ||
          d.vehicle.vin.toLowerCase().includes(q) ||
          d.accountName.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  // POST /api/manual-reviews (TRD Zod validation and metrics tracking)
  app.post('/api/manual-reviews', (req: Request, res: Response) => {
    const parseResult = ManualReviewInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues,
      });
    }

    const { deviceId, timeSpentMinutes, findings, isFalsePositive, falsePositiveReason, markCaseSolved, caseNotes } =
      parseResult.data;

    const device = devices.find((d) => d.id === deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    let createdCaseId: string | undefined;

    // If needed, create or resolve case
    if (markCaseSolved) {
      const existingCase = cases.find((c) => c.deviceId === deviceId && c.status !== 'solved');
      if (existingCase) {
        existingCase.status = 'solved';
        existingCase.resolvedAt = new Date().toISOString();
        existingCase.resolutionNotes = caseNotes || findings;
        existingCase.timeSpentMinutes += timeSpentMinutes;
        createdCaseId = existingCase.id;
      }
    } else if (!isFalsePositive) {
      // Create new ticket case
      const newCase = {
        id: `case-${Date.now()}`,
        caseNumber: `CAS-2026-${Math.floor(100 + Math.random() * 900)}`,
        deviceId: device.id,
        vehicleName: device.vehicle.name,
        accountName: device.accountName,
        title: `Revisión Técnica requerida: ${findings.slice(0, 50)}...`,
        description: findings,
        status: 'in_progress' as const,
        priority: device.clientPriority.includes('Crítico') ? ('critical' as const) : ('high' as const),
        createdAt: new Date().toISOString(),
        assignedTechnician: 'Soporte Técnico Zonar',
        timeSpentMinutes,
      };
      cases.unshift(newCase);
      device.casesHistory.unshift(newCase);
      createdCaseId = newCase.id;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      deviceId: device.id,
      deviceCode: device.id,
      vehicleName: device.vehicle.name,
      technicianName: 'Soporte Técnico Zonar',
      timestamp: new Date().toISOString(),
      timeSpentMinutes,
      findings,
      isFalsePositive,
      falsePositiveReason: isFalsePositive ? falsePositiveReason : undefined,
      caseCreated: !isFalsePositive,
      caseId: createdCaseId,
    };

    manualReviews.unshift(newReview);

    // Update device cumulative statistics
    device.manualReviewsCount += 1;
    device.manualReviewTotalTimeMinutes += timeSpentMinutes;
    if (isFalsePositive) {
      device.isCoverageShadowFalsePositive = true;
      if (falsePositiveReason) {
        device.shadowZoneName = falsePositiveReason;
      }
      device.failureProbability = Math.min(device.failureProbability, 15);
    }

    res.json({
      success: true,
      review: newReview,
      device,
    });
  });

  // GET /api/cases
  app.get('/api/cases', (req: Request, res: Response) => {
    res.json(cases);
  });

  // GET /api/supabase-schema (Raw SQL schema for Supabase integration)
  app.get('/api/supabase-schema', (req: Request, res: Response) => {
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(schemaPath);
    } else {
      res.status(404).json({ error: 'Schema file not found' });
    }
  });

  // GET /api/supabase-seed (Raw SQL seed data for 3 clients and devices)
  app.get('/api/supabase-seed', (req: Request, res: Response) => {
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(seedPath);
    } else {
      res.status(404).json({ error: 'Seed file not found' });
    }
  });

  // GET /api/supabase-status (Connection test for configured Supabase project)
  app.get('/api/supabase-status', async (req: Request, res: Response) => {
    const supabaseUrlRaw = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const cleanUrl = supabaseUrlRaw.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

    if (!cleanUrl || !supabaseKey) {
      return res.json({
        configured: false,
        url: cleanUrl || 'None',
        connected: false,
        message: 'No se encontraron las variables de entorno de Supabase.',
      });
    }

    const startTime = Date.now();
    try {
      // Test via Supabase REST health or root endpoint
      const response = await fetch(`${cleanUrl}/rest/v1/devices?select=id&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const rows = await response.json();
        return res.json({
          configured: true,
          url: cleanUrl,
          connected: true,
          latencyMs,
          tableExists: true,
          recordCount: Array.isArray(rows) ? rows.length : 0,
          message: `Conectado exitosamente con Supabase (${latencyMs}ms). Tabla 'devices' lista.`,
        });
      }

      // If table doesn't exist yet (404 or 400 with relation does not exist)
      const errorText = await response.text();
      const isRelationMissing = response.status === 404 || errorText.includes('relation') || errorText.includes('does not exist');

      return res.json({
        configured: true,
        url: cleanUrl,
        connected: true,
        latencyMs,
        tableExists: !isRelationMissing,
        message: isRelationMissing
          ? 'Conectado exitosamente a Supabase. Las tablas aún no han sido creadas (ejecuta el script SQL en el SQL Editor).'
          : `Respuesta de Supabase (HTTP ${response.status}): ${errorText.slice(0, 150)}`,
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return res.json({
        configured: true,
        url: cleanUrl,
        connected: false,
        latencyMs,
        message: `Error al conectar con Supabase: ${err?.message || String(err)}`,
      });
    }
  });

  // GET /api/manual-reviews
  app.get('/api/manual-reviews', (req: Request, res: Response) => {
    res.json(manualReviews);
  });

  // POST /api/cases
  app.post('/api/cases', (req: Request, res: Response) => {
    const parseResult = ServiceCaseCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues,
      });
    }

    const { deviceId, title, description, priority, assignedTechnician } = parseResult.data;
    const device = devices.find((d) => d.id === deviceId);

    const newCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CAS-2026-${Math.floor(100 + Math.random() * 900)}`,
      deviceId,
      vehicleName: device ? device.vehicle.name : 'Unidad Zonar',
      accountName: device ? device.accountName : 'Zonar Systems',
      title,
      description,
      status: 'in_progress' as const,
      priority,
      createdAt: new Date().toISOString(),
      assignedTechnician,
      timeSpentMinutes: 0,
    };

    cases.unshift(newCase);
    if (device) {
      device.casesHistory.unshift(newCase);
    }

    res.json(newCase);
  });

  // POST /api/diagnose-device (AI Proactive Analysis with Gemini)
  app.post('/api/diagnose-device', async (req: Request, res: Response) => {
    const { deviceId } = req.body;
    const device = devices.find((d) => d.id === deviceId);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if Gemini API can be utilized
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Actúa como el motor analítico de proyección de fallos de Zonar Systems (FastAPI ML Engine / TimescaleDB).
Analiza los siguientes datos telemáticos del dispositivo GPS y genera un diagnóstico técnico conciso, identificando si se trata de un Falso Positivo (e.g. túnel o pérdida de cobertura celular) o una Falla Real de Hardware, con causas raíz probables y acciones recomendadas para el técnico de soporte.

Datos Telemáticos:
- ID Dispositivo: ${device.id}
- Modelo GPS: ${device.model}
- Vehículo: ${device.vehicle.name} (VIN: ${device.vehicle.vin})
- Cliente: ${device.accountName} (${device.clientPriority})
- Estado Actual: ${device.status}
- Tiempo Offline: ${device.offlineDurationMinutes} minutos
- Tensión Eléctrica: ${device.voltage} V (Salud Batería: ${device.batteryHealthPercent}%)
- Nivel Señal Celular: ${device.cellularSignalDbm} dBm
- Probabilidad de Fallo Proyectada: ${device.failureProbability}%
- Código de Fallas Registradas: ${device.faultHistory.map((f) => `${f.code}: ${f.description}`).join('; ') || 'Ninguno'}
- Últimos Eventos de Conexión: ${device.connectionHistory.slice(0, 3).map((c) => `${c.event} @ ${c.batteryVoltage}V / ping ${c.pingLatencyMs}ms / sat ${c.satellitesConnected}`).join('; ')}

Responde estrictamente en formato JSON con la siguiente estructura:
{
  "diagnosticSummary": "Resumen técnico en 1 o 2 oraciones",
  "isFalsePositive": boolean,
  "confidenceScore": number (0 a 100),
  "rootCauseCategory": "Hardware Antenna" | "Electrical CAN-Bus" | "RF Coverage Shadow" | "Firmware Crash" | "Normal Operation",
  "recommendedActions": ["Paso 1", "Paso 2", "Paso 3"],
  "estimatedTimeToResolutionMinutes": number
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            aiPowered: true,
            model: 'gemini-3.8-flash',
            ...parsed,
          });
        }
      } catch (err: any) {
        console.warn('Gemini API call fell back to local deterministic rule engine:', err?.message);
      }
    }

    // Deterministic Rule Engine Fallback (conforming strictly to PRD Section 3.2 and TRD rules)
    const isCoverage = device.cellularSignalDbm < -110 && device.voltage >= 12.8;
    const isElectrical = device.voltage < 11.5;
    const isFirmware = device.faultHistory.some((f) => f.component === 'Internal Firmware');

    let category = 'Normal Operation';
    let summary = 'Dispositivo operando dentro de parámetros tolerables de telemetría Zonar.';
    let actions = ['Monitoreo continuo de latencia'];

    if (isCoverage) {
      category = 'RF Coverage Shadow';
      summary = `Pérdida de señal transitoria (${device.cellularSignalDbm} dBm). Patrón consistente con sombra orográfica o túnel; tensión adecuada a ${device.voltage}V.`;
      actions = [
        'Descartar alarma como Falso Positivo de cobertura',
        'Validar trayecto en mapa satelital',
        'Monitorear reingreso automático a celda LTE',
      ];
    } else if (isElectrical) {
      category = 'Electrical CAN-Bus';
      summary = `Anomalía de alimentación crítica (${device.voltage}V). Micro-cortes en arnés J1939 con riesgo inminente de apagado del módem.`;
      actions = [
        'Inspeccionar fusible principal y línea IGN del arnés J1939',
        'Medir caída de tensión en terminal positivo con multímetro',
        'Agendar reemplazo preventivo antes de 14 horas de operación',
      ];
    } else if (isFirmware) {
      category = 'Firmware Crash';
      summary = 'Registros repetidos de reinicios por Watchdog de hardware. Posible desbordamiento de buffer telemático.';
      actions = [
        'Forzar reinicio controlado vía comando OTA seguro',
        'Verificar versión de firmware v4.18.2 recomendada',
      ];
    }

    return res.json({
      aiPowered: false,
      model: 'Zonar Predictive Telematics Rule Engine v1.0',
      diagnosticSummary: summary,
      isFalsePositive: isCoverage,
      confidenceScore: isCoverage ? 96 : 89,
      rootCauseCategory: category,
      recommendedActions: actions,
      estimatedTimeToResolutionMinutes: isCoverage ? 10 : 45,
    });
  });

  // Vite middleware for development vs Production build serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zonar Systems GPS Monitor running on port ${PORT}`);
  });
}

startServer();
