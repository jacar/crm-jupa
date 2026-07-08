import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { EmailService } from './services/email.service';
import { WhatsAppService } from './services/whatsapp.service';
import { CalendarSyncService } from './services/calendar-sync.service';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    EmailService,
    WhatsAppService,
    CalendarSyncService,
    PaymentService,
  ],
  exports: [
    IntegrationsService,
    EmailService,
    WhatsAppService,
    CalendarSyncService,
    PaymentService,
  ],
})
export class IntegrationsModule {}
