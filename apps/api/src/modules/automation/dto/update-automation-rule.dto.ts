import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

export class UpdateAutomationRuleDto {
  @ApiPropertyOptional({ example: 'Asignar lead al vendedor' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Automáticamente asigna un lead al vendedor disponible' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: AutomationTrigger, example: 'LEAD_CREATED' })
  @IsEnum(AutomationTrigger)
  @IsOptional()
  trigger?: AutomationTrigger;

  @ApiPropertyOptional({ enum: AutomationAction, example: 'ASSIGN_USER' })
  @IsEnum(AutomationAction)
  @IsOptional()
  action?: AutomationAction;

  @ApiPropertyOptional({ example: { userId: 'uuid', stage: 'qualification' } })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  order?: number;
}
