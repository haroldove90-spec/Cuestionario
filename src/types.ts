export interface UserRole {
  id: string;
  roleName: string;
  functions: string;
}

export interface Section1Company {
  mainActivity: string;
  mainObjective: string;
  painPoints: string;
}

export interface Section2Users {
  totalUsers: string;
  rolesList: UserRole[];
  securityRestrictions: string;
}

export interface Section3Workflow {
  dailyProcessSteps: string;
  currentDocuments: string[];
  customDocuments: string;
  requiresNotifications: boolean;
  notificationDetails: string;
  notificationChannels: string[];
}

export interface Section4Data {
  handlesInventory: boolean;
  approxProducts: string;
  hasVariations: boolean;
  variationDetails: string;
  clientFields: string[];
  customClientFields: string;
  trackExpensesAndSuppliers: boolean;
  expenseSupplierDetails: string;
}

export interface Section5Reports {
  dashboardWidgets: string[];
  customDashboardWidgets: string;
  requiredReports: string[];
  customReports: string;
  exportFormats: string[];
}

export interface Section6Technical {
  primaryDevices: string[];
  customDevices: string;
  requiredIntegrations: string[];
  customIntegrations: string;
  hasExistingData: boolean;
  existingDataDetails: string;
}

export interface QuestionnaireData {
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  dateSubmitted: string;
  section1: Section1Company;
  section2: Section2Users;
  section3: Section3Workflow;
  section4: Section4Data;
  section5: Section5Reports;
  section6: Section6Technical;
}

export interface QuestionnaireResponseRecord {
  id: string;
  created_at: string;
  company_name: string;
  client_name: string;
  contact_email: string;
  contact_phone: string;
  data: QuestionnaireData;
  status: 'nuevo' | 'enviado' | 'en_revision' | 'aprobado' | 'completado';
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'submission' | 'system' | 'status_change';
  response_id?: string;
}

export interface AdminUser {
  email: string;
  role: 'admin';
  name: string;
}

export interface ClientUser {
  id: string;
  created_at: string;
  full_name: string;
  company_name?: string;
  email: string;
  whatsapp: string;
  password_hash?: string;
}

