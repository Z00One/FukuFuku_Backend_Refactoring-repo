import { IsNotEmptyString } from "src/common/decorators/is-not-empty-string.decorator";
import { IsNotEmptyNumber } from "src/common/decorators/is-not-empty-number.decorator";
import { IsOptional } from "class-validator";

export interface Image {
  url: string;
}

export class CreateBoardDto {
  @IsNotEmptyString()
  readonly title: string;

  @IsNotEmptyString()
  readonly content: string;

  @IsNotEmptyNumber()
  readonly id: number; // 유저의 id를 여기에 추가해야합니다.

  @IsOptional()
  readonly images: Image[]; // 업로드 했던 이미지들을 담아서 보냅니다.

  @IsOptional()
  readonly tags: string[];
}
