import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  BarChart3,
  Bell,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  LogOut,
  Building2,
  Mail,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Download,
  Printer,
  Sparkles,
  PieChart,
  HardDrive,
  Smartphone,
  BellRing,
  Edit3,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  fetchResponsesFromSupabase,
  updateResponseStatusInSupabase,
  deleteResponseFromSupabase,
  fetchNotificationsFromSupabase,
  markNotificationReadInSupabase,
  saveLocalResponses,
  saveLocalNotifications,
  fetchClientsFromSupabase,
} from '../lib/supabase';
import { QuestionnaireResponseRecord, AppNotification, AdminUser, QuestionnaireData, ClientUser } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser;
  onLogout: () => void;
  onSuccessToast: (msg: string) => void;
  sampleQuestionnaireData: QuestionnaireData;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onLogout,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'responses' | 'clients' | 'metrics' | 'notifications'>('clients');
  const [responses, setResponses] = useState<QuestionnaireResponseRecord[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Selected response for inspection
  const [selectedRecord, setSelectedRecord] = useState<QuestionnaireResponseRecord | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);

    // Fetch questionnaires and clients from Supabase
    const fetchedResponses = await fetchResponsesFromSupabase();
    const fetchedClients = await fetchClientsFromSupabase();
    const fetchedNotifs = await fetchNotificationsFromSupabase();

    setResponses(fetchedResponses);
    setClients(fetchedClients);
    setNotifications(fetchedNotifs);

    setIsLoading(false);
  };


  if (!isOpen) return null;

  // Filtered responses list
  const filteredResponses = responses.filter((r) => {
    const matchesSearch =
      r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact_phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    id: string,
    newStatus: QuestionnaireResponseRecord['status']
  ) => {
    const updated = responses.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setResponses(updated);
    saveLocalResponses(updated);

    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord({ ...selectedRecord, status: newStatus });
    }

    await updateResponseStatusInSupabase(id, newStatus);
    onSuccessToast(`Estado actualizado a: ${newStatus.toUpperCase()}`);
  };

  const handleSaveNotes = async () => {
    if (!selectedRecord) return;
    const updated = responses.map((r) =>
      r.id === selectedRecord.id ? { ...r, notes: editingNotes } : r
    );
    setResponses(updated);
    saveLocalResponses(updated);
    setSelectedRecord({ ...selectedRecord, notes: editingNotes });

    await updateResponseStatusInSupabase(selectedRecord.id, selectedRecord.status, editingNotes);
    onSuccessToast('Notas internas guardadas correctamente.');
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cuestionario recibido?')) return;

    const updated = responses.filter((r) => r.id !== id);
    setResponses(updated);
    saveLocalResponses(updated);

    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }

    await deleteResponseFromSupabase(id);
    onSuccessToast('Cuestionario eliminado.');
  };

  const handleMarkNotifRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveLocalNotifications(updated);
    await markNotificationReadInSupabase(id);
  };

  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveLocalNotifications(updated);
    onSuccessToast('Todas las notificaciones marcadas como leídas.');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Compute Metrics Data
  const totalCount = responses.length;
  const newCount = responses.filter((r) => r.status === 'nuevo').length;
  const inReviewCount = responses.filter((r) => r.status === 'en_revision').length;
  const approvedCount = responses.filter((r) => r.status === 'aprobado').length;
  const completedCount = responses.filter((r) => r.status === 'completado').length;

  // Calculate top requested features across responses
  const featureStats = {
    inventory: responses.filter((r) => r.data?.section4?.handlesInventory).length,
    notifications: responses.filter((r) => r.data?.section3?.requiresNotifications).length,
    expenses: responses.filter((r) => r.data?.section4?.trackExpensesAndSuppliers).length,
    existingData: responses.filter((r) => r.data?.section6?.hasExistingData).length,
  };

  const getStatusBadge = (status: QuestionnaireResponseRecord['status']) => {
    switch (status) {
      case 'nuevo':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Nuevo</span>;
      case 'en_revision':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">En Revisión</span>;
      case 'aprobado':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Aprobado</span>;
      case 'completado':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Completado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">Enviado</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col w-full h-full min-h-screen overflow-hidden animate-fade-in">
      {/* Top Header Bar (Full Width) */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="https://mexicosignaturetours.com.mx/appdesignlogo.png"
            alt="App Design Logo"
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">Panel de Control Administrador</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                ADMIN ACTIVO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sesión iniciada como: <strong className="text-slate-200">{adminUser.name}</strong> ({adminUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Recargar datos desde Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold rounded-xl text-xs border border-rose-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer ml-1"
          >
            <X className="w-4 h-4" /> Regresar al Inicio
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white px-4 sm:px-8 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0 shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'clients'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Registro de Clientes</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold">
              {clients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'responses'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Cuestionarios Recibidos</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-extrabold">
              {responses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Métricas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Supabase Sincronizado</span>
        </div>
      </div>

      {/* Full-Screen Tab Contents Container */}
      <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50 w-full max-w-7xl mx-auto space-y-6">
        {/* TAB 0: REGISTRO DE CLIENTES */}
          {activeTab === 'clients' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Buscar cliente por nombre, email o whatsapp..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  Total Clientes Registrados: <span className="text-blue-700">{clients.length}</span>
                </div>
              </div>

              {clients.filter(
                (c) =>
                  c.full_name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                  c.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                  c.whatsapp?.includes(clientSearchTerm)
              ).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No hay clientes registrados aún</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Los clientes que se registren en el sistema para contestar su cuestionario aparecerán listados aquí.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Correo Electrónico</th>
                          <th className="px-4 py-3">WhatsApp</th>
                          <th className="px-4 py-3">Fecha de Registro</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {clients
                          .filter(
                            (c) =>
                              c.full_name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              c.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                              c.whatsapp?.includes(clientSearchTerm)
                          )
                          .map((client) => {
                            const clientResponse = responses.find(
                              (r) =>
                                r.contact_email?.toLowerCase() === client.email?.toLowerCase() ||
                                r.client_name?.toLowerCase() === client.full_name?.toLowerCase()
                            );
                            return (
                              <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                      {client.full_name ? client.full_name.charAt(0).toUpperCase() : 'C'}
                                    </div>
                                    <span className="font-bold text-slate-900">{client.full_name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{client.email}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{client.whatsapp}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {new Date(client.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {clientResponse ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedRecord(clientResponse);
                                        setEditingNotes(clientResponse.notes || '');
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Ver Cuestionario
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                                      Cuestionario pendiente
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: CUESTIONARIOS RECIBIDOS */}
          {activeTab === 'responses' && (

            <div className="space-y-5">
              {/* Filter and Search Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empresa, cliente, email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 shrink-0">Filtrar:</span>
                  {(['todos', 'nuevo', 'en_revision', 'aprobado', 'completado'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'todos' ? 'Todos' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / Card List */}
              {filteredResponses.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No se encontraron cuestionarios</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Los clientes llenarán el formulario y sus respuestas aparecerán aquí automáticamente sincronizadas con Supabase.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredResponses.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(rec.status)}
                          <h4 className="font-bold text-slate-900 text-base">
                            {rec.company_name || 'Empresa Sin Nombre'}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            • {new Date(rec.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{rec.client_name || 'Cliente no asignado'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.contact_email || 'Sin correo'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.contact_phone || 'Sin teléfono'}</span>
                          </div>
                        </div>

                        {rec.notes && (
                          <p className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 font-medium">
                            <strong className="font-bold">Nota Admin:</strong> {rec.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <select
                          value={rec.status}
                          onChange={(e) => handleUpdateStatus(rec.id, e.target.value as any)}
                          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 outline-none cursor-pointer"
                        >
                          <option value="nuevo">Marca: Nuevo</option>
                          <option value="en_revision">Marca: En Revisión</option>
                          <option value="aprobado">Marca: Aprobado</option>
                          <option value="completado">Marca: Completado</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecord(rec);
                            setEditingNotes(rec.notes || '');
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" /> Inspeccionar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteResponse(rec.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MÉTRICAS Y ESTADÍSTICAS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Cuestionarios</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{totalCount}</div>
                  <p className="text-[11px] text-slate-500">Sincronizados con Supabase</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-xs font-bold uppercase tracking-wider">Nuevos / Pendientes</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-amber-900">{newCount}</div>
                  <p className="text-[11px] text-amber-700">Requieren revisión</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-xs font-bold uppercase tracking-wider">Aprobados / Listos</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-900">{approvedCount + completedCount}</div>
                  <p className="text-[11px] text-emerald-700">Listos para desarrollo</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-purple-700">
                    <span className="text-xs font-bold uppercase tracking-wider">Requieren Inventarios</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <HardDrive className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-purple-900">{featureStats.inventory}</div>
                  <p className="text-[11px] text-purple-700">
                    {totalCount > 0 ? `${Math.round((featureStats.inventory / totalCount) * 100)}% de los clientes` : '0%'}
                  </p>
                </div>
              </div>

              {/* Functional Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual metric 1: Módulos Más Demandados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Módulos & Funciones Requeridas por los Clientes
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1 text-slate-700">
                        <span>Control de Inventario y Stock</span>
                        <span className="font-bold text-blue-600">{featureStats.inventory} empresas</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (featureStats.inventory / totalCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1 text-slate-700">
                        <span>Notificaciones (WhatsApp / Correo)</span>
                        <span className="font-bold text-emerald-600">{featureStats.notifications} empresas</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (featureStats.notifications / totalCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1 text-slate-700">
                        <span>Registro de Gastos y Proveedores</span>
                        <span className="font-bold text-indigo-600">{featureStats.expenses} empresas</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (featureStats.expenses / totalCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1 text-slate-700">
                        <span>Migración de Datos Existentes (Excel/BD)</span>
                        <span className="font-bold text-purple-600">{featureStats.existingData} empresas</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (featureStats.existingData / totalCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual metric 2: Dispositivos & Hardware */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    Plataformas y Dispositivos de Uso Diario
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                      <span className="text-2xl">💻</span>
                      <h4 className="font-bold text-slate-800">Computadora / Laptop</h4>
                      <p className="text-[11px] text-slate-500">100% Compatibilidad</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                      <span className="text-2xl">📱</span>
                      <h4 className="font-bold text-slate-800">Tableta / Móvil</h4>
                      <p className="text-[11px] text-slate-500">Optimizado Touch</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                      <span className="text-2xl">🖨️</span>
                      <h4 className="font-bold text-slate-800">Impresora Térmica</h4>
                      <p className="text-[11px] text-slate-500">Tickets de Venta</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                      <span className="text-2xl">🏷️</span>
                      <h4 className="font-bold text-slate-800">Lector Código Barras</h4>
                      <p className="text-[11px] text-slate-500">Escáner Puntos Venta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICACIONES */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Notificaciones y Alertas</h3>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotifsRead}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-xs text-slate-500">
                    No hay notificaciones por el momento.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                        notif.read
                          ? 'bg-white border-slate-200 text-slate-600'
                          : 'bg-blue-50/80 border-blue-200 text-blue-950 font-medium shadow-2xs'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${notif.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(notif.created_at).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="mt-auto px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 rounded-2xl shadow-2xs">
          <span>
            Gestión de Negocio • Módulo Administrador • Supabase Sync Activo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Regresar al Inicio
          </button>
        </div>
      </div>

      {/* Slide-over Inspection Drawer for selected record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Detalle de Cuestionario
                </span>
                <h3 className="font-bold text-base text-white truncate max-w-md">
                  {selectedRecord.company_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
              {/* Status and Notes editing */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase">Estado Actual</span>
                  {getStatusBadge(selectedRecord.status)}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas Internas del Administrador
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Escribe comentarios, notas o requerimientos clave..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Guardar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* Client Info Card */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-blue-950 text-xs uppercase">Datos de Contacto</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Contacto:</strong> {selectedRecord.client_name}</div>
                  <div><strong>Empresa:</strong> {selectedRecord.company_name}</div>
                  <div><strong>Correo:</strong> {selectedRecord.contact_email || 'N/A'}</div>
                  <div><strong>Teléfono:</strong> {selectedRecord.contact_phone || 'N/A'}</div>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Respuestas por Sección
                </h4>

                {/* Section 1 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 1: Giro y Objetivos</h5>
                  <p><strong>Actividad:</strong> {selectedRecord.data?.section1?.mainActivity || 'No especificado'}</p>
                  <p><strong>Objetivo Principal:</strong> {selectedRecord.data?.section1?.mainObjective || 'No especificado'}</p>
                  <p><strong>Problemas Actuales:</strong> {selectedRecord.data?.section1?.painPoints || 'No especificado'}</p>
                </div>

                {/* Section 2 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 2: Usuarios y Roles</h5>
                  <p><strong>Total Usuarios Estimados:</strong> {selectedRecord.data?.section2?.totalUsers || 'No especificado'}</p>
                  <p><strong>Roles Definidos:</strong> {selectedRecord.data?.section2?.rolesList?.map(r => r.roleName).join(', ') || 'Ninguno'}</p>
                </div>

                {/* Section 3 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 3: Proceso Diario y Notificaciones</h5>
                  <p><strong>Proceso Diario:</strong> {selectedRecord.data?.section3?.dailyProcessSteps || 'No especificado'}</p>
                  <p><strong>Documentos:</strong> {selectedRecord.data?.section3?.currentDocuments?.join(', ') || 'Ninguno'}</p>
                  <p><strong>Requiere Notificaciones:</strong> {selectedRecord.data?.section3?.requiresNotifications ? 'Sí' : 'No'}</p>
                  <p><strong>Canales:</strong> {selectedRecord.data?.section3?.notificationChannels?.join(', ') || 'Ninguno'}</p>
                </div>

                {/* Section 4 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 4: Inventario y Datos</h5>
                  <p><strong>Maneja Inventario:</strong> {selectedRecord.data?.section4?.handlesInventory ? 'Sí' : 'No'}</p>
                  <p><strong>Productos Aprox:</strong> {selectedRecord.data?.section4?.approxProducts || 'N/A'}</p>
                  <p><strong>Campos de Clientes:</strong> {selectedRecord.data?.section4?.clientFields?.join(', ') || 'Básicos'}</p>
                  <p><strong>Rastrea Gastos/Proveedores:</strong> {selectedRecord.data?.section4?.trackExpensesAndSuppliers ? 'Sí' : 'No'}</p>
                </div>

                {/* Section 5 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 5: Dashboard y Reportes</h5>
                  <p><strong>Indicadores en Pantalla:</strong> {selectedRecord.data?.section5?.dashboardWidgets?.join(', ') || 'Ninguno'}</p>
                  <p><strong>Reportes Solicitados:</strong> {selectedRecord.data?.section5?.requiredReports?.join(', ') || 'Ninguno'}</p>
                </div>

                {/* Section 6 */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-xs text-blue-700">Sección 6: Equipos e Integraciones</h5>
                  <p><strong>Dispositivos:</strong> {selectedRecord.data?.section6?.primaryDevices?.join(', ') || 'No especificado'}</p>
                  <p><strong>Integraciones Requeridas:</strong> {selectedRecord.data?.section6?.requiredIntegrations?.join(', ') || 'Ninguna'}</p>
                  <p><strong>Tiene Datos Previos a Migrar:</strong> {selectedRecord.data?.section6?.hasExistingData ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteResponse(selectedRecord.id)}
                className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Eliminar Registro
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
