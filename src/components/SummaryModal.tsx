import React, { useState } from 'react';
import { X, Copy, Download, Printer, CheckCircle, FileText, Building2, User, Phone, Mail, Calendar } from 'lucide-react';
import { QuestionnaireData } from '../types';

interface SummaryModalProps {
  data: QuestionnaireData;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  data,
  isOpen,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = (): string => {
    return `# CUESTIONARIO PARA EL DISEÑO DE SISTEMA DE GESTIÓN

**Empresa / Negocio:** ${data.companyName || 'Sin especificar'}
**Contacto:** ${data.clientName || 'Sin especificar'}
**Correo:** ${data.contactEmail || 'Sin especificar'}
**Teléfono / WhatsApp:** ${data.contactPhone || 'Sin especificar'}
**Fecha de registro:** ${data.dateSubmitted || new Date().toISOString().split('T')[0]}

---

## 1. GENERALIDADES DE LA EMPRESA Y OBJETIVOS

* **Giro Principal:**
${data.section1.mainActivity || 'No especificado'}

* **Objetivo Principal:**
${data.section1.mainObjective || 'No especificado'}

* **Problemas / Dolores de Cabeza a Resolver:**
${data.section1.painPoints || 'No especificado'}

---

## 2. ESTRUCTURA DE USUARIOS, ROLES Y PERMISOS

* **Total de Usuarios Estimados:** ${data.section2.totalUsers || 'No especificado'}

* **Definición de Roles y Funciones:**
${data.section2.rolesList
  .map(
    (role, idx) =>
      `  ${idx + 1}. **Rol:** ${role.roleName || 'Sin nombre'}\n     * **Funciones:** ${
        role.functions || 'Sin especificar'
      }`
  )
  .join('\n\n')}

* **Restricciones de Seguridad:**
${data.section2.securityRestrictions || 'Ninguna especificada'}

---

## 3. FLUJO DE TRABAJO Y PROCESOS DIARIOS

* **Paso a Paso del Proceso Habitual:**
${data.section3.dailyProcessSteps || 'No especificado'}

* **Documentos / Formatos Actuales:**
${
  data.section3.currentDocuments.length > 0
    ? data.section3.currentDocuments.map((doc) => `  - ${doc}`).join('\n')
    : '  - Ninguno seleccionado'
}
${data.section3.customDocuments ? `  - Otros: ${data.section3.customDocuments}` : ''}

* **Notificaciones Automatizadas:** ${data.section3.requiresNotifications ? 'SÍ' : 'NO'}
${
  data.section3.requiresNotifications
    ? `  - Canales: ${data.section3.notificationChannels.join(', ') || 'Sin seleccionar'}\n  - Eventos: ${
        data.section3.notificationDetails || 'No detallado'
      }`
    : ''
}

---

## 4. MANEJO DE INFORMACIÓN Y DATOS

* **Manejo de Inventario / Catálogo:** ${data.section4.handlesInventory ? 'SÍ' : 'NO'}
${
  data.section4.handlesInventory
    ? `  - Cantidad Aprox de Productos/Servicios: ${data.section4.approxProducts || 'No especificado'}\n  - ¿Tiene variaciones/códigos?: ${
        data.section4.hasVariations ? 'SÍ' : 'NO'
      }\n  - Detalle variaciones: ${data.section4.variationDetails || 'N/A'}`
    : ''
}

* **Datos de Clientes a Registrar:**
${
  data.section4.clientFields.length > 0
    ? data.section4.clientFields.map((f) => `  - ${f}`).join('\n')
    : '  - Ninguno seleccionado'
}
${data.section4.customClientFields ? `  - Campos adicionales: ${data.section4.customClientFields}` : ''}

* **Registro de Proveedores, Compras y Gastos:** ${
      data.section4.trackExpensesAndSuppliers ? 'SÍ' : 'NO'
    }
${
  data.section4.trackExpensesAndSuppliers
    ? `  - Detalle: ${data.section4.expenseSupplierDetails || 'No detallado'}`
    : ''
}

---

## 5. REPORTES Y MÉTRICAS CLAVE (DASHBOARD)

* **Métricas Deseadas en Dashboard:**
${
  data.section5.dashboardWidgets.length > 0
    ? data.section5.dashboardWidgets.map((w) => `  - ${w}`).join('\n')
    : '  - Ninguna seleccionada'
}
${data.section5.customDashboardWidgets ? `  - Otras: ${data.section5.customDashboardWidgets}` : ''}

* **Reportes Específicos Requeridos:**
${
  data.section5.requiredReports.length > 0
    ? data.section5.requiredReports.map((r) => `  - ${r}`).join('\n')
    : '  - Ninguno seleccionado'
}
${data.section5.customReports ? `  - Otros: ${data.section5.customReports}` : ''}

* **Formatos de Exportación:** ${data.section5.exportFormats.join(', ') || 'No especificados'}

---

## 6. INTEGRACIONES Y ASPECTOS TÉCNICOS

* **Dispositivos Principales:** ${data.section6.primaryDevices.join(', ') || 'No especificados'}
${data.section6.customDevices ? `  - Detalles de pantalla: ${data.section6.customDevices}` : ''}

* **Integraciones Requeridas:**
${
  data.section6.requiredIntegrations.length > 0
    ? data.section6.requiredIntegrations.map((i) => `  - ${i}`).join('\n')
    : '  - Ninguna seleccionada'
}
${data.section6.customIntegrations ? `  - Otras: ${data.section6.customIntegrations}` : ''}

* **Base de Datos / Excel Existente para Migración:** ${
      data.section6.hasExistingData ? 'SÍ' : 'NO'
    }
${
  data.section6.hasExistingData
    ? `  - Detalle de información existente: ${data.section6.existingDataDetails || 'No detallado'}`
    : ''
}
`;
  };

  const handleCopyMarkdown = () => {
    const text = generateMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast('Resumen en formato texto/markdown copiado al portapapeles');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = `cuestionario-${(data.companyName || 'empresa')
      .toLowerCase()
      .replace(/\s+/g, '-')}-${data.dateSubmitted}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`Archivo JSON descargado: ${fileName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                Resumen del Cuestionario de Requerimientos
              </h3>
              <p className="text-xs text-slate-400">
                {data.companyName ? `Empresa: ${data.companyName}` : 'Revisa las respuestas recopiladas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Texto'}
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar JSON
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Content */}
        <div id="printableSummary" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm leading-relaxed">
          {/* Metadata banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Empresa</span>
                <span className="font-bold text-slate-900">{data.companyName || 'Sin especificar'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contacto</span>
                <span className="font-bold text-slate-900">{data.clientName || 'Sin especificar'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Correo</span>
                <span className="font-bold text-slate-900 truncate">{data.contactEmail || 'Sin especificar'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono</span>
                <span className="font-bold text-slate-900">{data.contactPhone || 'Sin especificar'}</span>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2.5 border-b border-slate-100 pb-5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">1</span>
              Generalidades de la Empresa y Objetivos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Giro Principal:</span>
                <p className="text-slate-700 whitespace-pre-wrap">{data.section1.mainActivity || 'No especificado'}</p>
              </div>
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Objetivo Principal:</span>
                <p className="text-slate-700 whitespace-pre-wrap">{data.section1.mainObjective || 'No especificado'}</p>
              </div>
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Dolores de Cabeza a Resolver:</span>
                <p className="text-slate-700 whitespace-pre-wrap">{data.section1.painPoints || 'No especificado'}</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5 border-b border-slate-100 pb-5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">2</span>
              Estructura de Usuarios y Roles ({data.section2.totalUsers || 'Total no especificado'})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {data.section2.rolesList.map((role) => (
                <div key={role.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-950 block text-xs mb-1">{role.roleName}</span>
                  <p className="text-slate-600">{role.functions || 'Sin funciones registradas'}</p>
                </div>
              ))}
            </div>

            {data.section2.securityRestrictions && (
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 mt-2">
                <span className="font-bold block mb-0.5">Restricciones de seguridad por rol:</span>
                <p className="whitespace-pre-wrap">{data.section2.securityRestrictions}</p>
              </div>
            )}
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5 border-b border-slate-100 pb-5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">3</span>
              Flujo de Trabajo y Procesos Diarios
            </h4>
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800">
              {data.section3.dailyProcessSteps || 'No se detallaron pasos del proceso'}
            </div>

            <div className="flex flex-wrap gap-2 text-xs pt-1 items-center">
              <span className="font-bold text-slate-800">Documentos actuales:</span>
              {data.section3.currentDocuments.map((doc) => (
                <span key={doc} className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 font-semibold">
                  {doc}
                </span>
              ))}
              {data.section3.customDocuments && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  {data.section3.customDocuments}
                </span>
              )}
            </div>

            {data.section3.requiresNotifications && (
              <div className="text-xs text-slate-700 pt-1">
                <span className="font-bold text-slate-900">Notificaciones:</span> Canales ({data.section3.notificationChannels.join(', ')}). {data.section3.notificationDetails}
              </div>
            )}
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5 border-b border-slate-100 pb-5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">4</span>
              Manejo de Información y Datos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Catálogo e Inventario:</span>
                <p className="text-slate-700">
                  {data.section4.handlesInventory
                    ? `Maneja inventario (${data.section4.approxProducts || 'Aprox no especificado'}). ${
                        data.section4.hasVariations ? `Variaciones: ${data.section4.variationDetails}` : ''
                      }`
                    : 'No requiere manejo de inventario'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Datos de Clientes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.section4.clientFields.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700">
                      {f}
                    </span>
                  ))}
                  {data.section4.customClientFields && (
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-md text-[11px] font-bold">
                      {data.section4.customClientFields}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {data.section4.trackExpensesAndSuppliers && (
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Proveedores y Gastos:</span>
                <p className="text-slate-700">{data.section4.expenseSupplierDetails}</p>
              </div>
            )}
          </section>

          {/* Section 5 & 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">5</span>
                Dashboard y Reportes
              </h4>
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Métricas Dashboard:</span>
                  <p className="text-slate-700">{data.section5.dashboardWidgets.join(', ')}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Reportes Requeridos:</span>
                  <p className="text-slate-700">{data.section5.requiredReports.join(', ')}</p>
                </div>
              </div>
            </section>

            <section className="space-y-2.5">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">6</span>
                Aspectos Técnicos e Integraciones
              </h4>
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Dispositivos:</span>
                  <p className="text-slate-700">{data.section6.primaryDevices.join(', ')}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Integraciones:</span>
                  <p className="text-slate-700">{data.section6.requiredIntegrations.join(', ')}</p>
                </div>
                {data.section6.hasExistingData && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Migración de Datos:</span>
                    <p className="text-slate-700">{data.section6.existingDataDetails}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>
            Documento listo para enviar al equipo de desarrollo de software.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};
