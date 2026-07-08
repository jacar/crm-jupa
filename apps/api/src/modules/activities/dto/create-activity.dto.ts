import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, example: 'CALL' })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 'Llamada de seguimiento' })
  @IsString()
  subject: string;

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

  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'uuid-del-contacto' })
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-oportunidad' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;
}
