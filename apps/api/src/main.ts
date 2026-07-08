import { NestFactory } from '@nestjs/core';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CRM Jupa API')
    .setDescription('API del CRM Empresarial')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Contacts', 'Gestión de contactos')
    .addTag('Companies', 'Gestión de empresas')
    .addTag('Leads', 'Gestión de leads')
    .addTag('Opportunities', 'Gestión de oportunidades')
    .addTag('Quotes', 'Gestión de cotizaciones')
    .addTag('Invoices', 'Gestión de facturas')
    .addTag('Materials', 'Gestión de Materialos')
    .addTag('Activities', 'Gestión de actividades')
    .addTag('Tasks', 'Gestión de tareas')
    .addTag('Calendar', 'Calendario y eventos')
    .addTag('Notifications', 'Notificaciones')
    .addTag('Reports', 'Reportes y analytics')
    .addTag('Dashboard', 'Dashboard e indicadores')
    .addTag('Automation', 'Reglas de automatización')
    .addTag('Integrations', 'Integraciones externas')
    .addTag('Files', 'Gestión de archivos')
    .addTag('Audit', 'Auditoría y logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`CRM API running on port ${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
