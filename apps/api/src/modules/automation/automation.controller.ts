import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { CreateAutomationRuleDto } from './dto/create-automation-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-automation-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AutomationTrigger } from '@prisma/client';

@ApiTags('Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una regla de automatización' })
  create(@Body() dto: CreateAutomationRuleDto) {
    return this.automationService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todas las reglas de automatización' })
  findAll() {
    return this.automationService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener una regla de automatización por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.automationService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una regla de automatización' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAutomationRuleDto) {
    return this.automationService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una regla de automatización' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.automationService.remove(id);
  }

  @Post(':id/trigger')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ejecutar manualmente una regla de automatización' })
  trigger(@Param('id', ParseUUIDPipe) id: string) {
    return this.automationService.trigger(id);
  }

  @Post('evaluate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Evaluar reglas para un trigger dado' })
  evaluate(
    @Body('trigger') trigger: AutomationTrigger,
    @Body('context') context: Record<string, any>,
  ) {
    return this.automationService.evaluate(trigger, context);
  }
}
