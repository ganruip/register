import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendCodeDto {
  @IsEmail({}, { message: '请输入正确的邮箱格式' })
  @ApiProperty({ type: String, description: '邮箱地址' })
  readonly email: string;
}
