import { MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../../common/decorators/is-not-empty-string.decorator';
import { IsNotEmptyEmail } from 'src/common/decorators/is-not-empty-email.decorator';
export class CreateUserDto {
  @IsNotEmptyEmail()
  @MaxLength(40)
  readonly email: string;

  @IsNotEmptyString()
  @MaxLength(100)
  readonly picture: string;

  @IsNotEmptyString()
  @MaxLength(10)
  readonly family_name: string;
  
  @IsNotEmptyString()
  @MaxLength(15)
  readonly given_name: string;
}
