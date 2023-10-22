import { PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';
import { IsNotEmptyNumber } from 'src/common/decorators/is-not-empty-number.decorator';
import { CreateBoardDto } from './create-board.dto';

interface Image {
  url: string;
  key: string;
}

export class UpdateBoardDto {
  @IsOptional()
  readonly id: number;

  @IsNotEmptyNumber()
  readonly b_id: number;

  @IsNotEmptyString()
  readonly title: string;

  @IsNotEmptyString()
  readonly content: string;

  @IsOptional()
  readonly tags: string[];

  @IsOptional()
  readonly images: Image[];
}
