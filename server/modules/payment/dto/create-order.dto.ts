import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import type { PayMethod } from '@shared/api.interface';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  payMethod: PayMethod;

  @IsOptional()
  @IsString()
  remark?: string;
}
