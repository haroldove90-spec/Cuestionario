import React, { useState } from 'react';
import { X, Copy, Check, Database, Sparkles, Send, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SUPABASE_PROJECT_ID, SUPABASE_URL, SUPABASE_SQL_SCRIPT, saveResponseToSupabase } from '../lib/supabase';
import { QuestionnaireData } from '../types';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuestionnaireData;
  onSuccessToast: (msg: string) => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({
  isOpen,
  onClose,
  data,
  onSuccessToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleSendNow = async () => {
    setIsSending(true);
    setSubmitResult(null);

    const res = await saveResponseToSupabase(data);
    setIsSending(false);

    if (res.success) {
      setSubmitResult({
        success: true,
        message: '¡Formulario enviado y guardado exitosamente en Supabase!',
      });
      onSuccessToast('¡Datos guardados con éxito en la base de datos Supabase!');
    } else {
      setSubmitResult({
        success: false,
        message: `Error al guardar: ${res.error}. Verifica que la tabla 'questionnaire_responses' exista en Supabase.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Configuración & SQL para Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Proyecto ID: <span className="text-emerald-400 font-mono font-bold">{SUPABASE_PROJECT_ID}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Connection Details Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Credenciales Supabase Configuradas
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                CONECTADO
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Project ID</span>
                <span className="font-semibold text-slate-800">{SUPABASE_PROJECT_ID}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Supabase URL</span>
                <span className="font-semibold text-slate-800 truncate block">{SUPABASE_URL}</span>
              </div>
            </div>
          </div>

          {/* Test Submission Button */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" /> Enviar Cuestionario Actual a Supabase
              </h4>
              <p className="text-xs text-emerald-800">
                Guarda los datos actuales en la tabla <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">questionnaire_responses</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendNow}
              disabled={isSending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar a Supabase
                </>
              )}
            </button>
          </div>

          {/* Result Alert */}
          {submitResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                submitResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {submitResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed font-semibold">{submitResult.message}</p>
            </div>
          )}

          {/* SQL Editor Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Código SQL para Crear la Tabla en Supabase
              </label>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar SQL'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Para que la base de datos reciba los envíos, abre el SQL Editor en Supabase y ejecuta este script una vez:
            </p>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
              <pre className="text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre">
                {SUPABASE_SQL_SCRIPT}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 underline"
          >
            Abrir Supabase SQL Editor <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
