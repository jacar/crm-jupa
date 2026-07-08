import { IsString, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePipelineStageDto {
  @ApiProperty({ description: 'Nombre de la etapa' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Orden de la etapa' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'Color de la etapa', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Probabilidad de cierre', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiProperty({ description: 'ID del usuario' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'ID de la oportunidad' })
  @IsUUID()
  opportunityId: string;
}
