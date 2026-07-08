import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

export class CreateAutomationRuleDto {
  @ApiProperty({ example: 'Asignar lead al vendedor' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Automáticamente asigna un lead al vendedor disponible' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AutomationTrigger, example: 'LEAD_CREATED' })
  @IsEnum(AutomationTrigger)
  trigger: AutomationTrigger;

  @ApiProperty({ enum: AutomationAction, example: 'ASSIGN_USER' })
  @IsEnum(AutomationAction)
  action: AutomationAction;

  @ApiPropertyOptional({ example: { userId: 'uuid', stage: 'qualification' } })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
