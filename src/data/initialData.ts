import { QuestionnaireData } from '../types';

export const emptyQuestionnaire: QuestionnaireData = {
  clientName: '',
  companyName: '',
  contactEmail: '',
  contactPhone: '',
  dateSubmitted: new Date().toISOString().split('T')[0],
  section1: {
    mainActivity: '',
    mainObjective: '',
    painPoints: '',
  },
  section2: {
    totalUsers: '',
    rolesList: [
      { id: '1', roleName: 'Director / Dueño', functions: '' },
      { id: '2', roleName: 'Gerente / Administrador', functions: '' },
      { id: '3', roleName: 'Vendedor / Operador', functions: '' },
    ],
    securityRestrictions: '',
  },
  section3: {
    dailyProcessSteps: '',
    currentDocuments: [],
    customDocuments: '',
    requiresNotifications: true,
    notificationDetails: '',
    notificationChannels: ['Email', 'WhatsApp'],
  },
  section4: {
    handlesInventory: true,
    approxProducts: '',
    hasVariations: false,
    variationDetails: '',
    clientFields: ['Nombre / Razon Social', 'RFC / Identificación', 'Teléfono', 'Correo electrónico', 'Historial de Compras'],
    customClientFields: '',
    trackExpensesAndSuppliers: true,
    expenseSupplierDetails: '',
  },
  section5: {
    dashboardWidgets: ['Ventas del día / mes', 'Productos más vendidos', 'Cuentas por cobrar', 'Proyectos o pedidos pendientes'],
    customDashboardWidgets: '',
    requiredReports: ['Reporte de ventas semanales/mensuales', 'Desglose por vendedor / comisiones', 'Exportar facturas o notas'],
    customReports: '',
    exportFormats: ['PDF', 'Excel (XLSX)'],
  },
  section6: {
    primaryDevices: ['Computadora de escritorio / Laptop', 'Tableta / Dispositivo móvil'],
    customDevices: '',
    requiredIntegrations: ['Lector de código de barras', 'Impresora térmica de tickets'],
    customIntegrations: '',
    hasExistingData: true,
    existingDataDetails: '',
  },
};

export const sampleQuestionnaire: QuestionnaireData = {
  clientName: 'Carlos Mendoza',
  companyName: 'Autopartes y Servicios Monterrey',
  contactEmail: 'carlos@autopartesmty.com',
  contactPhone: '+52 81 1234 5678',
  dateSubmitted: new Date().toISOString().split('T')[0],
  section1: {
    mainActivity: 'Venta de autopartes mecánicas y eléctricas al mayoreo y menudeo, además de servicio técnico de instalación ligera en taller.',
    mainObjective: 'Centralizar todo el control operativo en una sola plataforma: dejar de depender de múltiples hojas de Excel, sincronizar el inventario en tiempo real entre almacén y mostrador, y acelerar el tiempo de atención al cliente.',
    painPoints: 'Desfase recurrente en existencias de almacén, cobros con precios desactualizados por falta de catálogo centralizado, demora al generar cotizaciones manualmente y falta de reportes consolidados al final del día.',
  },
  section2: {
    totalUsers: '12 personas',
    rolesList: [
      {
        id: '1',
        roleName: 'Director / Dueño',
        functions: 'Acceso total al sistema: aprobación de descuentos especiales, visualización de utilidades netas, configuración de usuarios, auditoría de logs y reportes financieros consolidados.',
      },
      {
        id: '2',
        roleName: 'Gerente de Almacén',
        functions: 'Gestión de inventario, recepción de proveedores, ajuste de existencias, asignación de ubicaciones de pasillo/anaquel y alertas de stock mínimo.',
      },
      {
        id: '3',
        roleName: 'Vendedor de Mostrador',
        functions: 'Búsqueda de autopartes por código/compatible, creación de cotizaciones, generación de notas de venta, registro de anticipos y consulta de estatus de pedidos.',
      },
      {
        id: '4',
        roleName: 'Cajero',
        functions: 'Apertura y corte de caja diario, cobro en efectivo/tarjeta/transferencia, emisión de tickets/facturas y registro de ingresos.',
      },
    ],
    securityRestrictions: 'Los vendedores no deben ver los costos de compra ni el margen de ganancia de los productos. Solo el Director/Dueño y el Gerente pueden cancelar ventas creadas o modificar precios base. Las cancelaciones requieren motivo obligatorio.',
  },
  section3: {
    dailyProcessSteps: '1. El cliente llega al mostrador o solicita por WhatsApp.\n2. El vendedor busca la pieza por vehículo/año/modelo o código original.\n3. Se genera la cotización con vigencia de 5 días.\n4. Al aprobar, el cliente paga anticipo (mínimo 50% si es bajo pedido) o pago total en caja.\n5. El almacén recibe la orden de surtido en pantalla.\n6. Se entrega la refacción al cliente o se programa la instalación en taller.\n7. Se emite comprobante final y factura si es requerida.',
    currentDocuments: ['Cotizaciones en PDF', 'Notas de remisión / Venta', 'Hojas de Excel de inventario', 'Pólizas de garantía', 'Facturas electrónicas'],
    customDocuments: 'Checklist físico de recepción de vehículo para taller',
    requiresNotifications: true,
    notificationDetails: 'Enviar aviso automático por WhatsApp/correo al cliente cuando su refacción especial haya llegado al almacén y esté lista para recolección.',
    notificationChannels: ['WhatsApp', 'Email', 'Notificaciones en pantalla del sistema'],
  },
  section4: {
    handlesInventory: true,
    approxProducts: 'Aproximadamente 4,500 SKU (refacciones mecánicas, filtros, aceites, piezas eléctricas y accesorios).',
    hasVariations: true,
    variationDetails: 'Marcas (Bosch, Gonher, ACDelco), compatibilidad por marca/modelo/año de vehículo, ubicación física en bodega (Pasillo - Estante).',
    clientFields: ['Nombre / Razon Social', 'RFC / Identificación', 'Teléfono', 'Correo electrónico', 'Dirección fiscal / envío', 'Historial de Compras', 'Documentos adjuntos'],
    customClientFields: 'Datos del vehículo habitual del cliente (Marca, Modelo, Año, VIN/Número de serie).',
    trackExpensesAndSuppliers: true,
    expenseSupplierDetails: 'Registro de proveedores con catálogo de códigos de fabricante, días de crédito asignados, registro de compras con costo unitario e ingreso automático al stock.',
  },
  section5: {
    dashboardWidgets: ['Ventas del día / mes', 'Productos más vendidos', 'Cuentas por cobrar', 'Alertas de stock bajo / reposición', 'Estatus de pedidos en taller'],
    customDashboardWidgets: 'Comparativa de ventas mes actual vs. mes anterior y meta de ventas semanal por vendedor.',
    requiredReports: ['Reporte de ventas semanales/mensuales', 'Desglose por vendedor / comisiones', 'Kardex de movimientos de inventario', 'Corte de caja diario por cajero y forma de pago', 'Exportar facturas o notas'],
    customReports: 'Reporte de artículos sin movimiento en los últimos 90 días (inventario lento).',
    exportFormats: ['PDF', 'Excel (XLSX)', 'CSV'],
  },
  section6: {
    primaryDevices: ['Computadora de escritorio / Laptop', 'Tableta / Dispositivo móvil'],
    customDevices: '',
    requiredIntegrations: ['Lector de código de barras', 'Impresora térmica de tickets', 'Pasarelas de pago (Terminal bancaria)', 'Facturación electrónica SAT (CFDI 4.0)'],
    customIntegrations: 'Integración vía API con WhatsApp Business para envío automático de cotizaciones en PDF.',
    hasExistingData: true,
    existingDataDetails: 'Contamos con 3 archivos de Excel con el catálogo actual de productos (Código, Descripción, Precio lista, Stock) y una lista de 800 clientes frecuentes para importar.',
  },
};
