import { Test } from '@nestjs/testing';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: MailerService;
  const commonTestData = {
    subject: '单元测试,请忽略',
    html: '您的注册验证码为<b style="color: red;">123456</b>，此验证码将用于验证身份，5分钟内有效，请勿将验证码透漏给其他人。本邮件由系统自动发送，请勿直接回复！',
  };
  const successResponse = '250 OK: queued as.';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        MailerModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            transport: {
              host: configService.get<string>('MAILER_HOST'),
              port: configService.get<number>('MAILER_PORT'),
              secure: configService.get<boolean>('MAILER_SECURE'),
              auth: {
                user: configService.get<string>('MAILER_USER'),
                pass: configService.get<string>('MAILER_PASSWORD'),
              },
            },
            defaults: {
              from: configService.get<string>('MAILER_USER'),
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [MailService],
    }).compile();

    mailService = moduleRef.get<MailService>(MailService);
    mailerService = moduleRef.get<MailerService>(MailerService);
  });

  describe('send', () => {
    it('should send single email success', async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(async () => ({
        response: successResponse,
      }));
      const result = await mailService.send({
        emails: ['835725800@qq.com'],
        ...commonTestData,
      });
      expect(result).toBe(true);
    });

    it('should send multi email success', async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(async () => ({
        response: successResponse,
      }));
      const result = await mailService.send({
        emails: ['835725800@qq.com', '3191407881@qq.com'],
        ...commonTestData,
      });
      expect(result).toBe(true);
    });

    it('should send fail with incorrect email', async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(async () => ({
        response: 'mailer server is boom',
      }));
      const result = await mailService.send({
        emails: ['123456'],
        ...commonTestData,
      });
      expect(result).toBe(false);
    });
  });
});
