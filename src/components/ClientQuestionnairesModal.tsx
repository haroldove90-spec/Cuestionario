import React, { useState, useEffect } from 'react';
import { X, FolderOpen, FileEdit, Eye, Send, Clock, CheckCircle2, FileText, RefreshCw, Sparkles, Building2, Paperclip, ExternalLink } from 'lucide-react';
import { ClientUser, QuestionnaireResponseRecord, QuestionnaireData } from '../types';
import { fetchClientQuestionnairesFromSupabase, saveResponseToSupabase } from '../lib/supabase';

interface ClientQuestionnairesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: ClientUser;
  onSelectQuestionnaire: (data: QuestionnaireData) => void;
  onOpenSummaryForRecord: (data: QuestionnaireData) => void;
  onToast: (msg: string) => void;
}

export const ClientQuestionnairesModal: React.FC<ClientQuestionnairesModalProps> = ({
  isOpen,
  onClose,
  currentClient,
  onSelectQuestionnaire,
  onOpenSummaryForRecord,
  onToast,
}) => {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireResponseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentClient) {
      loadQuestionnaires();
      const interval = setInterval(() => {
        loadQuestionnaires(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentClient]);

  const loadQuestionnaires = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    const data = await fetchClientQuestionnairesFromSupabase(currentClient.id, currentClient.email);
    setQuestionnaires(data);
    if (!isBackground) setIsLoading(false);
  };

  if (!isOpen) return null;

  const handleSendToAdmin = async (record: QuestionnaireResponseRecord) => {
    setSubmittingId(record.id);
    const res = await saveResponseToSupabase(record.data, currentClient.id, 'nuevo');
    setSubmittingId(null);

    if (res.success) {
      onToast('¡Cuestionario enviado exitosamente al Administrador!');
      loadQuestionnaires();
    } else {
      onToast('Error al enviar. Se ha reintentado guardar localmente.');
    }
  };

  const getStatusBadge = (status: QuestionnaireResponseRecord['status']) => {
    switch (status) {
      case 'borrador':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Borrador Guardado
          </span>
        );
      case 'nuevo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-600" /> Enviado al Admin
          </span>
        );
      case 'en_revision':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Eye className="w-3 h-3 text-purple-600" /> En Revisión
          </span>
        );
      case 'aprobado':
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobado / Recibido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-inner">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Mis Cuestionarios</h3>
              <p className="text-xs text-blue-200 font-medium">
                Gestión de borradores y cuestionarios enviados por {currentClient.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadQuestionnaires}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-bold">Cargando tus cuestionarios desde Supabase...</p>
            </div>
          ) : questionnaires.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">No tienes cuestionarios guardados aún</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Llena el formulario con la información de tu empresa y haz clic en <strong>Guardar Borrador</strong> o <strong>Enviar al Admin</strong> para conservarlo en tu cuenta.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {questionnaires.map((rec) => {
                const formattedDate = new Date(rec.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={rec.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(rec.status)}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formattedDate}
                        </span>
                        {rec.data?.section3?.attachedFiles && rec.data.section3.attachedFiles.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                            <Paperclip className="w-3 h-3 text-emerald-700" />
                            {rec.data.section3.attachedFiles.length} {rec.data.section3.attachedFiles.length === 1 ? 'Archivo' : 'Archivos'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        {rec.company_name || 'Empresa Sin Nombre'}
                      </h4>

                      <p className="text-xs text-slate-600">
                        <strong>Contacto:</strong> {rec.client_name} ({rec.contact_email || 'Sin correo'})
                      </p>
                    </div>

                    {/* Acciones para el cuestionario */}
                    <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectQuestionnaire(rec.data);
                          onClose();
                          onToast(`Cuestionario de "${rec.company_name}" cargado en el formulario. Puedes editarlo.`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="Cargar este cuestionario en el formulario para editarlo"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Cargar y Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenSummaryForRecord(rec.data)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Ver vista previa de resumen y descargar PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Resumen</span>
                      </button>

                      {rec.status === 'borrador' && (
                        <button
                          type="button"
                          onClick={() => handleSendToAdmin(rec)}
                          disabled={submittingId === rec.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          title="Enviar cuestionario al Administrador para revisión"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingId === rec.id ? 'Enviando...' : 'Enviar al Admin'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Sincronización automática con Supabase activa.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
