import React from 'react';
import { Laptop, Cpu, Database, Check } from 'lucide-react';
import { Section6Technical as Section6Type } from '../types';

interface Section6Props {
  data: Section6Type;
  onChange: (updated: Section6Type) => void;
}

const DEVICE_OPTIONS = [
  'Computadora de escritorio / Laptop',
  'Tableta / Dispositivo móvil',
  'Terminales de punto de venta (POS)',
];

const INTEGRATION_OPTIONS = [
  'Facturación electrónica SAT (CFDI 4.0)',
  'Lector de código de barras',
  'Impresora térmica de tickets',
  'Pasarelas de pago (Stripe, Mercado Pago, Terminal bancaria)',
  'WhatsApp Business API',
  'Tienda en línea / E-commerce (Shopify, WooCommerce)',
  'Correo electrónico SMTP',
];

export const Section6Tech: React.FC<Section6Props> = ({ data, onChange }) => {
  const toggleDevice = (dev: string) => {
    const exists = data.primaryDevices.includes(dev);
    const updated = exists
      ? data.primaryDevices.filter((d) => d !== dev)
      : [...data.primaryDevices, dev];
    onChange({ ...data, primaryDevices: updated });
  };

  const toggleIntegration = (integ: string) => {
    const exists = data.requiredIntegrations.includes(integ);
    const updated = exists
      ? data.requiredIntegrations.filter((i) => i !== integ)
      : [...data.requiredIntegrations, integ];
    onChange({ ...data, requiredIntegrations: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            6
          </span>
          Sección 6
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Integraciones y Aspectos Técnicos
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Para asegurar la compatibilidad con tu hardware, software de terceros y migración de datos existentes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 6.1 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Laptop className="w-4 h-4 text-blue-600" />
            ¿El sistema se usará principalmente desde computadoras, laptops o dispositivos móviles/tabletas?
          </label>
          <p className="text-xs text-slate-500">
            Selecciona los dispositivos principales desde donde accederá tu personal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEVICE_OPTIONS.map((dev) => {
              const selected = data.primaryDevices.includes(dev);
              return (
                <button
                  key={dev}
                  type="button"
                  onClick={() => toggleDevice(dev)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{dev}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec6CustomDevices" className="block text-xs font-bold text-slate-700 mb-1">
              Detalles sobre pantallas o movilidad requerida:
            </label>
            <input
              id="sec6CustomDevices"
              type="text"
              value={data.customDevices}
              onChange={(e) => onChange({ ...data, customDevices: e.target.value })}
              placeholder="Ej. Los vendedores usarán tabletas en piso de venta, la cajera usará PC fija con pantalla táctil..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
            />
          </div>
        </div>

        {/* Question 6.2 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Cpu className="w-4 h-4 text-blue-600" />
            ¿Necesitas conectarlo o integrarlo con alguna otra herramienta o periférico?
          </label>
          <p className="text-xs text-slate-500">
            Hardware o plataformas de software existentes que debamos integrar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {INTEGRATION_OPTIONS.map((integ) => {
              const selected = data.requiredIntegrations.includes(integ);
              return (
                <button
                  key={integ}
                  type="button"
                  onClick={() => toggleIntegration(integ)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{integ}</span>
                  {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="sec6CustomIntegrations" className="block text-xs font-bold text-slate-700 mb-1">
              Otras herramientas o sistemas heredados a conectar:
            </label>
            <input
              id="sec6CustomIntegrations"
              type="text"
              value={data.customIntegrations}
              onChange={(e) => onChange({ ...data, customIntegrations: e.target.value })}
              placeholder="Ej. Báscula digital por puerto serie, sistema contable Aspel/CONTPAQi..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700"
            />
          </div>
        </div>

        {/* Question 6.3 */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Database className="w-4 h-4 text-blue-600" />
              ¿Cuentas actualmente con alguna base de datos o archivo en Excel para migrar?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasExistingData}
                onChange={(e) => onChange({ ...data, hasExistingData: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {data.hasExistingData ? 'Sí' : 'No'}
              </span>
            </label>
          </div>

          {data.hasExistingData && (
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
              <label htmlFor="sec6ExistingDataDetails" className="block text-xs font-bold text-slate-800 mb-1">
                Describe la información actual disponible para carga inicial:
              </label>
              <textarea
                id="sec6ExistingDataDetails"
                rows={3}
                value={data.existingDataDetails}
                onChange={(e) => onChange({ ...data, existingDataDetails: e.target.value })}
                placeholder="Ej. Archivo Excel con 1,200 clientes (Nombre, Teléfono, RFC) y un catálogo de 3,000 productos con precios y códigos de barra..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
