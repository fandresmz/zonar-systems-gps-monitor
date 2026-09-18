import { createClient } from '@supabase/supabase-js';

// Get URL and Anon Key from Vite environment variables
const rawUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
// Clean up any trailing /rest/v1 or slashes for the SDK base URL
export const supabaseUrl: string = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseConnectionStatus {
  configured: boolean;
  url: string;
  connected: boolean;
  message: string;
  latencyMs?: number;
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      url: supabaseUrl || 'No configurada',
      connected: false,
      message: 'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.',
    };
  }

  const startTime = performance.now();
  try {
    // Attempt to test access to devices table
    const { data, error } = await supabase.from('devices').select('id').limit(1);
    const latency = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet (PGRST204 or PostgreSQL 42P01), the connection to Supabase succeeded,
      // but the user hasn't run the SQL script yet.
      if (
        error.code === 'PGRST204' || 
        error.code === '42P01' || 
        error.message?.toLowerCase().includes('relation') || 
        error.message?.toLowerCase().includes('does not exist')
      ) {
        return {
          configured: true,
          url: supabaseUrl,
          connected: true,
          latencyMs: latency,
          message: 'Conectado a la instancia Supabase. Tablas pendientes de creación: ejecuta el script SQL en el SQL Editor.',
        };
      }
      return {
        configured: true,
        url: supabaseUrl,
        connected: false,
        latencyMs: latency,
        message: `Error de respuesta: ${error.message} (${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      configured: true,
      url: supabaseUrl,
      connected: true,
      latencyMs: latency,
      message: `Conectado y verificado en Supabase (${data?.length ?? 0} registros en 'devices', ${latency}ms de latencia).`,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    return {
      configured: true,
      url: supabaseUrl,
      connected: false,
      latencyMs: latency,
      message: `Error de red al conectar con Supabase: ${err?.message || String(err)}`,
    };
  }
}
