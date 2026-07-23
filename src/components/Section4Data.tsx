import React from 'react';
import { Package, Contact, DollarSign, Check } from 'lucide-react';
import { Section4Data as Section4Type } from '../types';

interface Section4Props {
  data: Section4Type;
  onChange: (updated: Section4Type) => void;
}

const COMMON_CLIENT_FIELDS = [
  'Nombre / Razon Social',
  'RFC / Identificación',
  'Teléfono',
  'Correo electrónico',
  'Dirección fiscal / envío',
  'Historial de Compras',
  'Documentos adjuntos',
  'Límite / Días de Crédito',
  'Categoría de Cliente',
];

export const Section4Data: React.FC<Section4Props> = ({ data, onChange }) => {
  const toggleClientField = (field: string) => {
    const exists = data.clientFields.includes(field);
    const updated = exists
      ? data.clientFields.filter((f) => f !== field)
      : [...data.clientFields, field];
    onChange({ ...data, clientFields: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            4
          </span>
          Sección 4
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Manejo de Información y Datos
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Para saber qué datos debemos capturar, organizar y almacenar en la base de datos.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 4.1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Package className="w-4 h-4 text-blue-600" />
              ¿Manejas inventario o catálogo de productos/servicios?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.handlesInventory}
                onChange={(e) => onChange({ ...data, handlesInventory: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {data.handlesInventory ? 'Sí' : 'No'}
              </span>
            </label>
          </div>

          {data.handlesInventory && (
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label htmlFor="sec4ApproxProducts" className="block text-xs font-bold text-slate-800 mb-1">
                  ¿Cuántos productos o servicios manejas aproximadamente?
                </label>
                <input
                  id="sec4ApproxProducts"
                  type="text"
                  value={data.approxProducts}
                  onChange={(e) => onChange({ ...data, approxProducts: e.target.value })}
                  placeholder="Ej. Aprox 500 productos y 15 servicios diferentes"
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasVariationsCheck"
                    checked={data.hasVariations}
                    onChange={(e) => onChange({ ...data, hasVariations: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="hasVariationsCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    ¿Tienen códigos, categorías o variaciones (tallas, colores, marcas, modelos, ubicaciones)?
                  </label>
                </div>

                {data.hasVariations && (
                  <textarea
                    rows={2}
                    value={data.variationDetails}
                    onChange={(e) => onChange({ ...data, variationDetails: e.target.value })}
                    placeholder="Describe las variaciones (Ej. Tallas S/M/L, colores, marca de fabricante, código de barras, ubicación en bodega)..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question 4.2 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Contact className="w-4 h-4 text-blue-600" />
            ¿Qué información necesitas registrar de tus clientes?
          </label>
          <p className="text-xs text-slate-500">
            Selecciona los campos obligatorios u opcionales que debe incluir el expediente de cada cliente.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_CLIENT_FIELDS.map((field) => {
              const selected = data.clientFields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleClientField(field)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{field}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec4CustomClientFields" className="block text-xs font-bold text-slate-700 mb-1">
              Campos adicionales personalizados para clientes:
            </label>
            <input
              id="sec4CustomClientFields"
              type="text"
              value={data.customClientFields}
              onChange={(e) => onChange({ ...data, customClientFields: e.target.value })}
              placeholder="Ej. Modelo de automóvil, fecha de cumpleaños, contacto de emergencia, vendedor asignado..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
            />
          </div>
        </div>

        {/* Question 4.3 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <DollarSign className="w-4 h-4 text-blue-600" />
              ¿Necesitas registrar proveedores, compras o gastos operativos?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.trackExpensesAndSuppliers}
                onChange={(e) => onChange({ ...data, trackExpensesAndSuppliers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {data.trackExpensesAndSuppliers ? 'Sí' : 'No'}
              </span>
            </label>
          </div>

          {data.trackExpensesAndSuppliers && (
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
              <label htmlFor="sec4ExpenseDetails" className="block text-xs font-bold text-slate-800 mb-1">
                Detalles del registro de compras y gastos:
              </label>
              <textarea
                id="sec4ExpenseDetails"
                rows={2}
                value={data.expenseSupplierDetails}
                onChange={(e) => onChange({ ...data, expenseSupplierDetails: e.target.value })}
                placeholder="Ej. Registro de facturas de compra, días de crédito con proveedores, gastos fijos mensuales (renta, luz, nómina)..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
