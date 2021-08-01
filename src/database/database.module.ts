import { Module } from '@nestjs/common';
import { UserRepositoryService } from './service/user-repository.service';

@Module({
  providers: [UserRepositoryService],
  exports: [UserRepositoryService],
})
export class DatabaseModule {}
