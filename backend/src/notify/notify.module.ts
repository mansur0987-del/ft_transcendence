import { Module } from '@nestjs/common';
import { PlayerModule } from "src/player/player.module";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from '@nestjs/typeorm';
import { notifyGateway } from "./notify.gateway";
import { Notify } from "./notify.entity";
import { NotifyService } from "./notify.services";
import { NotifyConroller } from "./notify.controller";
import { RoomService } from "src/game/services/room.service";

@Module({
	imports: [TypeOrmModule.forFeature([Notify]), PlayerModule, JwtModule],
	controllers: [NotifyConroller],
	providers: [NotifyService, NotifyConroller, notifyGateway, RoomService]
})
export class NotifyModule { }