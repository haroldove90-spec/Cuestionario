import React from 'react';
import { ShieldCheck, UserCheck, Lock, User, ArrowRight } from 'lucide-react';
import { ClientUser, AdminUser } from '../types';

interface HomeScreenProps {
  onOpenClientAuth: () => void;
  onOpenAdminLogin: () => void;
  onContinueAsClient: (client: ClientUser) => void;
  onContinueAsAdmin: () => void;
  currentClient: ClientUser | null;
  adminUser: AdminUser | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenClientAuth,
  onOpenAdminLogin,
  onContinueAsClient,
  onContinueAsAdmin,
  currentClient,
  adminUser,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* 1. Logo Únicamente (Directo, sin encapsular en tarjetas ni cajas) */}
        <div className="flex flex-col items-center justify-center pt-2">
          <img
            src="https://mexicosignaturetours.com.mx/appdesignlogo.png"
            alt="App Design Logo"
            className="h-16 sm:h-20 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/200x80?text=LOGO';
            }}
          />
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
          <button
            type="button"
            onClick={currentClient ? () => onContinueAsClient(currentClient) : onOpenClientAuth}
            className="group relative flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer text-center"
          >
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
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentClient ? `Sesión: ${currentClient.full_name}` : 'Registrarse o Iniciar Sesión para responder cuestionario'}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>{currentClient ? 'Ir a mi Formulario' : 'Ingresar como Cliente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Tarjeta Rol Admin */}
          <button
            type="button"
            onClick={adminUser ? onContinueAsAdmin : onOpenAdminLogin}
            className="group relative flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer text-center"
          >
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

            <p className="text-xs text-slate-500 leading-relaxed">
              {adminUser ? `Admin: ${adminUser.name}` : 'Panel de control, clientes registrados y cuestionarios'}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>{adminUser ? 'Panel Admin Activo' : 'Ingresar como Admin'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
