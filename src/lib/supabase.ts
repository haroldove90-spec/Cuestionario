import { createClient } from '@supabase/supabase-js';
import { QuestionnaireData, QuestionnaireResponseRecord, AppNotification, ClientUser } from '../types';

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
-- SQL DDL COMPLETO PARA SUPABASE (PRODUCCIÓN)
-- Proyecto ID: ${SUPABASE_PROJECT_ID}
-- Copia este código y ejecútalo en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =======================================================

-- 1. Tabla de Registro de Clientes
CREATE TABLE IF NOT EXISTS public.client_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Tabla de Respuestas de Cuestionarios
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'nuevo',
    notes TEXT
);

-- 3. Tabla de Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'submission',
    response_id UUID REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE
);

-- 4. Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    name TEXT,
    role TEXT DEFAULT 'admin'
);

-- Garantizar compatibilidad si la tabla ya existía sin alguna columna
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS name TEXT;

-- Insertar usuario administrador oficial por defecto
INSERT INTO public.admin_users (email, password_hash, full_name, name, role)
VALUES ('${ADMIN_CREDENTIALS.email}', '${ADMIN_CREDENTIALS.password}', '${ADMIN_CREDENTIALS.name}', '${ADMIN_CREDENTIALS.name}', 'admin')
ON CONFLICT (email) DO UPDATE 
SET password_hash = '${ADMIN_CREDENTIALS.password}',
    full_name = '${ADMIN_CREDENTIALS.name}',
    name = '${ADMIN_CREDENTIALS.name}';

-- 5. Habilitar permisos sin restricciones para API Anon (Desactivar RLS)
ALTER TABLE public.client_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
`;

// Helper para registro de clientes
export async function registerClientInSupabase(
  fullName: string,
  email: string,
  whatsapp: string,
  passwordInput: string
): Promise<{ success: boolean; client?: ClientUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  try {
    const { data, error } = await supabase
      .from('client_users')
      .insert([
        {
          full_name: fullName.trim(),
          email: cleanEmail,
          whatsapp: whatsapp.trim(),
          password_hash: cleanPassword,
        },
      ])
      .select();

    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return { success: false, error: 'Este correo ya se encuentra registrado. Inicia sesión.' };
      }
      // Fallback local storage
      const localClients = getLocalClients();
      if (localClients.some((c) => c.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'Este correo ya existe en los registros locales.' };
      }
      const newClient: ClientUser = {
        id: 'client-loc-' + Date.now(),
        created_at: new Date().toISOString(),
        full_name: fullName.trim(),
        email: cleanEmail,
        whatsapp: whatsapp.trim(),
        password_hash: cleanPassword,
      };
      saveLocalClients([...localClients, newClient]);
      return { success: true, client: newClient };
    }

    const createdClient = data && data[0] ? (data[0] as ClientUser) : undefined;
    if (createdClient) {
      const localClients = getLocalClients();
      saveLocalClients([...localClients.filter((c) => c.email !== cleanEmail), createdClient]);
    }
    return { success: true, client: createdClient };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error registrando cliente' };
  }
}

// Helper para inicio de sesión de clientes
export async function loginClientInSupabase(
  email: string,
  passwordInput: string
): Promise<{ success: boolean; client?: ClientUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password_hash', cleanPassword)
      .single();

    if (!error && data) {
      return { success: true, client: data as ClientUser };
    }

    // Fallback local
    const localClients = getLocalClients();
    const found = localClients.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.password_hash === cleanPassword
    );
    if (found) {
      return { success: true, client: found };
    }

    return { success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos.' };
  } catch (err: any) {
    return { success: false, error: 'Error al verificar credenciales del cliente' };
  }
}

// Obtener lista de clientes registrados (para Admin)
export async function fetchClientsFromSupabase(): Promise<ClientUser[]> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getLocalClients();
    }
    return data as ClientUser[];
  } catch (e) {
    return getLocalClients();
  }
}

function getLocalClients(): ClientUser[] {
  try {
    const stored = localStorage.getItem('app_client_users_v1');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading local clients:', e);
  }
  return [];
}

function saveLocalClients(clients: ClientUser[]) {
  try {
    localStorage.setItem('app_client_users_v1', JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving local clients:', e);
  }
}

// Helper para guardar respuesta / borrador en Supabase
export async function saveResponseToSupabase(
  data: QuestionnaireData,
  clientId?: string
): Promise<{ success: boolean; result?: any; isLocalFallback?: boolean; error?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('questionnaire_responses')
      .insert([
        {
          client_id: clientId || null,
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
      console.warn('Supabase insert warning, fallback to local storage:', error.message);
      saveLocalDraftFallback(data, clientId);
      return { success: true, isLocalFallback: true };
    }

    const insertedId = result && result[0] ? result[0].id : null;

    // Crear notificación para el admin
    try {
      await supabase.from('app_notifications').insert([
        {
          title: '¡Nuevo Cuestionario Registrado!',
          message: `El cliente "${data.clientName || 'Cliente'}" (${data.companyName || 'Sin empresa'}) ha enviado su cuestionario.`,
          type: 'submission',
          response_id: insertedId,
          read: false,
        },
      ]);
    } catch (notifErr) {
      console.warn('No se pudo crear notificación:', notifErr);
    }

    return { success: true, result: result ? result[0] : null };
  } catch (err: any) {
    console.error('Excepción Supabase:', err);
    saveLocalDraftFallback(data, clientId);
    return { success: true, isLocalFallback: true };
  }
}

function saveLocalDraftFallback(data: QuestionnaireData, clientId?: string) {
  try {
    const localResponses = getLocalResponsesFallback();
    const newRecord: QuestionnaireResponseRecord = {
      id: 'resp-' + Date.now(),
      created_at: new Date().toISOString(),
      company_name: data.companyName || 'Empresa Sin Nombre',
      client_name: data.clientName || 'Cliente No Especificado',
      contact_email: data.contactEmail || '',
      contact_phone: data.contactPhone || '',
      data: data,
      status: 'nuevo',
    };
    saveLocalResponses([newRecord, ...localResponses]);
  } catch (e) {
    console.error('Error saving local fallback draft:', e);
  }
}

// Helper para obtener todas las respuestas (para Admin)
export async function fetchResponsesFromSupabase(): Promise<QuestionnaireResponseRecord[]> {
  try {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getLocalResponsesFallback();
    }

    return data as QuestionnaireResponseRecord[];
  } catch (err) {
    return getLocalResponsesFallback();
  }
}

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
    await supabase
      .from('questionnaire_responses')
      .update({ status, notes })
      .eq('id', id);
  } catch (err) {
    console.error('Exception updating status in Supabase:', err);
  }
}

// Helper para eliminar un cuestionario
export async function deleteResponseFromSupabase(id: string) {
  try {
    await supabase
      .from('questionnaire_responses')
      .delete()
      .eq('id', id);
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

  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password) {
    return true;
  }

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
    console.warn('Consulta admin_users:', e);
  }

  return false;
}


