import React from 'react';
import { ShieldCheck, UserCheck, Lock, User, ArrowRight, LogOut } from 'lucide-react';
import { ClientUser, AdminUser } from '../types';
import { Logo } from './Logo';

interface HomeScreenProps {
  onOpenClientAuth: () => void;
  onOpenAdminLogin: () => void;
  onContinueAsClient: (client: ClientUser) => void;
  onContinueAsAdmin: () => void;
  onClientLogout: () => void;
  onAdminLogout: () => void;
  currentClient: ClientUser | null;
  adminUser: AdminUser | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenClientAuth,
  onOpenAdminLogin,
  onContinueAsClient,
  onContinueAsAdmin,
  onClientLogout,
  onAdminLogout,
  currentClient,
  adminUser,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* 1. Logo Únicamente (Directo, sin encapsular en nada) */}
        <div className="flex flex-col items-center justify-center pt-2">
          <Logo className="h-16 sm:h-20 w-auto" variant="light" />
        </div>

        {/* Subtítulo discreto de selección de rol */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            Selecciona tu Perfil de Acceso
          </p>
        </div>

        {/* 2. Accesos a los 2 Roles: Icono Admin e Icono Cliente */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Tarjeta Rol Cliente */}
          <div className="group relative flex flex-col items-center justify-between p-6 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 text-center">
            <div className="flex flex-col items-center w-full">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                {currentClient ? (
                  <UserCheck className="w-6 h-6 text-blue-600" />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              
              <h2 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                Acceso Cliente
              </h2>
              
              <p className="text-xs text-slate-500 leading-relaxed min-h-[32px] flex items-center justify-center">
                {currentClient ? `Sesión: ${currentClient.full_name}` : 'Registrarse o Iniciar Sesión para responder cuestionario'}
              </p>
            </div>

            <div className="mt-5 w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={currentClient ? () => onContinueAsClient(currentClient) : onOpenClientAuth}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <span>{currentClient ? 'Ir a mi Formulario' : 'Ingresar como Cliente'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {currentClient && (
                <button
                  type="button"
                  onClick={onClientLogout}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión Cliente</span>
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta Rol Admin */}
          <div className="group relative flex flex-col items-center justify-between p-6 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 text-center">
            <div className="flex flex-col items-center w-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                {adminUser ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Lock className="w-6 h-6 text-emerald-600" />
                )}
              </div>

              <h2 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                Acceso Admin
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed min-h-[32px] flex items-center justify-center">
                {adminUser ? `Admin: ${adminUser.name}` : 'Panel de control, clientes registrados y cuestionarios'}
              </p>
            </div>

            <div className="mt-5 w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={adminUser ? onContinueAsAdmin : onOpenAdminLogin}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <span>{adminUser ? 'Abrir Panel Admin' : 'Ingresar como Admin'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {adminUser && (
                <button
                  type="button"
                  onClick={onAdminLogout}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión Admin</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

