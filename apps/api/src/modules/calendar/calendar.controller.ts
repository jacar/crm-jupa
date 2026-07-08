import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento de calendario' })
  create(@Body() dto: CreateCalendarEventDto) {
    return this.calendarService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos (paginado, filtro por fechas)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'startDate', required: false, description: 'Inicio del rango de fechas' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fin del rango de fechas' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.calendarService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCalendarEventDto) {
    return this.calendarService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un evento' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.remove(id);
  }
}


