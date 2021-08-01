import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [MailModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
