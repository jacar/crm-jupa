import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

const invoiceInclude = {
  items: {
    include: { material: true },
  },
  payments: true,
  company: true,
  quote: true,
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

@Injectable()
export class InvoicesService {
  private readonly TAX_RATE = 0.19;

  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(): Promise<string> {
    const count = await this.prisma.invoice.count();
    return `INV-${String(count + 1).padStart(6, '0')}`;
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

  async create(dto: CreateInvoiceDto, userId: string) {
    const number = await this.generateNumber();
    const totals = this.calculateTotals(dto.items);

    return this.prisma.invoice.create({
      data: {
        number,
        companyId: dto.companyId,
        quoteId: dto.quoteId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
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
      include: invoiceInclude,
    });
  }

  async findAll(query: InvoiceQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      companyId,
      dueDateFrom,
      dueDateTo,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: invoiceInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.companyId !== undefined) updateData.company = { connect: { id: dto.companyId } };
    if (dto.dueDate !== undefined)
      updateData.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.items) {
      const totals = this.calculateTotals(dto.items);
      Object.assign(updateData, totals);

      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return this.prisma.invoice.update({
        where: { id },
        data: {
          ...updateData,
          items: {
            create: dto.items.map((item) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: invoiceInclude,
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: invoiceInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.invoice.delete({ where: { id } });
  }

  async createFromQuote(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    const number = await this.generateNumber();

    return this.prisma.invoice.create({
      data: {
        number,
        subtotal: Number(quote.subtotal),
        tax: Number(quote.tax),
        taxRate: Number(quote.taxRate),
        discount: Number(quote.discount),
        total: Number(quote.total),
        companyId: quote.companyId,
        quoteId: quote.id,
        createdById: userId,
        items: {
          create: quote.items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          })),
        },
      },
      include: invoiceInclude,
    });
  }

  async recordPayment(id: string, dto: RecordPaymentDto) {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled invoice');
    }

    const payment = await this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference,
        transactionId: dto.transactionId,
        notes: dto.notes,
        invoiceId: id,
      },
    });

    const totalPaid =
      Number(invoice.amountPaid) + Number(dto.amount);
    const total = Number(invoice.total);

    let status: InvoiceStatus;
    if (totalPaid >= total) {
      status = InvoiceStatus.PAID;
    } else {
      status = InvoiceStatus.PARTIAL;
    }

    await this.prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: totalPaid,
        status,
        paidAt: status === InvoiceStatus.PAID ? new Date() : undefined,
      },
    });

    return payment;
  }

  async generatePdf(id: string) {
    await this.findOne(id);
    return { message: 'PDF generation placeholder', invoiceId: id };
  }
}


