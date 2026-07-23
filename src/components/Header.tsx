import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { AdminUser } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  adminUser: AdminUser | null;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  onOpenAdminDashboard,
  adminUser,
  onGoHome,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Logo únicamente (al dar clic regresa al inicio, sin encapsular) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center group cursor-pointer focus:outline-none shrink-0"
          title="Ir al Inicio"
        >
          <Logo className="h-9 sm:h-10 w-auto" variant="light" />
        </button>

        {/* Acceso al Rol Admin únicamente */}
        <div className="flex items-center gap-2">
          {adminUser ? (
            <button
              type="button"
              onClick={onOpenAdminDashboard}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md border border-slate-700 transition-all cursor-pointer"
              title="Abrir Panel de Control Administrador"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Panel Admin Activo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl transition-all cursor-pointer"
              title="Acceso Rol Administrador"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Acceso Rol Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

