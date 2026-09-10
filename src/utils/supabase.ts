import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DeploymentRecord, DeploymentFormData } from '../types/deployment';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const CONFIG_STORAGE_KEY = 'prodtracker_supabase_credentials_v1';

/**
 * Returns the currently active Supabase configuration,
 * checking localStorage first, then falling back to Vite environment variables.
 */
export function getSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from localStorage:', err);
  }

  const envUrl = (((import.meta as any).env?.VITE_SUPABASE_URL as string) || '').trim();
  const envKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '').trim();

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

/**
 * Saves custom Supabase credentials to localStorage.
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    cachedClient = null; // Invalidate cached client
  } catch (err) {
    console.error('Error saving Supabase config to localStorage:', err);
  }
}

/**
 * Clears custom credentials from localStorage.
 */
export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    cachedClient = null;
  } catch (err) {
    console.error('Error clearing Supabase config:', err);
  }
}

/**
 * Checks if Supabase credentials are configured with non-empty values.
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(
    config.url &&
    config.anonKey &&
    config.url.startsWith('https://') &&
    !config.url.includes('your-project') &&
    config.anonKey !== 'your-anon-key-here'
  );
}

let cachedClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

/**
 * Returns the Supabase client instance if configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (cachedClient && lastClientUrl === url && lastClientKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastClientUrl = url;
    lastClientKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

/**
 * Database record type mapping (snake_case in PostgreSQL)
 */
export interface SupabaseDeploymentRow {
  id: string;
  producto: string;
  proyecto: string;
  fecha_implementacion: string;
  numero_gdd: string;
  detalle: string;
  tipo: string;
  estado: string;
  impacto: string;
  autor: string;
  aprobado_por?: string | null;
  ambiente?: string | null;
  version?: string | null;
  rollback_plan?: string | null;
  jira_ticket?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Maps Supabase DB row (snake_case) to Frontend DeploymentRecord (camelCase)
 */
export function mapRowToDeployment(row: SupabaseDeploymentRow): DeploymentRecord {
  return {
    id: row.id,
    producto: row.producto || '',
    proyecto: row.proyecto || '',
    fechaImplementacion: row.fecha_implementacion ? row.fecha_implementacion.slice(0, 16) : '',
    numeroGDD: row.numero_gdd || '',
    detalle: row.detalle || '',
    tipo: (row.tipo as any) || 'Release',
    estado: (row.estado as any) || 'En Monitoreo',
    impacto: (row.impacto as any) || 'Medio',
    autor: row.autor || '',
    aprobadoPor: row.aprobado_por || '',
    ambiente: row.ambiente || '',
    version: row.version || '',
    rollbackPlan: row.rollback_plan || '',
    jiraTicket: row.jira_ticket || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps Frontend DeploymentRecord or FormData to Supabase DB row (snake_case)
 */
export function mapDeploymentToRow(data: DeploymentFormData | DeploymentRecord, id?: string): Partial<SupabaseDeploymentRow> {
  const row: Partial<SupabaseDeploymentRow> = {
    producto: data.producto,
    proyecto: data.proyecto,
    fecha_implementacion: data.fechaImplementacion,
    numero_gdd: data.numeroGDD,
    detalle: data.detalle,
    tipo: data.tipo,
    estado: data.estado,
    impacto: data.impacto,
    autor: data.autor,
    aprobado_por: data.aprobadoPor || '',
    ambiente: data.ambiente || '',
    version: data.version || '',
    rollback_plan: data.rollbackPlan || '',
    jira_ticket: data.jiraTicket || '',
  };

  if (id) {
    row.id = id;
  }

  return row;
}

/**
 * Tests connection to Supabase and verifies the 'deployments' table existence.
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{
  success: boolean;
  message: string;
  tableExists?: boolean;
}> {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'URL o Clave anónima (Anon Key) no proporcionadas.' };
    }

    if (!url.startsWith('https://')) {
      return { success: false, message: 'La URL de Supabase debe comenzar con https://' };
    }

    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    const { data, error } = await testClient
      .from('deployments')
      .select('id')
      .limit(1);

    if (error) {
      // Check if table does not exist
      if (error.code === '42P01' || error.message?.includes('relation "public.deployments" does not exist') || error.message?.includes('does not exist')) {
        return {
          success: true,
          tableExists: false,
          message: 'Conexión a Supabase exitosa, pero la tabla "deployments" aún no ha sido creada. Ejecuta el script SQL proporcionado.',
        };
      }
      return { success: false, message: `Error de Supabase: ${error.message}` };
    }

    return {
      success: true,
      tableExists: true,
      message: '¡Conexión exitosa y tabla "deployments" detectada!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al conectar: ${err?.message || 'Verifica la URL y la API Key'}`,
    };
  }
}

/**
 * Fetches all deployment records from Supabase ordered by implementation date descending.
 */
export async function fetchDeploymentsFromSupabase(): Promise<DeploymentRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await client
    .from('deployments')
    .select('*')
    .order('fecha_implementacion', { ascending: false });

  if (error) {
    console.error('Error fetching deployments from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapRowToDeployment);
}

/**
 * Inserts a new deployment into Supabase.
 */
export async function insertDeploymentToSupabase(data: DeploymentFormData): Promise<DeploymentRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado');
  }

  const newId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const rowData = mapDeploymentToRow(data, newId);

  const { data: inserted, error } = await client
    .from('deployments')
    .insert([rowData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting deployment to Supabase:', error);
    throw error;
  }

  return mapRowToDeployment(inserted);
}

/**
 * Updates an existing deployment in Supabase.
 */
export async function updateDeploymentInSupabase(
  id: string,
  updates: Partial<DeploymentFormData>
): Promise<DeploymentRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado');
  }

  const rowData: any = {};
  if (updates.producto !== undefined) rowData.producto = updates.producto;
  if (updates.proyecto !== undefined) rowData.proyecto = updates.proyecto;
  if (updates.fechaImplementacion !== undefined) rowData.fecha_implementacion = updates.fechaImplementacion;
  if (updates.numeroGDD !== undefined) rowData.numero_gdd = updates.numeroGDD;
  if (updates.detalle !== undefined) rowData.detalle = updates.detalle;
  if (updates.tipo !== undefined) rowData.tipo = updates.tipo;
  if (updates.estado !== undefined) rowData.estado = updates.estado;
  if (updates.impacto !== undefined) rowData.impacto = updates.impacto;
  if (updates.autor !== undefined) rowData.autor = updates.autor;
  if (updates.aprobadoPor !== undefined) rowData.aprobado_por = updates.aprobadoPor;
  if (updates.ambiente !== undefined) rowData.ambiente = updates.ambiente;
  if (updates.version !== undefined) rowData.version = updates.version;
  if (updates.rollbackPlan !== undefined) rowData.rollback_plan = updates.rollbackPlan;
  if (updates.jiraTicket !== undefined) rowData.jira_ticket = updates.jiraTicket;
  rowData.updated_at = new Date().toISOString();

  const { data: updated, error } = await client
    .from('deployments')
    .update(rowData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating deployment in Supabase:', error);
    throw error;
  }

  return mapRowToDeployment(updated);
}

/**
 * Deletes a deployment from Supabase by ID.
 */
export async function deleteDeploymentFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado');
  }

  const { error } = await client
    .from('deployments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting deployment from Supabase:', error);
    throw error;
  }

  return true;
}

/**
 * Deletes multiple deployments from Supabase by IDs.
 */
export async function deleteMultipleDeploymentsFromSupabase(ids: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado');
  }

  const { error } = await client
    .from('deployments')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting deployments from Supabase:', error);
    throw error;
  }

  return true;
}

/**
 * Official Supabase SQL Script to create table, indexes, RLS policies, and triggers.
 */
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- PRODTRACKER: ESQUEMA DE BASE DE DATOS PARA SUPABASE (POSTGRESQL)
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase y ejecuta (Run).
-- ==============================================================================

-- 1. Crear tabla de despliegues (deployments)
CREATE TABLE IF NOT EXISTS public.deployments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    producto TEXT NOT NULL,
    proyecto TEXT NOT NULL,
    fecha_implementacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    numero_gdd TEXT NOT NULL,
    detalle TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Release' CHECK (tipo IN ('Release', 'Hotfix', 'Patch', 'Rollback', 'Feature')),
    estado TEXT NOT NULL DEFAULT 'En Monitoreo' CHECK (estado IN ('Verificado', 'En Monitoreo', 'Pendiente', 'Revertido')),
    impacto TEXT NOT NULL DEFAULT 'Medio' CHECK (impacto IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
    autor TEXT NOT NULL,
    aprobado_por TEXT DEFAULT '',
    ambiente TEXT DEFAULT 'Producción',
    version TEXT DEFAULT '',
    rollback_plan TEXT DEFAULT '',
    jira_ticket TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear Índices para búsquedas rápidas y ordenamiento de alta concurrencia
CREATE INDEX IF NOT EXISTS idx_deployments_fecha ON public.deployments (fecha_implementacion DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_producto ON public.deployments (producto);
CREATE INDEX IF NOT EXISTS idx_deployments_numero_gdd ON public.deployments (numero_gdd);
CREATE INDEX IF NOT EXISTS idx_deployments_estado ON public.deployments (estado);

-- 3. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- 4. Crear Política de Acceso Público / Anónimo (Lectura, Inserción, Edición, Eliminación)
DROP POLICY IF EXISTS "Permitir acceso publico a despliegues" ON public.deployments;
CREATE POLICY "Permitir acceso publico a despliegues" 
ON public.deployments 
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. Función y Trigger para auto-actualizar el campo 'updated_at' en cada UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_deployments_updated_at ON public.deployments;
CREATE TRIGGER tr_deployments_updated_at
BEFORE UPDATE ON public.deployments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar Publicación en Tiempo Real (Realtime) para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;
`;
