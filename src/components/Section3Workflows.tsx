import React, { useState } from 'react';
import { GitCommit, FileText, Bell, Check, Upload, Paperclip, FileSpreadsheet, Image as ImageIcon, Film, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Section3Workflow, AttachedFile } from '../types';
import { uploadFileToSupabaseStorage } from '../lib/supabase';

interface Section3Props {
  data: Section3Workflow;
  onChange: (updated: Section3Workflow) => void;
}

const COMMON_DOCUMENTS = [
  'Cotizaciones en PDF',
  'Notas de remisión / Venta',
  'Facturas electrónicas',
  'Pólizas de garantía / Servicio',
  'Hojas de Excel de seguimiento',
  'Expedientes físicos',
  'Tickets impresos',
  'Órdenes de trabajo / Surtido',
];

const NOTIFICATION_OPTIONS = [
  'WhatsApp',
  'Email',
  'Notificaciones en pantalla del sistema',
  'SMS',
];

export const Section3Workflows: React.FC<Section3Props> = ({ data, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleDocument = (doc: string) => {
    const exists = data.currentDocuments.includes(doc);
    const updated = exists
      ? data.currentDocuments.filter((d) => d !== doc)
      : [...data.currentDocuments, doc];
    onChange({ ...data, currentDocuments: updated });
  };

  const toggleChannel = (channel: string) => {
    const exists = data.notificationChannels.includes(channel);
    const updated = exists
      ? data.notificationChannels.filter((c) => c !== channel)
      : [...data.notificationChannels, channel];
    onChange({ ...data, notificationChannels: updated });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const newAttachments: AttachedFile[] = [...(data.attachedFiles || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await uploadFileToSupabaseStorage(file);
      if (res.success && res.url) {
        newAttachments.push({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name: res.fileName,
          size: res.fileSize,
          type: res.fileType,
          url: res.url,
          uploadedAt: new Date().toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        setUploadError(res.error || 'Error al subir uno de los archivos.');
      }
    }

    onChange({ ...data, attachedFiles: newAttachments });
    setIsUploading(false);
    // Reset file input value
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = (data.attachedFiles || []).filter((f) => f.id !== fileId);
    onChange({ ...data, attachedFiles: updated });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
    if (type.startsWith('video/') || ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) {
      return <Film className="w-5 h-5 text-purple-600 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />;
    }
    if (ext === 'pdf' || type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
    }
    return <Paperclip className="w-5 h-5 text-blue-600 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            3
          </span>
          Sección 3
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Flujo de Trabajo y Procesos Diarios
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Para entender el paso a paso de tu operación habitual y automatizar las partes repetitivas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 3.1 */}
        <div className="space-y-2">
          <label htmlFor="sec3ProcessSteps" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <GitCommit className="w-4 h-4 text-blue-600" />
            ¿Cómo inicia y termina un proceso habitual en tu negocio?
          </label>
          <p className="text-xs text-slate-500">
            Ejemplo en ventas: 1. Entra el cliente → 2. Se le hace cotización → 3. Aprueba → 4. Se cobra anticipo → 5. Se asigna a un técnico → 6. Se entrega y cobra el saldo.
          </p>
          <textarea
            id="sec3ProcessSteps"
            rows={5}
            value={data.dailyProcessSteps}
            onChange={(e) => onChange({ ...data, dailyProcessSteps: e.target.value })}
            placeholder="Describe el paso a paso detallado desde que llega una solicitud o cliente hasta que se concluye la atención..."
            className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs font-mono text-slate-700 placeholder-slate-400 leading-relaxed"
          />
        </div>

        {/* Question 3.2 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileText className="w-4 h-4 text-blue-600" />
            ¿Qué documentos o formatos utilizas hoy en día?
          </label>
          <p className="text-xs text-slate-500">
            Selecciona los formatos que manejan actualmente para integrarlos o digitalizarlos en el nuevo software.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMMON_DOCUMENTS.map((doc) => {
              const selected = data.currentDocuments.includes(doc);
              return (
                <button
                  key={doc}
                  type="button"
                  onClick={() => toggleDocument(doc)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{doc}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec3CustomDocs" className="block text-xs font-bold text-slate-700 mb-1">
              Otros documentos o formatos específicos:
            </label>
            <input
              id="sec3CustomDocs"
              type="text"
              value={data.customDocuments}
              onChange={(e) => onChange({ ...data, customDocuments: e.target.value })}
              placeholder="Ej. Hoja de diagnóstico técnico, contrato de arrendamiento, formato de garantía..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
            />
          </div>

          {/* Subida de Archivos y Documentos de Ejemplo (PDF, Excel, Word, Imágenes, Video) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Adjuntar archivos o documentos de muestra (PDF, Excel, Word, Imágenes, Video):
              </span>
              <span className="text-[11px] font-normal text-slate-500">Guardado directo en Supabase</span>
            </label>

            {/* Dropzone / Upload button */}
            <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-4 text-center transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,image/*,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                title="Haz clic o arrastra aquí tus archivos PDF, Excel, Word, imágenes o video"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600">
                {isUploading ? (
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Subiendo archivo(s) a Supabase Storage...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 bg-white rounded-full shadow-xs border border-blue-100 text-blue-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Haz clic o arrastra tus archivos aquí
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Formatos soportados: PDF, Excel (.xlsx, .csv), Word (.docx), Imágenes (.png, .jpg), Video (.mp4, .webm)
                    </p>
                  </>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-xs font-bold text-rose-600 mt-2 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {uploadError}
              </p>
            )}

            {/* Lista de archivos adjuntos */}
            {data.attachedFiles && data.attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Archivos adjuntados ({data.attachedFiles.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.type, file.name)}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatFileSize(file.size)} • {file.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Ver / Abrir documento"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question 3.3 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Bell className="w-4 h-4 text-blue-600" />
              ¿El sistema requiere enviar notificaciones automatizadas?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.requiresNotifications}
                onChange={(e) => onChange({ ...data, requiresNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {data.requiresNotifications ? 'Sí' : 'No'}
              </span>
            </label>
          </div>

          {data.requiresNotifications && (
            <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 transition-all">
              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1.5">
                  Canales de notificación deseados:
                </label>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_OPTIONS.map((ch) => {
                    const active = data.notificationChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="sec3NotifDetails" className="block text-xs font-bold text-slate-700 mb-1">
                  ¿En qué situaciones se deben enviar? (Ejemplo: Avisos por correo o WhatsApp cuando cambie el estatus de un pedido o cuando haya poco stock):
                </label>
                <textarea
                  id="sec3NotifDetails"
                  rows={2}
                  value={data.notificationDetails}
                  onChange={(e) => onChange({ ...data, notificationDetails: e.target.value })}
                  placeholder="Detalla los eventos desencadenantes de notificaciones..."
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
