import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private configService: ConfigService) {}

  async createStripePaymentLink(amount: number, description: string) {
    try {
      const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `${this.configService.get('FRONTEND_URL')}/invoices/success`,
          'cancel_url': `${this.configService.get('FRONTEND_URL')}/invoices/cancel`,
          'line_items[0][price_data][currency]': 'clp',
          'line_items[0][price_data][Material_data][name]': description,
          'line_items[0][price_data][unit_amount]': String(Math.round(amount)),
          'line_items[0][quantity]': '1',
        }),
      });
      const data = await response.json();
      return { url: data.url, sessionId: data.id };
    } catch (error) {
      this.logger.error('Stripe payment link creation failed', error);
      return { error };
    }
  }

  async createMercadoPagoPreference(amount: number, description: string, externalReference: string) {
    try {
      const accessToken = this.configService.get('MERCADO_PAGO_ACCESS_TOKEN');
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ title: description, quantity: 1, unit_price: amount, currency_id: 'CLP' }],
          external_reference: externalReference,
          back_urls: {
            success: `${this.configService.get('FRONTEND_URL')}/invoices/success`,
            failure: `${this.configService.get('FRONTEND_URL')}/invoices/cancel`,
          },
          auto_return: 'approved',
        }),
      });
      const data = await response.json();
      return { url: data.init_point, preferenceId: data.id };
    } catch (error) {
      this.logger.error('Mercado Pago preference creation failed', error);
      return { error };
    }
  }
}
