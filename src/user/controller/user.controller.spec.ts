import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../database/database.module';
import { MailModule } from '../../mail/mail.module';
import { UserService } from '../service/user.service';
import { UserController } from './user.controller';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  const email = '123@qq.com';
  const code = '123456';

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        MailModule,
        DatabaseModule,
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
  });

  describe('sendCode', () => {
    it('should return tips', async () => {
      jest.spyOn(userService, 'sendCode').mockImplementation(async () => code);
      expect(await userController.sendCode({ email })).toBe(
        '验证码已发送,请注意查收~',
      );
    });
  });

  describe('signup', () => {
    it('should return tips', () => {
      jest.spyOn(userService, 'signup').mockImplementation(() => undefined);
      expect(userController.signup({ email, code })).toBe('恭喜您!注册成功!');
    });
  });
});
