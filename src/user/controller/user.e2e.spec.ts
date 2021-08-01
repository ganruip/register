import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MailModule } from '../../mail/mail.module';
import { DatabaseModule } from '../../database/database.module';
import { UserModule } from '../user.module';
import { HttpExceptionFilter } from '../../common/filter/http-exception-filter';
import { UserService } from '../service/user.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const email = '123@qq.com';
  const incorrectEmail = '123456';
  const code = '123456';
  const userService = {
    sendCode: async () => code,
    signup: () => undefined,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        MailModule,
        DatabaseModule,
        UserModule,
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/Users/sendCode (GET)', () => {
    it('should get tips', () => {
      return request(app.getHttpServer())
        .get('/Users/sendCode')
        .query({
          email,
        })
        .expect(HttpStatus.OK)
        .expect('验证码已发送,请注意查收~');
    });

    it('should get error tips with incorrect email', () => {
      return request(app.getHttpServer())
        .get('/Users/sendCode')
        .query({
          email: incorrectEmail,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入正确的邮箱格式');
    });

    it('should get error tips without email', () => {
      return request(app.getHttpServer())
        .get('/Users/sendCode')
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入正确的邮箱格式');
    });

    it('should get error tips', () => {
      const tips = '发送失败,请检查邮箱是否正确~';
      jest.spyOn(userService, 'sendCode').mockImplementation(async () => {
        throw new Error(tips);
      });
      return request(app.getHttpServer())
        .get('/Users/sendCode')
        .query({
          email,
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect(tips);
    });
  });

  describe('/Users (POST)', () => {
    it('should get tips', () => {
      return request(app.getHttpServer())
        .post('/Users')
        .set({
          'Content-Type': 'application/json',
        })
        .send({
          email,
          code,
        })
        .expect(HttpStatus.CREATED)
        .expect('恭喜您!注册成功!');
    });

    it('should get error tips with incorrect email', () => {
      return request(app.getHttpServer())
        .post('/Users')
        .set({
          'Content-Type': 'application/json',
        })
        .send({
          email: incorrectEmail,
          code,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入正确的邮箱格式');
    });

    it('should get error tips without email', () => {
      return request(app.getHttpServer())
        .post('/Users')
        .set({
          'Content-Type': 'application/json',
        })
        .send({
          code,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入正确的邮箱格式');
    });

    it('should get error tips without code', () => {
      return request(app.getHttpServer())
        .post('/Users')
        .set({
          'Content-Type': 'application/json',
        })
        .send({
          email,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入验证码');
    });

    it('should get error tips without email and code', () => {
      return request(app.getHttpServer())
        .post('/Users')
        .expect(HttpStatus.BAD_REQUEST)
        .expect('请输入验证码,请输入正确的邮箱格式');
    });
  });
});
