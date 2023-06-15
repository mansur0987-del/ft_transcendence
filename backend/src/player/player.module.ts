import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './service/player.service';
import { ControllerController } from './controller/controller.controller';
import { PlayerEntity } from './entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PlayerEntity,
  ])],
  providers: [PlayerService],
  controllers: [ControllerController],
  exports: [PlayerService],
})
export class PlayerModule {}
