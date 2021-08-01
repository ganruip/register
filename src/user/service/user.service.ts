import { Injectable, Logger } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail/service/mail.service';
import { UserRepositoryService } from '../../database/service/user-repository.service';
import { User } from '../../database/entity/user';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly codeValidMinutes: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly userRepositoryService: UserRepositoryService,
  ) {
    this.codeValidMinutes = configService.get<number>(
      'VERIFY_CODE_VALID_MINUTES',
    );
  }

  /**
   * 检查邮箱是否已注册
   * @param email 邮箱
   */
  checkEmail(email: string): void {
    const user = this.userRepositoryService.findByEmail(email);
    if (user) {
      throw new Error('该邮箱已注册!');
    }
  }

  /**
   * 发送邮箱验证码
   * @param email 邮箱
   */
  async sendCode(email: string): Promise<string> {
    this.checkEmail(email);

    const code = speakeasy.totp({
      secret: email,
    });

    const sendResult = await this.mailService.send({
      emails: [email],
      subject: '注册验证码',
      html: `您的注册验证码为<b style="color: red;">${code}</b>，此验证码将用于验证身份，${this.codeValidMinutes}分钟内有效，请勿将验证码透漏给其他人。本邮件由系统自动发送，请勿直接回复！`,
    });

    if (!sendResult) {
      throw new Error('发送失败,请检查邮箱是否正确~');
    }

    return code;
  }

  /**
   * 用户注册
   * 校验验证码
   * 存储用户信息
   * @param email 邮箱
   * @param code 验证码
   */
  signup(email: string, code: string): void {
    const checkResult = speakeasy.totp.verify({
      secret: email,
      token: code,
      window: this.codeValidMinutes * 2, // 验证码有效期窗口,默认一个窗口单位是30秒,需乘以2转换
    });
    if (!checkResult) {
      throw new Error('验证码无效!');
    }

    this.checkEmail(email);

    this.userRepositoryService.create(plainToClass(User, { email }));
  }
}
