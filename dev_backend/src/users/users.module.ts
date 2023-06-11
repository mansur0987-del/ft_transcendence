import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users_entity } from './users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users_entity])
    ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
