import { createClient } from '@supabase/supabase-js';
import { QuestionnaireData, QuestionnaireResponseRecord, AppNotification } from '../types';

export const SUPABASE_PROJECT_ID = 'jetychvxbrgqlnxwrdew';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jetychvxbrgqlnxwrdew.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHljaHZ4YnJncWxueHdyZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTc4NTEsImV4cCI6MjEwMDM5Mzg1MX0.ssvY_V_KhGkXIQOdBS12_bTKeJf6uPXkXbTaECgjJ-Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Credenciales oficiales de administrador
export const ADMIN_CREDENTIALS = {
  email: 'haroldo90@hotmail.com',
  password: 'Chevropar#1970',
  name: 'Administrador Haroldo',
};

export const SUPABASE_SQL_SCRIPT = `-- =======================================================
-- SQL DDL COMPLETO PARA SUPABASE
-- Proyecto ID: ${SUPABASE_PROJECT_ID}
-- Copia este código y ejecútalo en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =======================================================

-- 1. Tabla de Respuestas de Cuestionarios
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'nuevo',
    notes TEXT
);

-- 2. Tabla de Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'submission',
    response_id UUID REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE
);

-- 3. Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
);

-- Insertar usuario administrador por defecto
INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES ('${ADMIN_CREDENTIALS.email}', '${ADMIN_CREDENTIALS.password}', '${ADMIN_CREDENTIALS.name}', 'admin')
ON CONFLICT (email) DO UPDATE 
SET password_hash = '${ADMIN_CREDENTIALS.password}', full_name = '${ADMIN_CREDENTIALS.name}';

-- 4. Configuración de Seguridad y Políticas (RLS)
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura pública para desarrollo
DROP POLICY IF EXISTS "Permitir insercion publica cuestionario" ON public.questionnaire_responses;
CREATE POLICY "Permitir insercion publica cuestionario"
ON public.questionnaire_responses FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura cuestionarios" ON public.questionnaire_responses;
CREATE POLICY "Permitir lectura cuestionarios"
ON public.questionnaire_responses FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion cuestionarios" ON public.questionnaire_responses;
CREATE POLICY "Permitir actualizacion cuestionarios"
ON public.questionnaire_responses FOR UPDATE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion cuestionarios" ON public.questionnaire_responses;
CREATE POLICY "Permitir eliminacion cuestionarios"
ON public.questionnaire_responses FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir todo notificaciones" ON public.app_notifications;
CREATE POLICY "Permitir todo notificaciones"
ON public.app_notifications FOR ALL
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura admin" ON public.admin_users;
CREATE POLICY "Permitir lectura admin"
ON public.admin_users FOR SELECT
TO anon, authenticated USING (true);
`;

// Helper para guardar respuesta en Supabase
export async function saveResponseToSupabase(data: QuestionnaireData) {
  try {
    const { data: result, error } = await supabase
      .from('questionnaire_responses')
      .insert([
        {
          company_name: data.companyName || 'Empresa Sin Nombre',
          client_name: data.clientName || 'Cliente No Especificado',
          contact_email: data.contactEmail || '',
          contact_phone: data.contactPhone || '',
          data: data,
          status: 'nuevo',
        },
      ])
      .select();

    if (error) {
      console.error('Error enviando a Supabase:', error);
      return { success: false, error: error.message };
    }

    const insertedId = result && result[0] ? result[0].id : null;

    // Crear notificación
    try {
      await supabase.from('app_notifications').insert([
        {
          title: '¡Nuevo Cuestionario Recibido!',
          message: `La empresa "${data.companyName || 'Sin nombre'}" (${data.clientName || 'Cliente'}) ha enviado un nuevo formulario de requerimientos.`,
          type: 'submission',
          response_id: insertedId,
          read: false,
        },
      ]);
    } catch (notifErr) {
      console.warn('No se pudo crear notificación en Supabase:', notifErr);
    }

    return { success: true, result: result ? result[0] : null };
  } catch (err: any) {
    console.error('Excepción Supabase:', err);
    return { success: false, error: err?.message || 'Error de conexión con Supabase' };
  }
}

// Helper para obtener todas las respuestas (para Admin)
export async function fetchResponsesFromSupabase(): Promise<QuestionnaireResponseRecord[]> {
  try {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch returned error, fallback to local storage:', error.message);
      return getLocalResponsesFallback();
    }

    if (!data || data.length === 0) {
      return getLocalResponsesFallback();
    }

    return data as QuestionnaireResponseRecord[];
  } catch (err) {
    console.error('Exception fetching responses from Supabase:', err);
    return getLocalResponsesFallback();
  }
}

// Fallback a almacenamiento local si Supabase falla o no tiene datos
function getLocalResponsesFallback(): QuestionnaireResponseRecord[] {
  try {
    const stored = localStorage.getItem('app_admin_responses_v1');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading local admin responses:', e);
  }
  return [];
}

export function saveLocalResponses(responses: QuestionnaireResponseRecord[]) {
  try {
    localStorage.setItem('app_admin_responses_v1', JSON.stringify(responses));
  } catch (e) {
    console.error('Error saving local admin responses:', e);
  }
}

// Helper para actualizar estado de un cuestionario
export async function updateResponseStatusInSupabase(
  id: string,
  status: QuestionnaireResponseRecord['status'],
  notes?: string
) {
  try {
    const { error } = await supabase
      .from('questionnaire_responses')
      .update({ status, notes })
      .eq('id', id);

    if (error) {
      console.warn('Supabase status update failed:', error.message);
    }
  } catch (err) {
    console.error('Exception updating status in Supabase:', err);
  }
}

// Helper para eliminar un cuestionario
export async function deleteResponseFromSupabase(id: string) {
  try {
    const { error } = await supabase
      .from('questionnaire_responses')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete failed:', error.message);
    }
  } catch (err) {
    console.error('Exception deleting response from Supabase:', err);
  }
}

// Helper para obtener notificaciones
export async function fetchNotificationsFromSupabase(): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getLocalNotificationsFallback();
    }
    return data as AppNotification[];
  } catch (e) {
    return getLocalNotificationsFallback();
  }
}

function getLocalNotificationsFallback(): AppNotification[] {
  try {
    const stored = localStorage.getItem('app_admin_notifications_v1');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading local notifications:', e);
  }
  return [];
}

export function saveLocalNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem('app_admin_notifications_v1', JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving local notifications:', e);
  }
}

export async function markNotificationReadInSupabase(id: string) {
  try {
    await supabase.from('app_notifications').update({ read: true }).eq('id', id);
  } catch (e) {
    console.error('Error marking notification read:', e);
  }
}

// Validación de inicio de sesión de Admin
export async function validateAdminLogin(emailInput: string, passwordInput: string): Promise<boolean> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  // Verificación estricta con las credenciales solicitadas por el usuario
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password) {
    return true;
  }

  // Intento de autenticación en la tabla Supabase 'admin_users'
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password_hash', cleanPassword)
      .single();

    if (!error && data) {
      return true;
    }
  } catch (e) {
    console.warn('Consulta admin_users en Supabase omitida o no disponible:', e);
  }

  return false;
}

