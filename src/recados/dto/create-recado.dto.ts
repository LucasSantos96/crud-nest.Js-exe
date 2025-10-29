import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateRecadosDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly texto: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly de: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly para: string;
}
