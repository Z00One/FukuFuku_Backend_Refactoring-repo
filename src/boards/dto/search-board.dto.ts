import { IsNotEmptyString } from "src/common/decorators/is-not-empty-string.decorator";
import { IsIn, IsOptional, Matches, ValidateIf } from "class-validator";
import { BadRequestException } from "@nestjs/common";
const IsDate = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export type AllowedSearchOption = "recent" | "trendy";

export class SearchBoardDto {
  @IsOptional()
  @IsNotEmptyString()
  @IsIn(["recent", "trendy"])
  readonly option: AllowedSearchOption;

  @IsOptional()
  @ValidateIf((object, value) => {
    if ((!object.lte && value) || (object.lte && !value)) {
      throw new BadRequestException("lte, gte 두 개의 값은 세트여야 합니다.");
    }
    return true;
  })
  @Matches(IsDate)
  readonly gte: string;

  @IsOptional()
  @Matches(IsDate)
  readonly lte: string;

  @IsOptional()
  readonly lastId: number;
}
