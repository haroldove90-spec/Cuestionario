import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4.5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border border-slate-800 animate-slide-up">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white font-bold cursor-pointer transition-colors text-base"
      >
        ×
      </button>
    </div>
  );
};
