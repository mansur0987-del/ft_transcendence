import { Module } from '@nestjs/common';
import { PlayerModule } from "src/player/player.module";
import { JwtModule } from "@nestjs/jwt";
import { notifyGateway } from "./notify.gateway";

@Module({
	imports: [PlayerModule, JwtModule],
	providers: [notifyGateway]
})
export class NotifyModule { }