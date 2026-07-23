import React from 'react';
import { ShieldCheck, Lock, User, UserCheck, LogOut } from 'lucide-react';
import { AdminUser, ClientUser } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
  currentClient: ClientUser | null;
  onOpenClientAuth: () => void;
  onClientLogout: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  onOpenAdminDashboard,
  adminUser,
  onAdminLogout,
  currentClient,
  onOpenClientAuth,
  onClientLogout,
  onGoHome,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Logo únicamente (al dar clic regresa al inicio, sin encapsular) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center group cursor-pointer focus:outline-none shrink-0"
          title="Ir al Inicio"
        >
          <Logo className="h-9 sm:h-10 w-auto" variant="light" />
        </button>

        {/* Acceso y Estado de Sesión para Ambos Roles (Cliente y Admin) */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          
          {/* ROL CLIENTE */}
          {currentClient ? (
            <div className="flex items-center gap-1.5 p-1 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-900">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden md:inline text-slate-500 font-normal">Cliente:</span>
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentClient.full_name}</span>
              </div>
              <button
                type="button"
                onClick={onClientLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                title="Cerrar Sesión del Cliente"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenClientAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
              title="Acceso o Registro de Cliente"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Acceso Cliente</span>
            </button>
          )}

          {/* ROL ADMINISTRADOR */}
          {adminUser ? (
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-white">
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:text-white transition-colors cursor-pointer"
                title="Abrir Panel de Control Administrador"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[110px] sm:max-w-[150px]">Panel Admin</span>
              </button>
              <button
                type="button"
                onClick={onAdminLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-300 bg-slate-800 hover:bg-rose-900/50 border border-slate-700 hover:border-rose-700/50 rounded-lg transition-all cursor-pointer"
                title="Cerrar Sesión de Administrador"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Salir Admin</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
              title="Acceso Rol Administrador"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Acceso Admin</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};


