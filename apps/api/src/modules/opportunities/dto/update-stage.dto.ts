import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStage } from '@prisma/client';

export class UpdateStageDto {
  @ApiProperty({ enum: OpportunityStage })
  @IsEnum(OpportunityStage)
  stage: OpportunityStage;

  @ApiPropertyOptional({ example: 'El cliente solicita cambios adicionales' })
  @IsOptional()
  @IsString()
  reason?: string;
}
