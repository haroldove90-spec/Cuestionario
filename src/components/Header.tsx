import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  adminUser: AdminUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  onOpenAdminDashboard,
  adminUser,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo únicamente */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-auto flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1 shadow-2xs">
            <img
              src="https://mexicosignaturetours.com.mx/appdesignlogo.png"
              alt="App Design Logo"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
            App Design
          </span>
        </div>

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
              title="Acceso Rol Administrador (Ver Cuestionarios, Métricas, Notificaciones)"
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
