# CRM Jupa

Sistema CRM Inteligente construido con Next.js, NestJS, PostgreSQL y Prisma.

## Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn UI, React Query, Zustand, Recharts
- **Backend**: NestJS 10, TypeScript, Prisma ORM, JWT, WebSockets
- **Base de Datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Infraestructura**: Docker, Vercel (frontend), Railway (backend)
- **Storage**: Supabase Storage

## Arquitectura

```
crm-jupa/
├── apps/
│   ├── api/          # NestJS Backend (API REST + GraphQL)
│   └── web/          # Next.js Frontend
├── packages/
│   └── shared/       # Tipos y constantes compartidas
├── .docker/          # Docker Compose
└── .github/          # CI/CD
```

## Módulos del Sistema

### Backend (NestJS)
- **Auth**: Autenticación JWT + Refresh Token + RBAC
- **Users**: Gestión de usuarios con 8 roles
- **Contacts**: CRUD de contactos con búsqueda y segmentación
- **Companies**: Gestión de empresas y clientes
- **Leads**: Captura, calificación, asignación y seguimiento
- **Opportunities**: Pipeline Kanban con etapas configurables
- **Quotes**: Constructor de cotizaciones con PDF y firma digital
- **Invoices**: Facturación, pagos, y conciliación
- **Products**: Catálogo de productos/servicios
- **Activities**: Registro de llamadas, emails, reuniones, WhatsApp
- **Tasks**: Gestión de tareas con prioridades
- **Calendar**: Agenda con integración Google/Outlook
- **Notifications**: Notificaciones en tiempo real (WebSocket)
- **Reports**: Reportes de ventas, pipeline, conversión, ingresos
- **Dashboard**: KPIs, métricas, gráficos, embudos
- **Automation**: Motor de reglas de automatización
- **Integrations**: Conectores WhatsApp, Email, Stripe, Mercado Pago
- **Files**: Gestión documental con versionado
- **Audit**: Auditoría completa de todas las operaciones
- **AI**: Módulo de Inteligencia Artificial

### Frontend (Next.js)
- Dashboard inteligente con KPIs y gráficos
- Pipeline de ventas Kanban
- Gestión de contactos y empresas
- Leads con scoring y asignación
- Cotizaciones con constructor visual
- Facturación con pagos
- Calendario integrado
- Reportes y analytics
- Panel de automatizaciones
- Dark/Light mode
- Responsive design

## Requisitos

- Node.js >= 20
- PostgreSQL 16
- Redis 7
- Docker (opcional)

## Instalación

```bash
# Clonar repositorio
git clone <url>
cd crm-jupa

# Instalar dependencias
npm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Iniciar base de datos (Docker)
docker compose -f .docker/docker-compose.yml up -d postgres redis

# Ejecutar migraciones
npm run db:migrate

# Generar Prisma Client
npm run db:generate

# Poblar base de datos con datos de prueba
npm run db:seed

# Iniciar en desarrollo
npm run dev
```

## Desarrollo

```bash
# Frontend (http://localhost:3000)
cd apps/web && npm run dev

# Backend (http://localhost:4000)
cd apps/api && npm run dev

# Swagger Docs (http://localhost:4000/api/docs)
# Prisma Studio (http://localhost:5555)
npm run db:studio
```

## Credenciales de Prueba

| Rol       | Email              | Contraseña  |
|-----------|--------------------|-------------|
| ADMIN     | admin@crm.com      | password123 |
| DIRECTOR  | director@crm.com   | password123 |
| MANAGER   | manager@crm.com    | password123 |
| SALES     | sales1@crm.com     | password123 |
| ARCHITECT | architect@crm.com  | password123 |
| DESIGNER  | designer@crm.com   | password123 |
| Contabilidad | accounting@crm.com | password123 |

## API Endpoints

La API está completamente documentada con Swagger en `/api/docs`.

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión

### Módulos Principales
- `GET/POST /api/contacts` - CRUD Contactos
- `GET/POST /api/companies` - CRUD Empresas
- `GET/POST /api/leads` - CRUD Leads
- `GET/POST /api/opportunities` - CRUD Oportunidades
- `GET/POST /api/quotes` - CRUD Cotizaciones
- `GET/POST /api/invoices` - CRUD Facturas
- `GET/POST /api/products` - CRUD Productos
- `GET/POST /api/activities` - CRUD Actividades
- `GET/POST /api/tasks` - CRUD Tareas
- `GET/POST /api/calendar` - CRUD Eventos

### Reportes y Dashboard
- `GET /api/dashboard/summary` - Resumen del dashboard
- `GET /api/dashboard/sales-pipeline` - Pipeline de ventas
- `GET /api/dashboard/monthly-revenue` - Ingresos mensuales
- `GET /api/dashboard/kpi` - Indicadores KPI
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/pipeline` - Reporte de pipeline
- `GET /api/reports/conversion` - Embudo de conversión

## Seguridad

- Autenticación JWT con refresh tokens
- Roles y permisos (RBAC) con 8 niveles
- Rate limiting por IP
- Protección contra XSS, CSRF, SQL Injection
- Encriptación de datos sensibles (AES-256)
- Auditoría completa de operaciones
- HTTPS en todas las comunicaciones
- Headers de seguridad (Helmet)

## Licencia

Propietaria - Todos los derechos reservados.
