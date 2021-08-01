import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SendCodeDto } from './send-code.dto';

export class SignupDto extends SendCodeDto {
  @IsString({ message: '请输入验证码' })
  @ApiProperty({ type: String, description: '验证码' })
  readonly code: string;
}
