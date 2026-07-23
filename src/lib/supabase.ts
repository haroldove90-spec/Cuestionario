import { createClient } from '@supabase/supabase-js';
import { QuestionnaireData } from '../types';

export const SUPABASE_PROJECT_ID = 'jetychvxbrgqlnxwrdew';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jetychvxbrgqlnxwrdew.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHljaHZ4YnJncWxueHdyZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTc4NTEsImV4cCI6MjEwMDM5Mzg1MX0.ssvY_V_KhGkXIQOdBS12_bTKeJf6uPXkXbTaECgjJ-Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SQL_SCRIPT = `-- SQL DDL para Supabase (Proyecto ID: ${SUPABASE_PROJECT_ID})
-- Copia este código y ejecútalo en Supabase: SQL Editor -> New Query -> Run

CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_name TEXT,
    client_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    data JSONB NOT NULL,
    status TEXT DEFAULT 'enviado'
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas anónimas
DROP POLICY IF EXISTS "Permitir insercion anonima" ON public.questionnaire_responses;
CREATE POLICY "Permitir insercion anonima"
ON public.questionnaire_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para permitir lectura pública
DROP POLICY IF EXISTS "Permitir lectura" ON public.questionnaire_responses;
CREATE POLICY "Permitir lectura"
ON public.questionnaire_responses
FOR SELECT
TO anon, authenticated
USING (true);
`;

export async function saveResponseToSupabase(data: QuestionnaireData) {
  try {
    const { data: result, error } = await supabase
      .from('questionnaire_responses')
      .insert([
        {
          company_name: data.companyName || 'Sin especificar',
          client_name: data.clientName || 'Sin especificar',
          contact_email: data.contactEmail || 'Sin especificar',
          contact_phone: data.contactPhone || 'Sin especificar',
          data: data,
          status: 'completado',
        },
      ])
      .select();

    if (error) {
      console.error('Error enviando a Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, result };
  } catch (err: any) {
    console.error('Excepción Supabase:', err);
    return { success: false, error: err?.message || 'Error de conexión con Supabase' };
  }
}
