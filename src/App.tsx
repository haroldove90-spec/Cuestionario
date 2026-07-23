import React, { useState, useEffect } from 'react';
import { QuestionnaireData, AdminUser, ClientUser } from './types';
import { emptyQuestionnaire, sampleQuestionnaire } from './data/initialData';
import { Header } from './components/Header';
import { FormTitleBanner } from './components/FormTitleBanner';
import { ProgressBar } from './components/ProgressBar';
import { Section1General } from './components/Section1General';
import { Section2Users } from './components/Section2Users';
import { Section3Workflows } from './components/Section3Workflows';
import { Section4Data } from './components/Section4Data';
import { Section5Reports } from './components/Section5Reports';
import { Section6Tech } from './components/Section6Tech';
import { SummaryModal } from './components/SummaryModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ClientAuthModal } from './components/ClientAuthModal';
import { HomeScreen } from './components/HomeScreen';
import { Toast } from './components/Toast';
import { ChevronRight, ChevronLeft, Eye, Save, CheckCircle, Sparkles, Send, Database, Loader2, Home } from 'lucide-react';
import { saveResponseToSupabase } from './lib/supabase';

const STORAGE_KEY = 'management_system_questionnaire_draft_v1';
const ADMIN_SESSION_KEY = 'management_system_admin_session_v1';
const CLIENT_SESSION_KEY = 'management_system_client_session_v1';

const SECTION_TITLES = [
  '1. Generalidades y Objetivos',
  '2. Usuarios y Permisos',
  '3. Flujo y Procesos',
  '4. Información y Datos',
  '5. Reportes y Dashboard',
  '6. Integraciones Técnicas',
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'questionnaire'>('home');

  // Logged in client user
  const [currentClient, setCurrentClient] = useState<ClientUser | null>(() => {
    try {
      const stored = localStorage.getItem(CLIENT_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading client session:', e);
    }
    return null;
  });

  const [data, setData] = useState<QuestionnaireData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName === 'Autopartes y Servicios Monterrey') {
          return emptyQuestionnaire;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved draft:', e);
    }
    return emptyQuestionnaire;
  });

  // Admin user state initialized from session storage
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading admin session:', e);
    }
    return null;
  });

  const [currentSection, setCurrentSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'full'>('wizard');
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving admin session:', e);
    }
    showToast(`¡Bienvenido ${user.name}! Sesión admin iniciada.`);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminDashboardOpen(false);
    showToast('Sesión de administrador cerrada.');
  };

  const handleClientAuthSuccess = (client: ClientUser) => {
    setCurrentClient(client);
    try {
      localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(client));
    } catch (e) {
      console.error('Error saving client session:', e);
    }

    // Prefill form with client details if empty
    setData((prev) => ({
      ...prev,
      clientName: prev.clientName || client.full_name,
      contactEmail: prev.contactEmail || client.email,
      contactPhone: prev.contactPhone || client.whatsapp,
    }));

    showToast(`¡Bienvenido ${client.full_name}! Cuestionario activado.`);
    setCurrentScreen('questionnaire');
  };

  // Auto-save to localStorage on data change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error auto-saving:', e);
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleClientInfoChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadSample = () => {
    setData(sampleQuestionnaire);
    showToast('Respuestas de ejemplo cargadas correctamente.');
  };

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todas las respuestas del formulario?')) {
      setData(emptyQuestionnaire);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Formulario limpiado. Puedes iniciar de nuevo.');
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Save draft to Supabase associated with the logged in client or current session
    const res = await saveResponseToSupabase(data, currentClient?.id);
    setIsSavingDraft(false);

    if (res.success) {
      showToast('¡Borrador guardado exitosamente en la Base de Datos (Supabase)!');
    } else {
      showToast('Borrador guardado localmente (sincronizando con Supabase...)');
    }
  };

  // Section completion evaluation logic
  const isSection1Complete = Boolean(
    data.section1.mainActivity.trim() && data.section1.mainObjective.trim()
  );

  const isSection2Complete = Boolean(
    data.section2.totalUsers.trim() &&
      data.section2.rolesList.some((r) => r.functions.trim())
  );

  const isSection3Complete = Boolean(
    data.section3.dailyProcessSteps.trim() || data.section3.currentDocuments.length > 0
  );

  const isSection4Complete = Boolean(
    (data.section4.handlesInventory ? data.section4.approxProducts.trim() : true) &&
      data.section4.clientFields.length > 0
  );

  const isSection5Complete = Boolean(
    data.section5.dashboardWidgets.length > 0 && data.section5.requiredReports.length > 0
  );

  const isSection6Complete = Boolean(
    data.section6.primaryDevices.length > 0 && data.section6.requiredIntegrations.length > 0
  );

  const completedSections = [
    isSection1Complete,
    isSection2Complete,
    isSection3Complete,
    isSection4Complete,
    isSection5Complete,
    isSection6Complete,
  ];

  const completedCount = completedSections.filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 6) * 100);

  // If on HOME screen: render ONLY the minimalist Home landing (Logo + 2 Roles, NO header, NO navbar)
  if (currentScreen === 'home') {
    return (
      <>
        <HomeScreen
          onOpenClientAuth={() => setIsClientAuthOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onContinueAsClient={() => setCurrentScreen('questionnaire')}
          onContinueAsAdmin={() => setIsAdminDashboardOpen(true)}
          currentClient={currentClient}
          adminUser={adminUser}
        />

        {/* Client Auth Modal */}
        <ClientAuthModal
          isOpen={isClientAuthOpen}
          onClose={() => setIsClientAuthOpen(false)}
          onAuthSuccess={handleClientAuthSuccess}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />

        {/* Admin Dashboard Modal */}
        {adminUser && (
          <AdminDashboardModal
            isOpen={isAdminDashboardOpen}
            onClose={() => setIsAdminDashboardOpen(false)}
            adminUser={adminUser}
            onLogout={handleAdminLogout}
            onSuccessToast={showToast}
            sampleQuestionnaireData={sampleQuestionnaire}
          />
        )}

        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col pb-24">
      {/* Sticky Header: Logo + Admin Access ONLY */}
      <Header
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        adminUser={adminUser}
        onGoHome={() => setCurrentScreen('home')}
      />

      {/* Form Title Banner (Below Header): Title, Callout, Actions, Client Fields */}
      <FormTitleBanner
        data={data}
        onChangeClientInfo={handleClientInfoChange}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onSave={handleSaveDraft}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        completionPercentage={completionPercentage}
      />

      {/* Progress Bar (Visible in wizard mode) */}
      {viewMode === 'wizard' && (
        <ProgressBar
          currentSection={currentSection}
          completedSections={completedSections}
          completionPercentage={completionPercentage}
          onSelectSection={(idx) => setCurrentSection(idx)}
          sectionTitles={SECTION_TITLES}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full flex-1">
        {viewMode === 'wizard' ? (
          <div className="space-y-6">
            {currentSection === 0 && (
              <Section1General
                data={data.section1}
                onChange={(field, val) =>
                  setData((prev) => ({
                    ...prev,
                    section1: { ...prev.section1, [field]: val },
                  }))
                }
              />
            )}

            {currentSection === 1 && (
              <Section2Users
                data={data.section2}
                onChange={(updated) =>
                  setData((prev) => ({ ...prev, section2: updated }))
                }
              />
            )}

            {currentSection === 2 && (
              <Section3Workflows
                data={data.section3}
                onChange={(updated) =>
                  setData((prev) => ({ ...prev, section3: updated }))
                }
              />
            )}

            {currentSection === 3 && (
              <Section4Data
                data={data.section4}
                onChange={(updated) =>
                  setData((prev) => ({ ...prev, section4: updated }))
                }
              />
            )}

            {currentSection === 4 && (
              <Section5Reports
                data={data.section5}
                onChange={(updated) =>
                  setData((prev) => ({ ...prev, section5: updated }))
                }
              />
            )}

            {currentSection === 5 && (
              <Section6Tech
                data={data.section6}
                onChange={(updated) =>
                  setData((prev) => ({ ...prev, section6: updated }))
                }
              />
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentSection === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                    : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <div className="text-xs font-bold text-slate-500 hidden sm:block">
                Sección {currentSection + 1} de 6
              </div>

              {currentSection < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection((prev) => Math.min(5, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer"
                >
                  Siguiente Sección <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Finalizar y Revisar Resumen <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Full Page Scroll View */
          <div className="space-y-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-2xs">
              <span className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Vista Completa Continua: Revisa o edita todas las secciones en una sola pantalla.
              </span>
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
              >
                Abrir Modal de Resumen
              </button>
            </div>

            <Section1General
              data={data.section1}
              onChange={(field, val) =>
                setData((prev) => ({
                  ...prev,
                  section1: { ...prev.section1, [field]: val },
                }))
              }
            />

            <Section2Users
              data={data.section2}
              onChange={(updated) =>
                setData((prev) => ({ ...prev, section2: updated }))
              }
            />

            <Section3Workflows
              data={data.section3}
              onChange={(updated) =>
                setData((prev) => ({ ...prev, section3: updated }))
              }
            />

            <Section4Data
              data={data.section4}
              onChange={(updated) =>
                setData((prev) => ({ ...prev, section4: updated }))
              }
            />

            <Section5Reports
              data={data.section5}
              onChange={(updated) =>
                setData((prev) => ({ ...prev, section5: updated }))
              }
            />

            <Section6Tech
              data={data.section6}
              onChange={(updated) =>
                setData((prev) => ({ ...prev, section6: updated }))
              }
            />
          </div>
        )}
      </main>

      {/* Persistent Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-20 py-2.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <button
              type="button"
              onClick={() => setCurrentScreen('home')}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> Inicio
            </button>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Guardado en tiempo real activo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="px-4 py-1.5 text-white font-extrabold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSavingDraft ? 'Guardando...' : 'Guardar Borrador'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSummaryOpen(true)}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Revisar y Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Review Modal */}
      <SummaryModal
        data={data}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onToast={showToast}
      />

      {/* Supabase SQL & Configuration Modal */}
      <SupabaseSqlModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        data={data}
        onSuccessToast={showToast}
      />

      {/* Client Auth Modal */}
      <ClientAuthModal
        isOpen={isClientAuthOpen}
        onClose={() => setIsClientAuthOpen(false)}
        onAuthSuccess={handleClientAuthSuccess}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Dashboard Modal */}
      {adminUser && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onSuccessToast={showToast}
          sampleQuestionnaireData={sampleQuestionnaire}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </div>
  );
}

