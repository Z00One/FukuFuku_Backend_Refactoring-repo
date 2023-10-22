import { IsNotEmpty } from 'class-validator';

export class TagDto {
  @IsNotEmpty()
  readonly name: string;
}
