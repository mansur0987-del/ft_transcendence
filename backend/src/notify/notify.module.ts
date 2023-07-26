import { Module } from '@nestjs/common';
import { PlayerModule } from "src/player/player.module";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from '@nestjs/typeorm';
import { notifyGateway } from "./notify.gateway";
import { Notify } from "./notify.entity";
import { NotifyService } from "./notify.services";
import { NotifyConroller } from "./notify.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Notify]), PlayerModule, JwtModule],
	controllers: [NotifyConroller],
	providers: [NotifyService, NotifyConroller, notifyGateway]
})
export class NotifyModule { }