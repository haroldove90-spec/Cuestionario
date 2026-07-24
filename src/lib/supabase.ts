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
-- SQL DDL COMPLETO Y CORREGIDO PARA SUPABASE (PRODUCCIÓN)
-- Proyecto ID: ${SUPABASE_PROJECT_ID}
-- Ejecútalo en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =======================================================

-- 1. Tabla de Registro de Clientes
CREATE TABLE IF NOT EXISTS public.client_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- Asegurar columna company_name en tablas previamente creadas
ALTER TABLE public.client_users ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 2. Tabla de Respuestas de Cuestionarios
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id TEXT,
    company_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'nuevo',
    notes TEXT
);

-- Asegurar tipo TEXT en columnas para evitar errores de tipo UUID al consultar o insertar
DO $$ 
BEGIN 
  ALTER TABLE IF EXISTS public.questionnaire_responses ALTER COLUMN client_id TYPE TEXT USING client_id::text;
  ALTER TABLE IF EXISTS public.questionnaire_responses ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Tabla de Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'submission',
    recipient_role TEXT DEFAULT 'admin',
    client_email TEXT,
    response_id TEXT
);

-- Alteraciones para agregar columnas si la tabla ya existía
ALTER TABLE public.app_notifications ADD COLUMN IF NOT EXISTS recipient_role TEXT DEFAULT 'admin';
ALTER TABLE public.app_notifications ADD COLUMN IF NOT EXISTS client_email TEXT;
DO $$ 
BEGIN 
  ALTER TABLE IF EXISTS public.app_notifications ALTER COLUMN response_id TYPE TEXT USING response_id::text;
  ALTER TABLE IF EXISTS public.app_notifications ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT DEFAULT 'Administrador',
    name TEXT DEFAULT 'Administrador',
    role TEXT DEFAULT 'admin'
);

-- Garantizar compatibilidad y remover restriccion NOT NULL en caso de que la tabla ya existia
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.admin_users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.admin_users ALTER COLUMN name DROP NOT NULL;

-- Insertar usuario administrador con todos los campos requeridos
INSERT INTO public.admin_users (email, password_hash, full_name, name, role)
VALUES ('${ADMIN_CREDENTIALS.email}', '${ADMIN_CREDENTIALS.password}', '${ADMIN_CREDENTIALS.name}', '${ADMIN_CREDENTIALS.name}', 'admin')
ON CONFLICT (email) DO UPDATE 
SET password_hash = '${ADMIN_CREDENTIALS.password}',
    full_name = '${ADMIN_CREDENTIALS.name}',
    name = '${ADMIN_CREDENTIALS.name}';

-- 5. Habilitar permisos de lectura y escritura para API Pública (Desactivar RLS y Otorgar Permisos Totales)
ALTER TABLE public.client_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role, postgres;

-- 6. Bucket de Supabase Storage para Documentos de Cuestionarios (PDF, Excel, Word, Imágenes, Video)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('questionnaire_files', 'questionnaire_files', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permisos explícitos e irrestrictos en storage.objects para el bucket questionnaire_files
DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access on questionnaire_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Operations" ON storage.objects;

CREATE POLICY "Allow All Storage Operations" ON storage.objects
FOR ALL TO public, anon, authenticated, service_role
USING (bucket_id = 'questionnaire_files')
WITH CHECK (bucket_id = 'questionnaire_files');

-- Conceder permisos de ejecución y acceso al esquema de Storage
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role, postgres;
`;

// Helper para subir archivos directamente a Supabase Storage (PDF, Excel, Word, Imágenes, Video)
export async function uploadFileToSupabaseStorage(
  file: File
): Promise<{ success: boolean; url: string; fileName: string; fileSize: number; fileType: string; error?: string }> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `docs/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`;
    const contentType = file.type || (cleanFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    const { data, error } = await supabase.storage
      .from('questionnaire_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType,
      });

    if (error) {
      console.warn('Carga en Supabase Storage falló:', error.message);

      // Si el archivo supera los 500 KB (como PDFs), no generar DataURL gigante que cause fallo de payload
      if (file.size > 500 * 1024) {
        return {
          success: false,
          url: '',
          fileName: file.name,
          fileSize: file.size,
          fileType: contentType,
          error: `No se pudo subir "${file.name}" a Supabase Storage: ${error.message}. Por favor ejecuta el Script SQL en Supabase para crear el bucket "questionnaire_files" y dar permisos.`,
        };
      }

      const dataUrl = await fileToDataURL(file);
      return {
        success: true,
        url: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: contentType,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('questionnaire_files')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: contentType,
    };
  } catch (err: any) {
    console.warn('Excepción en carga de archivo:', err);
    if (file.size > 500 * 1024) {
      return {
        success: false,
        url: '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        error: `Error al procesar "${file.name}": ${err.message || 'Error de red'}. Revisa los permisos de Supabase Storage.`,
      };
    }
    try {
      const dataUrl = await fileToDataURL(file);
      return {
        success: true,
        url: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
      };
    } catch (e: any) {
      return {
        success: false,
        url: '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: 'No se pudo procesar el archivo.',
      };
    }
  }
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper para registro de clientes directamente en Supabase (con fallback local automático)
export async function registerClientInSupabase(
  fullName: string,
  companyName: string,
  email: string,
  whatsapp: string,
  passwordInput: string
): Promise<{ success: boolean; client?: ClientUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  // Objeto de cliente preparado
  const newClientObj: ClientUser = {
    id: 'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    full_name: fullName.trim(),
    company_name: companyName.trim(),
    email: cleanEmail,
    whatsapp: whatsapp.trim(),
    password_hash: cleanPassword,
  };

  try {
    const { data, error } = await supabase
      .from('client_users')
      .insert([
        {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          email: cleanEmail,
          whatsapp: whatsapp.trim(),
          password_hash: cleanPassword,
        },
      ])
      .select();

    if (error) {
      console.warn('Advertencia insertando cliente en Supabase:', error.message);
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return { success: false, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
      }
      
      // Fallback a almacenamiento local para no bloquear al usuario si hay problemas de permisos/red
      const localClients = getLocalClients();
      if (localClients.some((c) => c.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
      }
      saveLocalClients([...localClients, newClientObj]);
      return { success: true, client: newClientObj };
    }

    const createdClient = data && data[0] ? (data[0] as ClientUser) : newClientObj;
    const localClients = getLocalClients();
    saveLocalClients([...localClients.filter((c) => c.email !== cleanEmail), createdClient]);

    // Crear notificación para el Admin sobre nuevo registro de usuario
    try {
      const adminNotif: AppNotification = {
        id: 'notif-user-' + Date.now(),
        title: '¡Nuevo Usuario Registrado!',
        message: `El cliente "${createdClient.full_name}" (${createdClient.company_name || 'Sin Empresa'}) se ha registrado con el correo ${createdClient.email}.`,
        created_at: new Date().toISOString(),
        read: false,
        type: 'user_registered',
        recipient_role: 'admin',
      };
      const localNotifs = getLocalNotificationsFallback();
      saveLocalNotifications([adminNotif, ...localNotifs]);

      await supabase.from('app_notifications').insert([
        {
          title: adminNotif.title,
          message: adminNotif.message,
          type: 'user_registered',
          recipient_role: 'admin',
          read: false,
        },
      ]);
    } catch (notifErr) {
      console.warn('No se pudo crear notificación de registro para admin:', notifErr);
    }

    return { success: true, client: createdClient };
  } catch (err: any) {
    console.warn('Excepción en registro de cliente (activando fallback local por red/fetch):', err);
    // Si ocurre TypeError: Failed to fetch o problema de red, registrar localmente de forma transparente
    const localClients = getLocalClients();
    if (localClients.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
    }
    saveLocalClients([...localClients, newClientObj]);
    return { success: true, client: newClientObj };
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
    console.warn('Excepción en login de cliente (verificando local):', err);
    const localClients = getLocalClients();
    const found = localClients.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.password_hash === cleanPassword
    );
    if (found) {
      return { success: true, client: found };
    }
    return { success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos.' };
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

// Helper para obtener la lista completa de cuestionarios de un cliente desde Supabase
export async function fetchClientQuestionnairesFromSupabase(
  clientId?: string,
  email?: string
): Promise<QuestionnaireResponseRecord[]> {
  const localResponses = getLocalResponsesFallback();
  const cleanEmail = email?.trim().toLowerCase();

  try {
    if (!clientId && !cleanEmail) return localResponses;

    let query = supabase.from('questionnaire_responses').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    } else if (cleanEmail) {
      query = query.eq('contact_email', cleanEmail);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      // Combinar con locales
      const remoteIds = new Set(data.map((d: any) => String(d.id)));
      const unsyncedLocal = localResponses.filter(
        (r) =>
          ((clientId && r.client_id === clientId) ||
            (cleanEmail && r.contact_email?.toLowerCase() === cleanEmail)) &&
          !remoteIds.has(String(r.id))
      );
      return [...data, ...unsyncedLocal] as QuestionnaireResponseRecord[];
    }
  } catch (err) {
    console.warn('Error al obtener cuestionarios del cliente:', err);
  }

  return localResponses.filter(
    (r) =>
      (clientId && r.client_id === clientId) ||
      (cleanEmail && r.contact_email?.toLowerCase() === cleanEmail)
  );
}

// Helper para obtener el borrador / respuesta del cliente desde Supabase
export async function fetchClientResponseFromSupabase(
  clientId?: string,
  email?: string
): Promise<QuestionnaireData | null> {
  try {
    const list = await fetchClientQuestionnairesFromSupabase(clientId, email);
    if (list && list.length > 0) {
      return list[0].data as QuestionnaireData;
    }
  } catch (err) {
    console.warn('Error fetching client response from Supabase:', err);
  }
  return null;
}

// Helper para guardar respuesta / borrador en Supabase (guarda borradores o registra nuevos envíos en el historial)
export async function saveResponseToSupabase(
  data: QuestionnaireData,
  clientId?: string,
  status: 'borrador' | 'nuevo' | 'en_revision' | 'aprobado' | 'completado' = 'borrador'
): Promise<{ success: boolean; result?: any; isLocalFallback?: boolean; error?: string }> {
  // Guardar datos completos con todos los archivos adjuntos y URLs de Supabase Storage intactos
  const cleanData = data;
  const cleanEmail = cleanData.contactEmail?.trim().toLowerCase() || '';
  const company = cleanData.companyName || 'Empresa Sin Nombre';
  const clientName = cleanData.clientName || 'Cliente No Especificado';
  const phone = cleanData.contactPhone || '';

  try {
    let resultRecord: any = null;

    // Si el estatus es 'borrador', buscar si el cliente ya tiene un borrador previo para actualizarlo
    let draftId: string | null = null;
    if (status === 'borrador' && (clientId || cleanEmail)) {
      try {
        let draftQuery = supabase
          .from('questionnaire_responses')
          .select('id')
          .eq('status', 'borrador');
        if (clientId) {
          draftQuery = draftQuery.eq('client_id', clientId);
        } else if (cleanEmail) {
          draftQuery = draftQuery.eq('contact_email', cleanEmail);
        }
        const { data: draftRows } = await draftQuery.order('created_at', { ascending: false }).limit(1);
        if (draftRows && draftRows.length > 0) {
          draftId = draftRows[0].id;
        }
      } catch (e) {
        console.warn('Excepción consultando borrador previo:', e);
      }
    }

    if (draftId && status === 'borrador') {
      // Actualizar borrador existente
      const { data: updateRes, error: updateErr } = await supabase
        .from('questionnaire_responses')
        .update({
          company_name: company,
          client_name: clientName,
          contact_email: cleanEmail,
          contact_phone: phone,
          data: cleanData,
          status: 'borrador',
          created_at: new Date().toISOString(),
        })
        .eq('id', draftId)
        .select();

      if (!updateErr && updateRes && updateRes.length > 0) {
        resultRecord = updateRes[0];
      }
    }

    // Si no es un borrador que se actualizó, es un nuevo envío oficial ('nuevo') o un nuevo registro
    if (!resultRecord) {
      const generatedId = 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const newCreatedAt = new Date().toISOString();

      const { data: insertRes, error: insertErr } = await supabase
        .from('questionnaire_responses')
        .insert([
          {
            id: generatedId,
            client_id: clientId || null,
            company_name: company,
            client_name: clientName,
            contact_email: cleanEmail,
            contact_phone: phone,
            data: cleanData,
            status: status,
            created_at: newCreatedAt,
          },
        ])
        .select();

      if (insertErr) {
        console.warn('Error al insertar cuestionario en Supabase:', insertErr.message);

        // Si falló por tipo de client_id (UUID vs TEXT), reintentar con client_id nulo
        if (insertErr.message.includes('uuid') || insertErr.message.includes('syntax')) {
          const { data: retryRes, error: retryErr } = await supabase
            .from('questionnaire_responses')
            .insert([
              {
                id: generatedId,
                client_id: null,
                company_name: company,
                client_name: clientName,
                contact_email: cleanEmail,
                contact_phone: phone,
                data: cleanData,
                status: status,
                created_at: newCreatedAt,
              },
            ])
            .select();

          if (!retryErr && retryRes && retryRes.length > 0) {
            resultRecord = retryRes[0];
          } else {
            console.warn('Reintento de inserción también falló:', retryErr?.message);
            saveLocalDraftFallback(cleanData, clientId, status, generatedId);
            return { success: true, isLocalFallback: true, error: retryErr?.message || insertErr.message };
          }
        } else {
          saveLocalDraftFallback(cleanData, clientId, status, generatedId);
          return { success: true, isLocalFallback: true, error: insertErr.message };
        }
      } else {
        resultRecord = insertRes ? insertRes[0] : null;
      }
    }

    saveLocalDraftFallback(cleanData, clientId, status, resultRecord?.id);

    const insertedId = resultRecord?.id || 'resp-' + Date.now();

    // Crear notificación para el admin
    try {
      const adminNotif: AppNotification = {
        id: 'notif-quest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: status === 'nuevo' ? '¡Nuevo Cuestionario Enviado!' : '¡Cuestionario Guardado / Actualizado!',
        message: `El cliente "${clientName}" (${company}) ha ${status === 'nuevo' ? 'enviado para revisión' : 'guardado'} su cuestionario con información actualizada.`,
        created_at: new Date().toISOString(),
        read: false,
        type: 'submission',
        recipient_role: 'admin',
        client_email: cleanEmail,
        response_id: insertedId,
      };

      await createAdminNotificationInSupabase(adminNotif);
    } catch (notifErr) {
      console.warn('No se pudo crear notificación para admin:', notifErr);
    }

    return { success: true, result: resultRecord };
  } catch (err: any) {
    console.error('Excepción Supabase al guardar cuestionario:', err);
    saveLocalDraftFallback(data, clientId, status);
    return { success: true, isLocalFallback: true, error: err.message };
  }
}

function saveLocalDraftFallback(data: QuestionnaireData, clientId?: string, status?: string, recordId?: string) {
  try {
    const localResponses = getLocalResponsesFallback();

    if (status === 'borrador') {
      const existingDraftIndex = localResponses.findIndex(
        (r) =>
          r.status === 'borrador' &&
          ((clientId && r.client_id === clientId) ||
            (data.contactEmail && r.contact_email?.toLowerCase() === data.contactEmail.toLowerCase()))
      );

      const draftRecord: QuestionnaireResponseRecord = {
        id: existingDraftIndex >= 0 ? localResponses[existingDraftIndex].id : (recordId || 'resp-' + Date.now()),
        created_at: new Date().toISOString(),
        client_id: clientId,
        company_name: data.companyName || 'Empresa Sin Nombre',
        client_name: data.clientName || 'Cliente No Especificado',
        contact_email: data.contactEmail || '',
        contact_phone: data.contactPhone || '',
        data: data,
        status: 'borrador',
      };

      if (existingDraftIndex >= 0) {
        localResponses[existingDraftIndex] = draftRecord;
      } else {
        localResponses.unshift(draftRecord);
      }
      saveLocalResponses(localResponses);
      return;
    }

    // Para envíos de cuestionarios ('nuevo' u otros estados): agregar como un nuevo registro en el historial
    const newRecord: QuestionnaireResponseRecord = {
      id: recordId || 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      created_at: new Date().toISOString(),
      client_id: clientId,
      company_name: data.companyName || 'Empresa Sin Nombre',
      client_name: data.clientName || 'Cliente No Especificado',
      contact_email: data.contactEmail || '',
      contact_phone: data.contactPhone || '',
      data: data,
      status: (status || 'nuevo') as QuestionnaireResponseRecord['status'],
    };

    // Remover cualquier borrador previo del cliente al enviar oficialmente
    const filtered = localResponses.filter(
      (r) =>
        !(r.status === 'borrador' &&
          ((clientId && r.client_id === clientId) ||
            (data.contactEmail && r.contact_email?.toLowerCase() === data.contactEmail.toLowerCase())))
    );

    saveLocalResponses([newRecord, ...filtered]);
  } catch (e) {
    console.error('Error saving local fallback draft:', e);
  }
}

// Helper para obtener todas las respuestas (para Admin)
export async function fetchResponsesFromSupabase(): Promise<QuestionnaireResponseRecord[]> {
  const localData = getLocalResponsesFallback();

  try {
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Error obteniendo respuestas de Supabase (usando local fallback):', error?.message);
      return localData;
    }

    // Combinar respuestas de Supabase con respuestas locales que no estén sincronizadas aún
    const supabaseIds = new Set(data.map((r: any) => String(r.id)));
    const supabaseEmails = new Set(data.map((r: any) => r.contact_email?.toLowerCase()).filter(Boolean));

    const unsyncedLocal = localData.filter(
      (l) => !supabaseIds.has(String(l.id)) && (!l.contact_email || !supabaseEmails.has(l.contact_email.toLowerCase()))
    );

    const merged = [...data, ...unsyncedLocal] as QuestionnaireResponseRecord[];
    // Sincronizar en localStorage para redundancia
    saveLocalResponses(merged);
    return merged;
  } catch (err) {
    console.warn('Excepción obteniendo respuestas de Supabase:', err);
    return localData;
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

export async function createAdminNotificationInSupabase(notif: AppNotification) {
  try {
    const localNotifs = getLocalNotificationsFallback();
    // Prevenir duplicados por ID
    const exists = localNotifs.some((n) => n.id === notif.id);
    if (!exists) {
      saveLocalNotifications([notif, ...localNotifs]);
    }

    const { error } = await supabase.from('app_notifications').insert([
      {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type || 'submission',
        recipient_role: 'admin',
        client_email: notif.client_email || null,
        response_id: notif.response_id || null,
        read: false,
        created_at: notif.created_at || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Advertencia insertando notificación de admin en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Error insertando notificación de admin en Supabase:', err);
  }
}

// Helper para obtener notificaciones del Admin
export async function fetchNotificationsFromSupabase(): Promise<AppNotification[]> {
  const localData = getLocalNotificationsFallback();

  try {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('recipient_role', 'admin')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Error obteniendo notificaciones de admin de Supabase (usando local fallback):', error?.message);
      return localData;
    }

    // Combinar notificaciones de Supabase con notificaciones locales no sincronizadas aún
    const supabaseIds = new Set(data.map((n: any) => String(n.id)));
    const unsyncedLocal = localData.filter((l) => !supabaseIds.has(String(l.id)));
    const merged = [...data, ...unsyncedLocal] as AppNotification[];

    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    saveLocalNotifications(merged);
    return merged;
  } catch (e) {
    console.warn('Excepción obteniendo notificaciones:', e);
    return localData;
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
    console.error('Error marking notification as read in Supabase:', e);
  }
}

// Helper para actualizar todos los datos o campos de un cuestionario
export async function updateQuestionnaireRecordInSupabase(
  id: string,
  updatedFields: Partial<QuestionnaireResponseRecord>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('questionnaire_responses')
      .update(updatedFields)
      .eq('id', id);

    if (error) {
      console.warn('Error en Supabase update:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Excepción actualizando cuestionario:', err);
    return { success: false, error: err.message || 'Error de red' };
  }
}

// Helper para crear notificaciones dirigidas al Cliente
export async function createClientNotificationInSupabase(
  clientEmail: string,
  title: string,
  message: string,
  responseId?: string
) {
  if (!clientEmail) return;
  const cleanEmail = clientEmail.trim().toLowerCase();
  const notifId = 'notif-client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  const notifObj: AppNotification = {
    id: notifId,
    title,
    message,
    created_at: new Date().toISOString(),
    read: false,
    type: 'status_change',
    recipient_role: 'client',
    client_email: cleanEmail,
    response_id: responseId,
  };

  // Guardar en almacenamiento local para el cliente
  try {
    const localNotifs = getLocalClientNotifications(cleanEmail);
    const exists = localNotifs.some((n) => n.id === notifId);
    if (!exists) {
      saveLocalClientNotifications(cleanEmail, [notifObj, ...localNotifs]);
    }
  } catch (e) {
    console.error('Error guardando notificación local de cliente:', e);
  }

  // Guardar en Supabase
  try {
    const { error } = await supabase.from('app_notifications').insert([
      {
        id: notifId,
        title,
        message,
        type: 'status_change',
        recipient_role: 'client',
        client_email: cleanEmail,
        response_id: responseId || null,
        read: false,
        created_at: notifObj.created_at,
      },
    ]);

    if (error) {
      console.warn('Advertencia insertando notificación para cliente en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Advertencia insertando notificación para cliente en Supabase:', err);
  }
}

// Helper para obtener notificaciones de un cliente específico
export async function fetchClientNotificationsFromSupabase(
  clientEmail: string
): Promise<AppNotification[]> {
  if (!clientEmail) return [];
  const cleanEmail = clientEmail.trim().toLowerCase();
  const localData = getLocalClientNotifications(cleanEmail);

  try {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('recipient_role', 'client')
      .eq('client_email', cleanEmail)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return localData;
    }

    const supabaseIds = new Set(data.map((n: any) => String(n.id)));
    const unsyncedLocal = localData.filter((l) => !supabaseIds.has(String(l.id)));
    const merged = [...data, ...unsyncedLocal] as AppNotification[];

    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    saveLocalClientNotifications(cleanEmail, merged);
    return merged;
  } catch (e) {
    return localData;
  }
}

export function getLocalClientNotifications(clientEmail: string): AppNotification[] {
  try {
    const key = `app_client_notifications_${clientEmail.trim().toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error leyendo notificaciones locales de cliente:', e);
  }
  return [];
}

export function saveLocalClientNotifications(clientEmail: string, notifications: AppNotification[]) {
  try {
    const key = `app_client_notifications_${clientEmail.trim().toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error guardando notificaciones locales de cliente:', e);
  }
}

export async function markClientNotificationReadInSupabase(id: string, clientEmail: string) {
  const cleanEmail = clientEmail.trim().toLowerCase();
  try {
    const local = getLocalClientNotifications(cleanEmail);
    const updated = local.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveLocalClientNotifications(cleanEmail, updated);

    await supabase.from('app_notifications').update({ read: true }).eq('id', id);
  } catch (e) {
    console.error('Error marcando notificación de cliente como leída:', e);
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


