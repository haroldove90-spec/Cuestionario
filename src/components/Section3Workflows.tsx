import React from 'react';
import { GitCommit, FileText, Bell, Check } from 'lucide-react';
import { Section3Workflow } from '../types';

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
