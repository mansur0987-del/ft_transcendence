import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationStatus } from "../enums/applicationStatus.enum";
import { PlayerEntity } from "./player.entity";

@Entity('player_application')
export class PlayerApplicationEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ nullable: true })
	sendPlayerId: number;

	@Column({ nullable: true })
	getPlayerId: number;

	@Column({default: ApplicationStatus.APPLICATION})
	status: number

	@ManyToOne(() => PlayerEntity, (player: PlayerEntity) => player.id)
	sendPlayer: PlayerEntity;

	@ManyToOne(() => PlayerEntity, (player: PlayerEntity) => player.id)
	getPlayer: 	PlayerEntity;
;
}
