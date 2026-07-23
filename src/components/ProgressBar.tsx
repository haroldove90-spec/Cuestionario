import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentSection: number;
  completedSections: boolean[];
  completionPercentage: number;
  onSelectSection: (index: number) => void;
  sectionTitles: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentSection,
  completedSections,
  completionPercentage,
  onSelectSection,
  sectionTitles,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Progreso del Cuestionario
          </span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
            {completionPercentage}% Completado
          </span>
        </div>

        {/* Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Section Pill Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {sectionTitles.map((title, idx) => {
            const isCurrent = currentSection === idx;
            const isCompleted = completedSections[idx];

            return (
              <button
                key={title}
                type="button"
                onClick={() => onSelectSection(idx)}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between gap-1.5 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/80 font-bold text-blue-900 shadow-2xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-slate-800 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="truncate">
                  <span className={`text-[10px] uppercase block font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                    Sección {idx + 1}
                  </span>
                  <span className="truncate block font-medium">
                    {title.split('. ')[1] || title}
                  </span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
