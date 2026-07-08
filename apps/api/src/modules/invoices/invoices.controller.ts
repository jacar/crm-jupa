import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice with items' })
  create(@Body() dto: CreateInvoiceDto, @Request() req: any) {
    return this.invoicesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with pagination and filters' })
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID with items, payments, company, quote' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post('from-quote/:quoteId')
  @ApiOperation({ summary: 'Create invoice from a quote' })
  createFromQuote(
    @Param('quoteId') quoteId: string,
    @Request() req: any,
  ) {
    return this.invoicesService.createFromQuote(quoteId, req.user.id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record a payment on an invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(id, dto);
  }

  @Post(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for invoice (placeholder)' })
  generatePdf(@Param('id') id: string) {
    return this.invoicesService.generatePdf(id);
  }
}
