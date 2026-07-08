import { IsString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsString()
  materialId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

