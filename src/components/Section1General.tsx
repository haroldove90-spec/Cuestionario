import React from 'react';
import { Building, Target, AlertTriangle } from 'lucide-react';
import { Section1Company } from '../types';

interface Section1Props {
  data: Section1Company;
  onChange: (field: keyof Section1Company, value: string) => void;
}

export const Section1General: React.FC<Section1Props> = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            1
          </span>
          Sección 1
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Generalidades de la Empresa y Objetivos
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ayúdanos a entender el giro de tu negocio y la meta principal que deseas alcanzar con esta solución.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 1.1 */}
        <div className="space-y-2">
          <label htmlFor="sec1Activity" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Building className="w-4 h-4 text-blue-600" />
            ¿A qué se dedica principalmente la empresa?
          </label>
          <p className="text-xs text-slate-500">
            Ejemplo: Venta de autopartes, prestación de servicios de mantenimiento, gestión de citas en clínica, comercializadora de alimentos, etc.
          </p>
          <textarea
            id="sec1Activity"
            rows={3}
            value={data.mainActivity}
            onChange={(e) => onChange('mainActivity', e.target.value)}
            placeholder="Describe brevemente los productos o servicios principales que ofrecen..."
            className="w-full text-sm p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 placeholder-slate-400 leading-relaxed"
          />
        </div>

        {/* Question 1.2 */}
        <div className="space-y-2">
          <label htmlFor="sec1Objective" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Target className="w-4 h-4 text-blue-600" />
            ¿Cuál es el objetivo principal que buscas al implementar este software?
          </label>
          <p className="text-xs text-slate-500">
            Ejemplo: Dejar de usar Excel, controlar inventario en tiempo real, evitar fugas de dinero, automatizar reportes de venta, dar seguimiento a clientes.
          </p>
          <textarea
            id="sec1Objective"
            rows={3}
            value={data.mainObjective}
            onChange={(e) => onChange('mainObjective', e.target.value)}
            placeholder="¿Qué resultado clave deseas obtener al poner en marcha el sistema?..."
            className="w-full text-sm p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 placeholder-slate-400 leading-relaxed"
          />
        </div>

        {/* Question 1.3 */}
        <div className="space-y-2">
          <label htmlFor="sec1PainPoints" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            ¿Qué problemas o &quot;dolores de cabeza&quot; diarios esperas resolver con este programa?
          </label>
          <p className="text-xs text-slate-500">
            Ejemplo: Pérdida de tiempo haciendo cotizaciones a mano, errores al cobrar, falta de certeza en el stock disponible, lentitud en los cierres de caja.
          </p>
          <textarea
            id="sec1PainPoints"
            rows={3}
            value={data.painPoints}
            onChange={(e) => onChange('painPoints', e.target.value)}
            placeholder="Menciona las dificultades o fricciones más molestas en la rutina actual de tu equipo..."
            className="w-full text-sm p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 placeholder-slate-400 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
