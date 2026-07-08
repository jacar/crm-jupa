import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private apiUrl = 'https://graph.facebook.com/v18.0';
  private phoneNumberId: string;
  private token: string;

  constructor(private configService: ConfigService) {
    this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_ID', '');
    this.token = this.configService.get('WHATSAPP_TOKEN', '');
  }

  async sendMessage(to: string, templateName: string, parameters: any[] = []) {
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_Material: 'whatsapp',
          to,
          type: 'template',
          template: { name: templateName, language: { code: 'es' }, components: [{ type: 'body', parameters: parameters.map(p => ({ type: 'text', text: p })) }] },
        }),
      });
      const data = await response.json();
      this.logger.log(`WhatsApp sent to ${to}`);
      return data;
    } catch (error) {
      this.logger.error(`WhatsApp send failed to ${to}`, error);
      return { success: false, error };
    }
  }

  async sendText(to: string, text: string) {
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_Material: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      });
      return await response.json();
    } catch (error) {
      this.logger.error(`WhatsApp text failed to ${to}`, error);
      return { success: false, error };
    }
  }
}
