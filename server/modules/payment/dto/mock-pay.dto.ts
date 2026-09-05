import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class MockPayDto {
  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;
}
