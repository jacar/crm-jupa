import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { EmailService } from '../integrations/services/email.service';
import { WhatsAppService } from '../integrations/services/whatsapp.service';

@Module({
  controllers: [AutomationController],
  providers: [AutomationService, EmailService, WhatsAppService],
  exports: [AutomationService],
})
export class AutomationModule {}
