import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity } from '../entities/match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity) private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  /* CREATE */

  async create(obj: MatchEntity): Promise<MatchEntity> {
    let match: MatchEntity = this.matchRepo.create({
      date: new Date(),
      ...obj,
    } as MatchEntity);

    try {
      this.matchRepo.save(match);
    } catch (error) {
      throw new HttpException(error.messgae, HttpStatus.BAD_REQUEST);
    }

    return match;
  }

  /* UPDATE */

  async update(id: number, newMatch: MatchEntity): Promise<MatchEntity> {
    if (!newMatch)
      throw new HttpException('Body is null', HttpStatus.NOT_FOUND);
    await this.matchRepo.findOne({ where: { id } });

    try {
      newMatch.id = id;
      await this.matchRepo.update(id, newMatch);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    delete newMatch.id;
    return newMatch;
  }

  /* DELETE */

  async delete(id: number): Promise<void> {
    try {
      await this.matchRepo.delete(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getStats(id: number): Promise<{rank: number, wins: number, loses: number}> {
    let allUsersStats = await this.matchRepo.query(`
      Select
	      COALESCE(t1.user_id, t2.user_id),
	      COALESCE(t1.loses, 0) as loses,
	      COALESCE(t2.wins, 0) as wins,
	      COALESCE(t2.wins, 0) / (COALESCE(t2.wins, 0) + COALESCE(t2.loses, 0)) as wins_to_all
        from (Select loser as user_id, count (distinct id) as loses
        from match_entity
        group by loser) as t1
        full join where t1.user_id == t2.user_id
        (Select winner as user_id, count (distinct id) as wins
        from match_entity
        group by winner) as t2
    `)
    console.log(allUsersStats);
    return ({rank: 0, wins: 0, loses: 0});
  }
}
