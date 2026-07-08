import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';

@Module({
  providers: [WhatsappService, WhatsappGateway],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
