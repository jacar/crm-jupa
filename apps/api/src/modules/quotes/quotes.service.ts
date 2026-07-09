import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { QuoteStatus, Prisma } from '@prisma/client';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

const quoteInclude = {
  items: {
    include: { material: true },
  },
  company: true,
  contact: true,
  opportunity: true,
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

@Injectable()
export class QuotesService {
  private readonly TAX_RATE = 0.19;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  private async generateNumber(): Promise<string> {
    const count = await this.prisma.quote.count();
    return `QTE-${String(count + 1).padStart(6, '0')}`;
  }

  private calculateTotals(
    items: { quantity: number; unitPrice: number }[],
    discount = 0,
  ) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total, taxRate: this.TAX_RATE };
  }

  async create(dto: CreateQuoteDto, userId: string) {
    const number = await this.generateNumber();
    const totals = this.calculateTotals(dto.items, dto.discount);

    return this.prisma.quote.create({
      data: {
        number,
        title: dto.title,
        companyId: dto.companyId,
        contactId: dto.contactId,
        opportunityId: dto.opportunityId,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        notes: dto.notes,
        terms: dto.terms,
        discount: dto.discount ?? 0,
        ...totals,
        createdById: userId,
        items: {
          create: dto.items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: quoteInclude,
    });
  }

  async findAll(query: QuoteQueryDto) {
    const { page = 1, limit = 10, status, companyId, opportunityId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (opportunityId) where.opportunityId = opportunityId;

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        include: quoteInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: quoteInclude,
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async update(id: string, dto: UpdateQuoteDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.companyId !== undefined) updateData.company = { connect: { id: dto.companyId } };
    if (dto.contactId !== undefined) updateData.contact = { connect: { id: dto.contactId } };
    if (dto.opportunityId !== undefined)
      updateData.opportunity = { connect: { id: dto.opportunityId } };
    if (dto.validUntil !== undefined)
      updateData.validUntil = new Date(dto.validUntil);
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.terms !== undefined) updateData.terms = dto.terms;

    if (dto.items) {
      const totals = this.calculateTotals(dto.items, dto.discount);
      Object.assign(updateData, totals);
      if (dto.discount !== undefined) updateData.discount = dto.discount;
      updateData.items = {
        deleteMany: {},
        create: dto.items.map((item) => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      };
    }

    if (dto.discount !== undefined) {
      const existing = await this.prisma.quote.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
      const items = existing.items.map((i) => ({
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));
      const totals = this.calculateTotals(items, dto.discount);
      Object.assign(updateData, totals);
      updateData.discount = dto.discount;
    }

    return this.prisma.quote.update({
      where: { id },
      data: updateData,
      include: quoteInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.quote.delete({ where: { id } });
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    const quote = await this.findOne(id);
    const { status } = dto;

    const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
      [QuoteStatus.DRAFT]: [QuoteStatus.SENT],
      [QuoteStatus.SENT]: [QuoteStatus.VIEWED],
      [QuoteStatus.VIEWED]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED],
      [QuoteStatus.ACCEPTED]: [],
      [QuoteStatus.REJECTED]: [],
      [QuoteStatus.EXPIRED]: [],
    };

    const allowed = validTransitions[quote.status as QuoteStatus];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${quote.status} to ${status}`,
      );
    }

    const updateData: Prisma.QuoteUpdateInput = { status };
    if (status === QuoteStatus.ACCEPTED) {
      updateData.acceptedAt = new Date();
    }

    const updated = await this.prisma.quote.update({
      where: { id },
      data: updateData,
      include: quoteInclude,
    });

    if (status === QuoteStatus.ACCEPTED) {
      await this.createInvoiceFromQuote(quote);
    }

    return updated;
  }

  private async createInvoiceFromQuote(quote: any) {
    const existing = await this.prisma.invoice.findFirst({
      where: { quoteId: quote.id },
    });
    if (existing) return;

    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

    await this.prisma.invoice.create({
      data: {
        number: invoiceNumber,
        subtotal: Number(quote.subtotal),
        tax: Number(quote.tax),
        taxRate: Number(quote.taxRate),
        discount: Number(quote.discount),
        total: Number(quote.total),
        status: 'SENT' as any,
        companyId: quote.companyId,
        quoteId: quote.id,
        createdById: quote.createdById,
        items: {
          create: quote.items.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          })),
        },
      },
    });
  }

  async generatePdf(id: string) {
    const quote = await this.findOne(id);
    const buffer = await this.pdfService.generateQuotePdfBuffer(quote);
    return buffer;
  }

  async sendEmail(id: string) {
    const quote = await this.findOne(id);
    return {
      message: 'Email sending placeholder',
      quoteId: id,
      contactId: quote.contactId || null,
    };
  }
}


