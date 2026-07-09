import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async simulateDelay(): Promise<void> {
    const delay = 1000 + Math.floor(Math.random() * 1000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async summarize(text: string) {
    this.logger.log(`AI Request: summarize - text length: ${text?.length ?? 0}`);
    await this.simulateDelay();
    const preview = text?.substring(0, 100) ?? '';
    return {
      summary: `[AI] The provided text discusses key points related to "${preview}...". The main themes include process optimization, stakeholder alignment, and measurable outcomes.`,
      originalLength: text?.length ?? 0,
      summaryLength: 120,
    };
  }

  async generateQuote(opportunityData: any) {
    this.logger.log(`AI Request: generate-quote - ${JSON.stringify(opportunityData)}`);
    await this.simulateDelay();
    return {
      quote: {
        id: `Q-${Date.now()}`,
        items: [
          { description: 'Professional services', quantity: 1, unitPrice: 2500, total: 2500 },
          { description: 'Software license (annual)', quantity: 5, unitPrice: 1200, total: 6000 },
          { description: 'Implementation & training', quantity: 1, unitPrice: 3500, total: 3500 },
        ],
        subtotal: 12000,
        tax: 2400,
        total: 14400,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '[AI] Pricing based on standard rates and estimated effort.',
      },
    };
  }

  async classifyLead(leadData: any) {
    this.logger.log(`AI Request: classify-lead - ${JSON.stringify(leadData)}`);
    await this.simulateDelay();
    const score = Math.random();
    let classification: string;
    let reason: string;

    if (score > 0.7) {
      classification = 'HIGH';
      reason = '[AI] Strong fit based on company size, engagement level, and budget indication.';
    } else if (score > 0.3) {
      classification = 'MEDIUM';
      reason = '[AI] Moderate fit; requires further qualification on timeline and decision authority.';
    } else {
      classification = 'LOW';
      reason = '[AI] Low priority due to limited budget mismatch or weak engagement signals.';
    }

    return { classification, score: Math.round(score * 100) / 100, reason };
  }

  async predictClose(opportunityData: any) {
    this.logger.log(`AI Request: predict-close - ${JSON.stringify(opportunityData)}`);
    await this.simulateDelay();
    const probability = Math.round(50 + Math.random() * 40);
    const daysToClose = Math.floor(15 + Math.random() * 60);
    const expectedDate = new Date(Date.now() + daysToClose * 24 * 60 * 60 * 1000);

    return {
      probability: `${probability}%`,
      expectedCloseDate: expectedDate.toISOString(),
      confidenceScore: Math.round((70 + Math.random() * 25) * 100) / 100,
      daysToClose,
    };
  }

  async suggestNextAction(opportunityData: any) {
    this.logger.log(`AI Request: suggest-next-action - ${JSON.stringify(opportunityData)}`);
    await this.simulateDelay();
    const actions = [
      { action: 'call', description: '[AI] Schedule a discovery call to understand pain points.', priority: 'high' },
      { action: 'email', description: '[AI] Send a follow-up email with relevant case studies.', priority: 'medium' },
      { action: 'meeting', description: '[AI] Propose a Material demo meeting with key stakeholders.', priority: 'high' },
      { action: 'proposal', description: '[AI] Prepare and send a tailored proposal.', priority: 'high' },
      { action: 'follow-up', description: '[AI] Follow up on previous discussion points.', priority: 'medium' },
      { action: 'research', description: '[AI] Research the prospect\'s recent initiatives and pain points.', priority: 'low' },
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  async analyzeMaterialivity(userData: any) {
    this.logger.log(`AI Request: analyze-Materialivity - ${JSON.stringify(userData)}`);
    await this.simulateDelay();
    return {
      userId: userData?.userId ?? 'unknown',
      period: 'last_30_days',
      metrics: {
        activitiesLogged: Math.floor(20 + Math.random() * 40),
        tasksCompleted: Math.floor(10 + Math.random() * 25),
        dealsClosed: Math.floor(2 + Math.random() * 8),
        callsMade: Math.floor(15 + Math.random() * 30),
        emailsSent: Math.floor(30 + Math.random() * 70),
        meetingsHeld: Math.floor(5 + Math.random() * 15),
      },
      efficiencyIndex: Math.round((60 + Math.random() * 35) * 100) / 100,
      recommendation: '[AI] Consider increasing follow-up cadence to improve close rate.',
    };
  }

  async generateEmail(emailContext: any) {
    this.logger.log(`AI Request: generate-email - ${JSON.stringify(emailContext)}`);
    await this.simulateDelay();
    const recipientName = emailContext?.recipientName ?? 'Prospect';
    const senderName = emailContext?.senderName ?? 'Sales Representative';

    return {
      subject: `[AI] Follow-up regarding ${emailContext?.topic ?? 'our discussion'}`,
      body: `Hi ${recipientName},

I hope this message finds you well. I wanted to follow up on our recent conversation regarding ${emailContext?.topic ?? 'potential collaboration'}.

Based on what we discussed, I believe our solution could provide significant value by addressing your key needs in this area. I've attached some additional information that outlines how we've helped similar organizations achieve their goals.

Would you be available for a brief call next week to explore this further? Please let me know what time works best for you.

Looking forward to hearing from you.

Best regards,
${senderName}`,
      tone: 'professional',
    };
  }

  async searchConstructionPrices(query: string) {
    this.logger.log(`AI Request: searchConstructionPrices - query: ${query}`);
    let apiKey = process.env.XAI_API_KEY || '';
    
    try {
      const grokIntegration = await this.prisma.integration.findFirst({
        where: { provider: 'GROK', isActive: true },
      });

      if (grokIntegration && grokIntegration.config) {
        const config: any = grokIntegration.config;
        if (config.apiKey) {
          apiKey = config.apiKey;
        }
      }

      if (!apiKey) {
        throw new Error('API Key de Grok no configurada');
      }

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert assistant for a construction CRM. The user will ask for estimated prices for construction materials or services. Provide realistic, concise estimates in local currency or USD, with a disclaimer that prices vary by region and supplier. Format the response clearly.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          model: 'grok-beta',
          stream: false,
          temperature: 0
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        answer: data.choices[0].message.content,
        success: true
      };
    } catch (error) {
      this.logger.error('Failed to query Grok API', error);
      return {
        answer: 'Hubo un error al consultar la API de Grok. Por favor, intenta de nuevo más tarde.',
        success: false
      };
    }
  }
}
