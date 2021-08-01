import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { UserService } from './user.service';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/service/mail.service';
import { UserRepositoryService } from '../../database/service/user-repository.service';
import { DatabaseModule } from '../../database/database.module';
import { User } from '../../database/entity/user';

describe('UserService', () => {
  let userService: UserService;
  let mailService: MailService;
  let configService: ConfigService;
  let userRepositoryService: UserRepositoryService;
  const email = '123@qq.com';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        MailModule,
        DatabaseModule,
      ],
      providers: [UserService],
    }).compile();

    configService = moduleRef.get<ConfigService>(ConfigService);
    userService = moduleRef.get<UserService>(UserService);
    mailService = moduleRef.get<MailService>(MailService);
    userRepositoryService = moduleRef.get<UserRepositoryService>(
      UserRepositoryService,
    );
  });

  describe('checkEmail', () => {
    it('should check email success', () => {
      jest
        .spyOn(userRepositoryService, 'findByEmail')
        .mockImplementation(() => undefined);
      userService.checkEmail(email);
      expect(true).toBe(true);
    });

    it('should check email fail with exists email', () => {
      jest.spyOn(userRepositoryService, 'findByEmail').mockImplementation(() =>
        plainToClass(User, {
          email,
        }),
      );
      try {
        userService.checkEmail(email);
        throw new Error('should not execute');
      } catch (err) {
        expect(err.message).toBe('该邮箱已注册!');
      }
    });
  });

  describe('sendCode', () => {
    it('should send email success', async () => {
      jest.spyOn(userService, 'checkEmail').mockImplementation(() => undefined);
      jest.spyOn(mailService, 'send').mockImplementation(async () => true);
      const code = await userService.sendCode(email);
      expect(typeof code).toBe('string');
      expect(code.length).toBe(6);
    });

    it('should send fail with incorrect email', async () => {
      jest.spyOn(userService, 'checkEmail').mockImplementation(() => undefined);
      jest.spyOn(mailService, 'send').mockImplementation(async () => false);
      try {
        await userService.sendCode('12345');
        throw new Error('should not execute');
      } catch (err) {
        expect(err.message).toBe('发送失败,请检查邮箱是否正确~');
      }
    });
  });

  describe('signup', () => {
    it('should signup success', async () => {
      jest.spyOn(userService, 'checkEmail').mockImplementation(() => undefined);
      jest.spyOn(mailService, 'send').mockImplementation(async () => true);
      const code = await userService.sendCode(email);
      jest
        .spyOn(userRepositoryService, 'create')
        .mockImplementation(() => plainToClass(User, { email }));
      await userService.signup(email, code);
      expect(true).toBe(true);
    });

    it('should signup fail with expired code', async () => {
      jest.spyOn(userService, 'checkEmail').mockImplementation(() => undefined);
      jest.spyOn(mailService, 'send').mockImplementation(async () => true);
      const start = Date.now();
      const codeValidMinutes =
        configService.get<number>('VERIFY_CODE_VALID_MINUTES') + 1;
      // 设置一个过期时间(毫秒) = 当前时间 + (有效分钟 + 1) * 60 * 1000;
      const expireTime: number = start + codeValidMinutes * 60 * 1000;
      const code = await userService.sendCode(email);
      jest
        .spyOn(userRepositoryService, 'create')
        .mockImplementation(() => plainToClass(User, { email }));
      try {
        // 改写获取的时间戳让验证码校验过期
        Date.now = jest.fn().mockReturnValue(expireTime);
        await userService.signup(email, code);
        throw new Error('should not execute');
      } catch (err) {
        expect(err.message).toBe('验证码无效!');
      }
    });

    it('should signup fail with incorrect code', async () => {
      jest.spyOn(userService, 'checkEmail').mockImplementation(() => undefined);
      jest
        .spyOn(userRepositoryService, 'create')
        .mockImplementation(() => plainToClass(User, { email }));
      try {
        await userService.signup(email, '123456');
        throw new Error('should not execute');
      } catch (err) {
        expect(err.message).toBe('验证码无效!');
      }
    });
  });
});
