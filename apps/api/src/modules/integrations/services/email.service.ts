import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string, attachments?: any[]) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@crmjupa.com'),
        to,
        subject,
        html,
        attachments,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return { success: false, error };
    }
  }

  async sendQuote(quote: any, pdfBuffer: Buffer, to: string) {
    return this.sendMail(
      to,
      `Cotización ${quote.number} - CRM Jupa`,
      `<h2>Cotización ${quote.number}</h2><p>Adjuntamos su cotización solicitada.</p>`,
      [{ filename: `cotizacion-${quote.number}.pdf`, content: pdfBuffer }],
    );
  }

  async sendInvoice(invoice: any, pdfBuffer: Buffer, to: string) {
    return this.sendMail(
      to,
      `Factura ${invoice.number} - CRM Jupa`,
      `<h2>Factura ${invoice.number}</h2><p>Adjuntamos su factura.</p>`,
      [{ filename: `factura-${invoice.number}.pdf`, content: pdfBuffer }],
    );
  }

  async sendWelcome(email: string, name: string) {
    return this.sendMail(
      email,
      'Bienvenido a CRM Jupa',
      `<h2>¡Bienvenido, ${name}!</h2><p>Gracias por confiar en nosotros.</p>`,
    );
  }
}
