import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly mailerService: MailerService) {}
  /**
   * 发送邮件
   * @param emails 邮箱
   * @returns 是否发送成功
   */
  async send(params: {
    emails: string[];
    subject: string;
    html: string;
  }): Promise<boolean> {
    const { emails, subject, html } = params;
    try {
      const result = await this.mailerService.sendMail({
        to: emails,
        subject,
        html,
      });
      if (result && result.response === '250 OK: queued as.') {
        return true;
      }
      throw new Error(result);
    } catch (error) {
      this.logger.error({ message: 'send email failed', params, error });
    }
    return false;
  }
}
