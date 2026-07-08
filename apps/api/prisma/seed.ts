import { PrismaClient, Role, LeadStatus, OpportunityStage, QuoteStatus, InvoiceStatus, PaymentMethod, ActivityType, NotificationType, NotificationChannel, AutomationTrigger, AutomationAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@crm.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      role: Role.ADMIN,
      phone: '+525511111111',
      isActive: true,
    },
  });

  const director = await prisma.user.create({
    data: {
      email: 'director@crm.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      role: Role.DIRECTOR,
      phone: '+525511111112',
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@crm.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'López',
      role: Role.MANAGER,
      phone: '+525511111113',
      isActive: true,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      email: 'sales1@crm.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Martínez',
      role: Role.SALES,
      phone: '+525511111114',
      isActive: true,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'sales2@crm.com',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Ramírez',
      role: Role.SALES,
      phone: '+525511111115',
      isActive: true,
    },
  });

  const architect = await prisma.user.create({
    data: {
      email: 'architect@crm.com',
      password: hashedPassword,
      firstName: 'Laura',
      lastName: 'Fernández',
      role: Role.ARCHITECT,
      phone: '+525511111116',
      isActive: true,
    },
  });

  const designer = await prisma.user.create({
    data: {
      email: 'designer@crm.com',
      password: hashedPassword,
      firstName: 'Diego',
      lastName: 'Torres',
      role: Role.DESIGNER,
      phone: '+525511111117',
      isActive: true,
    },
  });

  const accounting = await prisma.user.create({
    data: {
      email: 'accounting@crm.com',
      password: hashedPassword,
      firstName: 'Sofía',
      lastName: 'Herrera',
      role: Role.ACCOUNTING,
      phone: '+525511111118',
      isActive: true,
    },
  });

  const company1 = await prisma.company.create({
    data: {
      name: 'Empresas Tecnológicas',
      legalName: 'Empresas Tecnológicas S.A. de C.V.',
      taxId: 'TEC-880101-XA1',
      industry: 'Tecnología',
      segment: 'Enterprise',
      website: 'https://empresaestecnologicas.com',
      phone: '+525533331111',
      email: 'contacto@empresaestecnologicas.com',
      address: 'Av. Reforma 350, Col. Juárez',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06600',
      isClient: true,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Constructora del Sur',
      legalName: 'Constructora del Sur S.A. de C.V.',
      taxId: 'CON-920505-XB2',
      industry: 'Construcción',
      segment: 'Mid-Market',
      website: 'https://constructorasur.com',
      phone: '+525534442222',
      email: 'info@constructorasur.com',
      address: 'Blvd. de las Naciones 1805',
      city: 'Puebla',
      state: 'Puebla',
      country: 'México',
      postalCode: '72000',
      isClient: true,
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Grupo Logístico',
      legalName: 'Grupo Logístico Integral S.A.P.I. de C.V.',
      taxId: 'GLO-990330-XC3',
      industry: 'Logística',
      segment: 'SMB',
      website: 'https://grupplogistico.com',
      phone: '+525535553333',
      email: 'ventas@grupplogistico.com',
      address: 'Av. Industrial 742, Parque Industrial',
      city: 'Monterrey',
      state: 'Nuevo León',
      country: 'México',
      postalCode: '66400',
      isClient: false,
    },
  });

  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Roberto',
      lastName: 'Sánchez',
      email: 'roberto.sanchez@empresaestecnologicas.com',
      phone: '+525544441234',
      position: 'CTO',
      department: 'Tecnología',
      notes: 'Contacto principal para decisiones tecnológicas',
      tags: ['tecnología', 'decision-maker'],
      isActive: true,
      companyId: company1.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Gabriela',
      lastName: 'Wu',
      email: 'gabriela.wu@empresaestecnologicas.com',
      phone: '+525544441235',
      position: 'Directora de Operaciones',
      department: 'Operaciones',
      notes: 'Encargada de la implementación de nuevos sistemas',
      tags: ['operaciones', 'implementación'],
      isActive: true,
      companyId: company1.id,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      firstName: 'Jorge',
      lastName: 'Mendoza',
      email: 'jorge.mendoza@constructorasur.com',
      phone: '+525544441236',
      position: 'Gerente de Proyectos',
      department: 'Proyectos',
      notes: 'Interesado en soluciones de gestión para construcción',
      tags: ['construcción', 'proyectos'],
      isActive: true,
      companyId: company2.id,
    },
  });

  const contact4 = await prisma.contact.create({
    data: {
      firstName: 'Diana',
      lastName: 'Rojas',
      email: 'diana.rojas@constructorasur.com',
      phone: '+525544441237',
      position: 'Directora de Administración',
      department: 'Administración',
      notes: 'Encargada de aprobación de presupuestos',
      tags: ['administración', 'finanzas'],
      isActive: true,
      companyId: company2.id,
    },
  });

  const contact5 = await prisma.contact.create({
    data: {
      firstName: 'Luis',
      lastName: 'Aguilar',
      email: 'luis.aguilar@grupplogistico.com',
      phone: '+525544441238',
      position: 'CEO',
      department: 'Dirección',
      notes: 'Fundador y CEO, toma todas las decisiones finales',
      tags: ['dirección', 'fundador'],
      isActive: true,
      companyId: company3.id,
    },
  });

  const contact6 = await prisma.contact.create({
    data: {
      firstName: 'Patricia',
      lastName: 'Navarro',
      email: 'patricia.navarro@grupplogistico.com',
      phone: '+525544441239',
      position: 'Coordinadora de TI',
      department: 'TI',
      notes: 'Contacto técnico para integraciones',
      tags: ['ti', 'técnico'],
      isActive: true,
      companyId: company3.id,
    },
  });

  const lead1 = await prisma.lead.create({
    data: {
      name: 'Seguimiento Empresas Tecnológicas',
      description: 'Cliente existente interesado en ampliar su licencia CRM',
      source: 'Recomendación',
      campaign: 'Programa de Fidelización',
      score: 85,
      status: LeadStatus.CONVERTED,
      probability: 90,
      notes: 'Contacto inicial positivo, ya usan nuestro CRM',
      companyId: company1.id,
      contactId: contact1.id,
      assignedTo: sales1.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Nuevo Proyecto Constructora del Sur',
      description: 'Requieren CRM para gestión de proyectos de construcción',
      source: 'Web',
      campaign: 'Campaña LinkedIn Q1',
      score: 70,
      status: LeadStatus.QUALIFIED,
      probability: 60,
      notes: 'Ya tuvimos reunión inicial, muy interesados',
      companyId: company2.id,
      contactId: contact3.id,
      assignedTo: sales1.id,
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: 'Grupo Logístico - Oportunidad Nueva',
      description: 'Empresa en crecimiento busca sistema CRM',
      source: 'Referido',
      score: 50,
      status: LeadStatus.CONTACTED,
      probability: 40,
      notes: 'Llamada inicial realizada, agendada demo',
      companyId: company3.id,
      contactId: contact5.id,
      assignedTo: sales2.id,
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: 'Lead Web - Empresa de Retail',
      description: 'Solicitaron información sobre precios de CRM',
      source: 'Web',
      campaign: 'Google Ads - CRM',
      score: 25,
      status: LeadStatus.NEW,
      probability: 15,
      notes: 'Descargaron brochure, aún no contactados',
    },
  });

  const lead5 = await prisma.lead.create({
    data: {
      name: 'Descartado - Startup Tecnología',
      description: 'Startup sin presupuesto para CRM empresarial',
      source: 'Email',
      score: 5,
      status: LeadStatus.DISQUALIFIED,
      probability: 0,
      notes: 'Presupuesto insuficiente, volver a contactar en 6 meses',
      companyId: company1.id,
      assignedTo: sales2.id,
    },
  });

  const opp1 = await prisma.opportunity.create({
    data: {
      name: 'Ampliación Licencias - Empresas Tecnológicas',
      description: 'Ampliación de 50 a 120 licencias CRM Enterprise',
      amount: 3500000,
      probability: 80,
      stage: OpportunityStage.NEGOCIACION,
      expectedCloseDate: daysFromNow(30),
      notes: 'Negociando descuento por volumen',
      companyId: company1.id,
      assignedTo: sales1.id,
      leadId: lead1.id,
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      name: 'CRM Constructora del Sur',
      description: 'Implementación completa de CRM para constructora',
      amount: 1800000,
      probability: 55,
      stage: OpportunityStage.PROPUESTA_HONORARIOS,
      expectedCloseDate: daysFromNow(60),
      notes: 'Propuesta enviada, esperando revisión',
      companyId: company2.id,
      assignedTo: sales1.id,
      leadId: lead2.id,
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      name: 'CRM Grupo Logístico',
      description: 'CRM básico para logística y seguimiento de envíos',
      amount: 750000,
      probability: 30,
      stage: OpportunityStage.VISITA_TERRENO,
      expectedCloseDate: daysFromNow(90),
      notes: 'En proceso de calificación, necesitan demo personalizada',
      companyId: company3.id,
      assignedTo: sales2.id,
    },
  });

  const mat1 = await prisma.material.create({
    data: {
      name: 'Anteproyecto Casa Habitación',
      description: 'Diseño inicial, plantas arquitectónicas y fachadas',
      reference: 'ARQ-ANT-001',
      price: 500000,
      cost: 200000,
      category: 'Casas',
      unit: 'proyecto',
    },
  });

  const mat2 = await prisma.material.create({
    data: {
      name: 'Proyecto Ejecutivo Comercial',
      description: 'Planos constructivos, instalaciones y memorias',
      reference: 'ARQ-EJE-001',
      price: 2000000,
      cost: 800000,
      category: 'Comercial',
      unit: 'proyecto',
    },
  });

  const mat3 = await prisma.material.create({
    data: {
      name: 'Diseño Urbano / Masterplan',
      description: 'Diseño de fraccionamientos y lotificación',
      reference: 'ARQ-URB-001',
      price: 3500000,
      cost: 1500000,
      category: 'Urbano',
      unit: 'proyecto',
    },
  });

  const mat4 = await prisma.material.create({
    data: {
      name: 'Dirección de Obra Residencial',
      description: 'Supervisión arquitectónica en sitio',
      reference: 'ARQ-DIR-001',
      price: 300000,
      cost: 120000,
      category: 'Casas',
      unit: 'mes',
    },
  });

  const mat5 = await prisma.material.create({
    data: {
      name: 'Soporte Premium',
      description: 'Soporte técnico premium 24/7 con SLA de 2 horas',
      reference: 'CRM-SOP-001',
      price: 150000,
      cost: 60000,
      category: 'Suscripciones',
      unit: 'mes',
    },
  });

  const quote1 = await prisma.quote.create({
    data: {
      number: 'COT-2024-001',
      title: 'Implementación CRM Empresas Tecnológicas',
      subtotal: 3300000,
      tax: 528000,
      taxRate: 16,
      discount: 0,
      total: 3828000,
      status: QuoteStatus.ACCEPTED,
      validUntil: daysFromNow(30),
      notes: 'Cotización para ampliación de licencias y servicios adicionales',
      terms: 'Pago a 30 días contra factura',
      acceptedAt: daysAgo(5),
      companyId: company1.id,
      contactId: contact1.id,
      opportunityId: opp1.id,
      createdById: sales1.id,
      items: {
        create: [
          {
            quantity: 1,
            unitPrice: 2000000,
            total: 2000000,
            materialId: mat2.id,
          },
          {
            quantity: 1,
            unitPrice: 800000,
            total: 800000,
            materialId: mat3.id,
          },
          {
            quantity: 1,
            unitPrice: 500000,
            total: 500000,
            materialId: mat1.id,
          },
        ],
      },
    },
  });

  const quote2 = await prisma.quote.create({
    data: {
      number: 'COT-2024-002',
      title: 'CRM Constructora del Sur - Propuesta Inicial',
      subtotal: 1100000,
      tax: 176000,
      taxRate: 16,
      discount: 100000,
      total: 1176000,
      status: QuoteStatus.SENT,
      validUntil: daysFromNow(45),
      notes: 'Propuesta inicial con descuento por nuevo cliente',
      terms: '50% anticipo, 50% contra entrega',
      companyId: company2.id,
      contactId: contact3.id,
      opportunityId: opp2.id,
      createdById: sales1.id,
      items: {
        create: [
          {
            quantity: 1,
            unitPrice: 800000,
            total: 800000,
            materialId: mat3.id,
          },
          {
            quantity: 1,
            unitPrice: 300000,
            total: 300000,
            materialId: mat4.id,
          },
        ],
      },
    },
  });

  const invoice1 = await prisma.invoice.create({
    data: {
      number: 'INV-2024-001',
      subtotal: 3300000,
      tax: 528000,
      taxRate: 16,
      discount: 0,
      total: 3828000,
      amountPaid: 3828000,
      status: InvoiceStatus.PAID,
      dueDate: daysAgo(10),
      paidAt: daysAgo(5),
      notes: 'Factura pagada por transferencia',
      companyId: company1.id,
      quoteId: quote1.id,
      createdById: accounting.id,
      items: {
        create: [
          {
            quantity: 1,
            unitPrice: 2000000,
            total: 2000000,
            materialId: mat2.id,
          },
          {
            quantity: 1,
            unitPrice: 800000,
            total: 800000,
            materialId: mat3.id,
          },
          {
            quantity: 1,
            unitPrice: 500000,
            total: 500000,
            materialId: mat1.id,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 3828000,
            method: PaymentMethod.TRANSFER,
            reference: 'TRF-987654321',
            transactionId: 'TXN-001',
            notes: 'Pago completo por implementación',
            paidAt: daysAgo(5),
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      number: 'INV-2024-002',
      subtotal: 1100000,
      tax: 176000,
      taxRate: 16,
      discount: 100000,
      total: 1176000,
      amountPaid: 588000,
      status: InvoiceStatus.PARTIAL,
      dueDate: daysFromNow(25),
      notes: 'Anticipo del 50% recibido',
      companyId: company2.id,
      quoteId: quote2.id,
      createdById: accounting.id,
      items: {
        create: [
          {
            quantity: 1,
            unitPrice: 800000,
            total: 800000,
            materialId: mat3.id,
          },
          {
            quantity: 1,
            unitPrice: 300000,
            total: 300000,
            materialId: mat4.id,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 588000,
            method: PaymentMethod.TRANSFER,
            reference: 'TRF-987654322',
            transactionId: 'TXN-002',
            notes: 'Anticipo 50%',
            paidAt: daysAgo(2),
          },
        ],
      },
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        type: ActivityType.CALL,
        subject: 'Llamada de seguimiento - Empresas Tecnológicas',
        description: 'Llamada con Roberto Sánchez para discutir ampliación de licencias',
        result: 'Positivo, interesado en agendar reunión técnica',
        duration: 25,
        scheduledAt: daysAgo(10),
        completedAt: daysAgo(10),
        isCompleted: true,
        contactId: contact1.id,
        opportunityId: opp1.id,
        userId: sales1.id,
      },
      {
        type: ActivityType.MEETING,
        subject: 'Demo CRM - Constructora del Sur',
        description: 'Demo del producto con el equipo de proyectos',
        result: 'Muy interesados, solicitan propuesta formal',
        duration: 90,
        scheduledAt: daysAgo(7),
        completedAt: daysAgo(7),
        isCompleted: true,
        contactId: contact3.id,
        opportunityId: opp2.id,
        userId: sales1.id,
      },
      {
        type: ActivityType.EMAIL,
        subject: 'Propuesta enviada - Grupo Logístico',
        description: 'Envío de propuesta comercial inicial',
        result: 'Pendiente de revisión por parte del cliente',
        scheduledAt: daysAgo(3),
        completedAt: daysAgo(3),
        isCompleted: true,
        contactId: contact5.id,
        opportunityId: opp3.id,
        userId: sales2.id,
      },
      {
        type: ActivityType.CALL,
        subject: 'Llamada de calificación - Lead Retail',
        description: 'Llamada para calificar lead de retail',
        duration: 15,
        scheduledAt: daysFromNow(2),
        isCompleted: false,
        userId: sales2.id,
      },
      {
        type: ActivityType.WHATSAPP,
        subject: 'Mensaje de seguimiento - Constructora del Sur',
        description: 'Recordatorio amable sobre propuesta enviada',
        scheduledAt: daysFromNow(1),
        isCompleted: false,
        contactId: contact3.id,
        opportunityId: opp2.id,
        userId: sales1.id,
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Preparar contrato - Empresas Tecnológicas',
        description: 'Redactar contrato de ampliación de licencias',
        priority: 'high',
        dueDate: daysFromNow(5),
        isCompleted: false,
        userId: sales1.id,
        opportunityId: opp1.id,
      },
      {
        title: 'Enviar propuesta revisada - Constructora del Sur',
        description: 'Ajustar propuesta según feedback del cliente',
        priority: 'high',
        dueDate: daysFromNow(3),
        isCompleted: false,
        userId: sales1.id,
        opportunityId: opp2.id,
      },
      {
        title: 'Agendar demo personalizada - Grupo Logístico',
        description: 'Coordinar demo con equipo de TI de Grupo Logístico',
        priority: 'medium',
        dueDate: daysFromNow(7),
        isCompleted: false,
        userId: sales2.id,
        opportunityId: opp3.id,
      },
      {
        title: 'Seguimiento lead retail',
        description: 'Contactar lead de retail para calificación',
        priority: 'low',
        dueDate: daysFromNow(10),
        isCompleted: false,
        userId: sales2.id,
      },
    ],
  });

  await prisma.automationRule.createMany({
    data: [
      {
        name: 'Asignar lead automáticamente',
        description: 'Asigna un lead al usuario con menos carga de trabajo cuando se crea uno nuevo',
        trigger: AutomationTrigger.LEAD_CREATED,
        action: AutomationAction.ASSIGN_USER,
        config: { strategy: 'round-robin', role: 'SALES' },
        isActive: true,
        order: 1,
      },
      {
        name: 'Crear factura al aceptar cotización',
        description: 'Genera automáticamente una factura cuando una cotización es aceptada',
        trigger: AutomationTrigger.QUOTE_ACCEPTED,
        action: AutomationAction.CREATE_OPPORTUNITY,
        config: { invoiceTemplate: 'default' },
        isActive: true,
        order: 2,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        type: NotificationType.LEAD_ASSIGNED,
        title: 'Nuevo lead asignado',
        message: 'Se te ha asignado el lead: Seguimiento Empresas Tecnológicas',
        channel: NotificationChannel.INTERNAL,
        isRead: true,
        readAt: daysAgo(8),
        link: '/leads',
        userId: sales1.id,
        createdAt: daysAgo(8),
      },
      {
        type: NotificationType.QUOTE_ACCEPTED,
        title: 'Cotización aceptada',
        message: 'La cotización COT-2024-001 fue aceptada por Empresas Tecnológicas',
        channel: NotificationChannel.INTERNAL,
        isRead: false,
        link: '/quotes/COT-2024-001',
        userId: sales1.id,
        createdAt: daysAgo(5),
      },
      {
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Pago recibido',
        message: 'Se ha recibido el pago de $3,828,000 MXN de Empresas Tecnológicas',
        channel: NotificationChannel.INTERNAL,
        isRead: false,
        link: '/invoices/INV-2024-001',
        userId: accounting.id,
        createdAt: daysAgo(5),
      },
      {
        type: NotificationType.TASK_CREATED,
        title: 'Nueva tarea asignada',
        message: 'Tarea: Enviar propuesta revisada - Constructora del Sur',
        channel: NotificationChannel.INTERNAL,
        isRead: false,
        link: '/tasks',
        userId: sales1.id,
        createdAt: daysAgo(1),
      },
      {
        type: NotificationType.LEAD_ASSIGNED,
        title: 'Nuevo lead asignado',
        message: 'Se te ha asignado el lead: Grupo Logístico - Oportunidad Nueva',
        channel: NotificationChannel.INTERNAL,
        isRead: true,
        readAt: daysAgo(2),
        link: '/leads',
        userId: sales2.id,
        createdAt: daysAgo(3),
      },
    ],
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
