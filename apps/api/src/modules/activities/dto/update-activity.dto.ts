import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class UpdateActivityDto {
  @ApiPropertyOptional({ enum: ActivityType, example: 'CALL' })
  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @ApiPropertyOptional({ example: 'Llamada de seguimiento' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ example: 'Cliente interesado en el Materialo' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Cliente confirmó compra' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: '2025-06-15T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 'uuid-del-contacto' })
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-oportunidad' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;
}
