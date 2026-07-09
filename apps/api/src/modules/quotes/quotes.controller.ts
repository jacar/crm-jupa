import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a quote with items' })
  create(@Body() dto: CreateQuoteDto, @Request() req: any) {
    return this.quotesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List quotes with pagination and filters' })
  findAll(@Query() query: QuoteQueryDto) {
    return this.quotesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID with items, company, contact, opportunity' })
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quote' })
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update quote status (draft→sent→viewed→accepted/rejected)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, dto);
  }

  @Post(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for quote' })
  generatePdf(@Param('id') id: string) {
    return this.quotesService.generatePdf(id);
  }

  @Get(':id/pdf/download')
  @ApiOperation({ summary: 'Download PDF for quote' })
  async downloadPdf(@Param('id') id: string, @Res() res: any) {
    try {
      const { filePath } = await this.quotesService.generatePdf(id);
      res.download(filePath);
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el PDF', error: error.message });
    }
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send quote by email (placeholder)' })
  sendEmail(@Param('id') id: string) {
    return this.quotesService.sendEmail(id);
  }
}
