import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAutomationRuleDto } from './dto/create-automation-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-automation-rule.dto';
import { AutomationTrigger, AutomationAction } from '@prisma/client';
import { EmailService } from '../integrations/services/email.service';
import { WhatsAppService } from '../integrations/services/whatsapp.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async create(dto: CreateAutomationRuleDto) {
    const rule = await this.prisma.automationRule.create({ data: dto });
    this.logger.log(`Automation rule created: ${rule.name}`);
    return rule;
  }

  async findAll() {
    return this.prisma.automationRule.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla de automatización no encontrada');
    return rule;
  }

  async update(id: string, dto: UpdateAutomationRuleDto) {
    await this.findOne(id);
    return this.prisma.automationRule.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.automationRule.delete({ where: { id } });
    return { message: 'Regla de automatización eliminada correctamente' };
  }

  async trigger(id: string) {
    const rule = await this.findOne(id);
    const result = await this.executeAction(rule.action, rule.config as any);
    this.logger.log(`Manual trigger for rule: ${rule.name} (${rule.action})`);
    return { message: `Regla "${rule.name}" ejecutada manualmente`, rule, result };
  }

  async evaluate(trigger: AutomationTrigger, context: Record<string, any>) {
    const rules = await this.prisma.automationRule.findMany({
      where: { trigger, isActive: true },
      orderBy: { order: 'asc' },
    });

    this.logger.log(`Evaluating ${rules.length} rule(s) for trigger: ${trigger}`);

    const results = [];
    for (const rule of rules) {
      try {
        const result = await this.executeAction(rule.action, { ...rule.config as any, ...context });
        results.push({ ruleId: rule.id, name: rule.name, action: rule.action, success: true, result });
      } catch (error) {
        results.push({ ruleId: rule.id, name: rule.name, action: rule.action, success: false, error: String(error) });
      }
    }

    return { trigger, context, actions: results };
  }

  private async executeAction(action: AutomationAction, config: any) {
    switch (action) {
      case 'ASSIGN_USER':
        return this.assignUser(config);
      case 'CREATE_TASK':
        return this.createTask(config);
      case 'SEND_EMAIL':
        return this.emailService.sendMail(config.to, config.subject, config.html);
      case 'SEND_WHATSAPP':
        return this.whatsappService.sendText(config.to, config.message);
      case 'NOTIFY_ADMIN':
        return this.notifyAdmin(config);
      case 'CREATE_OPPORTUNITY':
        return this.createOpportunity(config);
      default:
        return { message: `Action ${action} executed (no specific handler)` };
    }
  }

  private async assignUser(config: { entityType?: string; entityId?: string; userId?: string }) {
    if (config.entityType === 'lead' && config.entityId && config.userId) {
      await this.prisma.lead.update({
        where: { id: config.entityId },
        data: { assignedTo: config.userId },
      });
      return { assigned: true, userId: config.userId };
    }
    return { assigned: false, message: 'Configuración incompleta para asignación' };
  }

  private async createTask(config: { title?: string; userId?: string; dueDate?: string; description?: string }) {
    if (config.title && config.userId) {
      const task = await this.prisma.task.create({
        data: {
          title: config.title,
          description: config.description || '',
          userId: config.userId,
          dueDate: config.dueDate ? new Date(config.dueDate) : null,
        },
      });
      return { created: true, taskId: task.id };
    }
    return { created: false, message: 'Configuración incompleta para crear tarea' };
  }

  private async notifyAdmin(config: { message?: string; type?: string }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
    });
    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Notificación Automática',
          message: config.message || 'Evento automático ejecutado',
          userId: admin.id,
          channel: 'INTERNAL',
        },
      });
    }
    return { notified: admins.length, users: admins.map((a) => a.email) };
  }

  private async createOpportunity(config: { name?: string; leadId?: string; amount?: number }) {
    if (config.name && config.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: config.leadId },
        include: { company: true },
      });
      if (!lead) return { created: false, message: 'Lead no encontrado' };
      const opportunity = await this.prisma.opportunity.create({
        data: {
          name: config.name,
          amount: config.amount || 0,
          stage: 'VISITA_TERRENO',
          companyId: lead.companyId,
          leadId: lead.id,
          assignedTo: lead.assignedTo,
        },
      });
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'CONVERTED', convertedAt: new Date() },
      });
      return { created: true, opportunityId: opportunity.id };
    }
    return { created: false, message: 'Configuración incompleta' };
  }
}

