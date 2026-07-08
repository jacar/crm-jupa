export const ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  MANAGER: 'manager',
  SALES: 'sales',
  ARCHITECT: 'architect',
  DESIGNER: 'designer',
  ACCOUNTING: 'accounting',
  CLIENT: 'client',
} as const;

export const PERMISSIONS = {
  ADMIN: {
    label: 'Administrador',
    description: 'Acceso completo al sistema. Gestiona usuarios, roles, y configuración.',
    modules: ['*'],
  },
  DIRECTOR: {
    label: 'Director',
    description: 'Visión global del negocio. Reportes, dashboards, y gestión de equipos.',
    modules: ['dashboard', 'reports', 'users:read', 'companies', 'contacts', 'opportunities', 'quotes', 'invoices'],
  },
  MANAGER: {
    label: 'Gerente',
    description: 'Supervisa equipos comerciales, asigna leads, y revisa métricas.',
    modules: ['dashboard', 'leads', 'opportunities', 'contacts', 'companies', 'reports:read', 'users:read'],
  },
  SALES: {
    label: 'Comercial',
    description: 'Gestiona sus propios leads, oportunidades, clientes, y actividades.',
    modules: ['leads:own', 'opportunities:own', 'contacts', 'companies:read', 'quotes:create', 'activities:own'],
  },
  ARCHITECT: {
    label: 'Arquitecto',
    description: 'Acceso a proyectos técnicos, documentación, y planificación.',
    modules: ['projects', 'documents', 'tasks', 'calendar'],
  },
  DESIGNER: {
    label: 'Diseñador',
    description: 'Acceso a proyectos de diseño, archivos, y tareas creativas.',
    modules: ['projects:design', 'files', 'tasks:own', 'calendar'],
  },
  ACCOUNTING: {
    label: 'Contabilidad',
    description: 'Gestión de facturas, pagos, reportes financieros, e ingresos.',
    modules: ['invoices', 'payments', 'reports:financial', 'companies:read'],
  },
  CLIENT: {
    label: 'Cliente',
    description: 'Portal de cliente: ver cotizaciones, facturas, y estado de proyectos.',
    modules: ['portal:quotes', 'portal:invoices', 'portal:projects', 'tickets'],
  },
} as const;
