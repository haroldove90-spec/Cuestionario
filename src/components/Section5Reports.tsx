import React from 'react';
import { LayoutDashboard, FileSpreadsheet, Check, Download } from 'lucide-react';
import { Section5Reports as Section5Type } from '../types';

interface Section5Props {
  data: Section5Type;
  onChange: (updated: Section5Type) => void;
}

const DASHBOARD_WIDGET_SUGGESTIONS = [
  'Ventas del día / mes',
  'Productos más vendidos',
  'Cuentas por cobrar',
  'Alertas de stock bajo / reposición',
  'Proyectos o pedidos pendientes',
  'Utilidad estimada',
  'Clientes nuevos vs. frecuentes',
  'Corte de caja en tiempo real',
];

const REPORT_SUGGESTIONS = [
  'Reporte de ventas semanales/mensuales',
  'Desglose por vendedor / comisiones',
  'Kardex de movimientos de inventario',
  'Exportar facturas o notas',
  'Cuentas por cobrar y antigüedad de saldos',
  'Resumen de compras a proveedores',
  'Gastos operativos desglosados',
];

const EXPORT_FORMAT_OPTIONS = ['PDF', 'Excel (XLSX)', 'CSV', 'Impresión Directa'];

export const Section5Reports: React.FC<Section5Props> = ({ data, onChange }) => {
  const toggleWidget = (widget: string) => {
    const exists = data.dashboardWidgets.includes(widget);
    const updated = exists
      ? data.dashboardWidgets.filter((w) => w !== widget)
      : [...data.dashboardWidgets, widget];
    onChange({ ...data, dashboardWidgets: updated });
  };

  const toggleReport = (report: string) => {
    const exists = data.requiredReports.includes(report);
    const updated = exists
      ? data.requiredReports.filter((r) => r !== report)
      : [...data.requiredReports, report];
    onChange({ ...data, requiredReports: updated });
  };

  const toggleFormat = (fmt: string) => {
    const exists = data.exportFormats.includes(fmt);
    const updated = exists
      ? data.exportFormats.filter((f) => f !== fmt)
      : [...data.exportFormats, fmt];
    onChange({ ...data, exportFormats: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            5
          </span>
          Sección 5
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Reportes y Métricas Clave (Dashboard)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Para definir la información ejecutiva necesaria para tomar decisiones rápidas e informadas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 5.1 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            Cuando entras al sistema, ¿qué gráficas o números te gustaría ver en la pantalla principal (Dashboard)?
          </label>
          <p className="text-xs text-slate-500">
            Selecciona las métricas clave e indicadores de rendimiento que deseas visualizar de un vistazo.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DASHBOARD_WIDGET_SUGGESTIONS.map((widget) => {
              const selected = data.dashboardWidgets.includes(widget);
              return (
                <button
                  key={widget}
                  type="button"
                  onClick={() => toggleWidget(widget)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{widget}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec5CustomDashboardWidgets" className="block text-xs font-bold text-slate-700 mb-1">
              Otras métricas o indicadores específicos para el Dashboard:
            </label>
            <input
              id="sec5CustomDashboardWidgets"
              type="text"
              value={data.customDashboardWidgets}
              onChange={(e) => onChange({ ...data, customDashboardWidgets: e.target.value })}
              placeholder="Ej. Comparativa anual de ventas, ranking de vendedores, tiempo promedio de atención..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
            />
          </div>
        </div>

        {/* Question 5.2 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            ¿Qué reportes específicos necesitas generar o descargar?
          </label>
          <p className="text-xs text-slate-500">
            Selecciona los informes periódicos indispensables para la contabilidad, administración o gerencia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {REPORT_SUGGESTIONS.map((report) => {
              const selected = data.requiredReports.includes(report);
              return (
                <button
                  key={report}
                  type="button"
                  onClick={() => toggleReport(report)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{report}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec5CustomReports" className="block text-xs font-bold text-slate-700 mb-1">
              Otros reportes personalizados requeridos:
            </label>
            <textarea
              id="sec5CustomReports"
              rows={2}
              value={data.customReports}
              onChange={(e) => onChange({ ...data, customReports: e.target.value })}
              placeholder="Describe reportes adicionales con filtros específicos (por sucursal, por fecha, por tipo de cliente)..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Formatos de exportación requeridos:
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPORT_FORMAT_OPTIONS.map((fmt) => {
                const active = data.exportFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
