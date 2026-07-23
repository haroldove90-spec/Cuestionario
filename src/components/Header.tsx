import React from 'react';
import { ClipboardList, Sparkles, RotateCcw, Eye, Save, Building2, Database } from 'lucide-react';
import { QuestionnaireData } from '../types';

interface HeaderProps {
  data: QuestionnaireData;
  onChangeClientInfo: (field: string, value: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onSave: () => void;
  onOpenSummary: () => void;
  onOpenSupabaseModal: () => void;
  viewMode: 'wizard' | 'full';
  setViewMode: (mode: 'wizard' | 'full') => void;
  completionPercentage: number;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  onChangeClientInfo,
  onLoadSample,
  onClear,
  onSave,
  onOpenSummary,
  onOpenSupabaseModal,
  viewMode,
  setViewMode,
  completionPercentage,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top bar with branding and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-auto flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1 shadow-xs">
              <img
                src="https://mexicosignaturetours.com.mx/appdesignlogo.png"
                alt="App Design Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image network fails
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  <Building2 className="w-3 h-3" /> App Design • Gestión de Negocio
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  • Avance: {completionPercentage}%
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                Formulario para Desarrollar tu Programa de Gestión de Negocio
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Configuración e integración con Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Supabase / SQL
            </button>

            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Cargar respuestas de ejemplo para probar el formulario"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Cargar Ejemplo
            </button>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Limpiar todas las respuestas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Limpiar
            </button>

            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Guardar estado actual en el navegador"
            >
              <Save className="w-3.5 h-3.5 text-slate-600" />
              Guardar Borrador
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'wizard'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Secciones
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'full'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vista Completa
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenSummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Revisar y Exportar
            </button>
          </div>
        </div>

        {/* Client instruction callout banner matching design HTML */}
        <div className="bg-blue-600/5 border border-blue-100 rounded-2xl p-4 sm:p-5 flex gap-4 items-start shadow-2xs">
          <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-blue-900 font-bold text-xs uppercase tracking-wider">
              Instrucciones para el cliente
            </p>
            <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              Este cuestionario tiene como objetivo conocer a fondo las operaciones de tu empresa para diseñar un software que se adapte exactamente a tus necesidades diarias. No te preocupes por el aspecto técnico; descríbenos tus respuestas con el mayor detalle posible.
            </p>
          </div>
        </div>

        {/* Client & Company Metadata fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div>
            <label htmlFor="companyNameInput" className="block text-xs font-bold text-slate-700 mb-1">Empresa / Negocio</label>
            <input
              id="companyNameInput"
              type="text"
              placeholder="Ej. Autopartes Monterrey"
              value={data.companyName}
              onChange={(e) => onChangeClientInfo('companyName', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors shadow-2xs text-slate-700"
            />
          </div>
          <div>
            <label htmlFor="clientNameInput" className="block text-xs font-bold text-slate-700 mb-1">Nombre del Contacto</label>
            <input
              id="clientNameInput"
              type="text"
              placeholder="Ej. Ing. Carlos Mendoza"
              value={data.clientName}
              onChange={(e) => onChangeClientInfo('clientName', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors shadow-2xs text-slate-700"
            />
          </div>
          <div>
            <label htmlFor="contactEmailInput" className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              id="contactEmailInput"
              type="email"
              placeholder="contacto@empresa.com"
              value={data.contactEmail}
              onChange={(e) => onChangeClientInfo('contactEmail', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors shadow-2xs text-slate-700"
            />
          </div>
          <div>
            <label htmlFor="contactPhoneInput" className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
            <input
              id="contactPhoneInput"
              type="tel"
              placeholder="+52 81 1234 5678"
              value={data.contactPhone}
              onChange={(e) => onChangeClientInfo('contactPhone', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors shadow-2xs text-slate-700"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
