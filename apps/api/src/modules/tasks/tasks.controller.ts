import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas (paginado, filtros)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'isCompleted', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filtrar por prioridad' })
  @ApiQuery({ name: 'dueDateFrom', required: false, description: 'Fecha inicio rango' })
  @ApiQuery({ name: 'dueDateTo', required: false, description: 'Fecha fin rango' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('userId') userId?: string,
    @Query('priority') priority?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
  ) {
    return this.tasksService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      isCompleted: isCompleted === undefined ? undefined : isCompleted === 'true',
      userId,
      priority,
      dueDateFrom,
      dueDateTo,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar tarea como completada' })
  markComplete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.markComplete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}


