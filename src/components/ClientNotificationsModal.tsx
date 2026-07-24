import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Clock, Check, RefreshCw, FileText } from 'lucide-react';
import { AppNotification, ClientUser } from '../types';
import {
  fetchClientNotificationsFromSupabase,
  markClientNotificationReadInSupabase,
} from '../lib/supabase';

interface ClientNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: ClientUser;
}

export const ClientNotificationsModal: React.FC<ClientNotificationsModalProps> = ({
  isOpen,
  onClose,
  currentClient,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentClient?.email) {
      loadNotifs();
      const interval = setInterval(() => {
        loadNotifs(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentClient]);

  const loadNotifs = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    const notifs = await fetchClientNotificationsFromSupabase(currentClient.email);
    setNotifications(notifs);
    if (!isBackground) setIsLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await markClientNotificationReadInSupabase(id, currentClient.email);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Notificaciones de tu Cuestionario</h3>
              <p className="text-[11px] text-slate-400">Cliente: {currentClient.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadNotifs}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Actualizar notificaciones"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {notifications.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Sin notificaciones pendientes</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Cuando el equipo administrador consulte o actualice el estado de verificación de tu cuestionario, recibirás avisos aquí.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  notif.read
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-blue-50/90 border-blue-200 text-blue-950 shadow-2xs font-medium'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${notif.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white'}`}>
                  {notif.type === 'status_change' ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(notif.created_at).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>

                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                    title="Marcar como leída"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
