import { Test } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { User } from '../entity/user';
import { UserRepositoryService } from './user-repository.service';

describe('UserRepositoryService', () => {
  let userRepositoryService: UserRepositoryService;
  const email = '123@qq.com';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UserRepositoryService],
    }).compile();

    userRepositoryService = moduleRef.get<UserRepositoryService>(
      UserRepositoryService,
    );
  });

  describe('create', () => {
    it('should create user success', async () => {
      const user = userRepositoryService.create(plainToClass(User, { email }));
      expect(user.email).toBe(email);
    });
  });

  describe('findByEmail', () => {
    it('should find user with exists email', async () => {
      userRepositoryService.create(plainToClass(User, { email }));
      const user = userRepositoryService.findByEmail(email);
      expect(user.email).toBe(email);
    });

    it('should not find user with not exists email', async () => {
      const user = userRepositoryService.findByEmail(email);
      expect(user).toBe(undefined);
    });
  });
});
