import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { SendCodeDto } from '../dto/send-code.dto';
import { SignupDto } from '../dto/signup.dto';
import { UserService } from '../service/user.service';

@ApiTags('Users')
@Controller('/Users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('/sendCode')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiOkResponse({ type: String, description: '提示信息' })
  async sendCode(@Query() params: SendCodeDto): Promise<string> {
    await this.userService.sendCode(params.email);
    return '验证码已发送,请注意查收~';
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '邮箱注册' })
  @ApiCreatedResponse({ type: String, description: '提示信息' })
  signup(@Body() params: SignupDto): string {
    this.userService.signup(params.email, params.code);
    return '恭喜您!注册成功!';
  }
}
