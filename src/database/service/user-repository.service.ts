import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user';

@Injectable()
export class UserRepositoryService {
  private readonly logger = new Logger(UserRepositoryService.name);
  constructor() {
    // 初始化用户数据 以email为key,user为value的对象
    global.users = {};
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户信息
   */
  findByEmail(email: string): User {
    return global.users[email];
  }

  /**
   * 创建用户
   * @param user 用户
   * @returns 用户信息
   */
  create(user: User): User {
    global.users[user.email] = user;
    return global.users[user.email];
  }
}
