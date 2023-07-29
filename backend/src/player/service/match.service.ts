import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity } from '../entities/match.entity';

interface toReturn {
    winnerId: number,
    winnerName: string,
    loserId: number,
    loserName: string,
    winnerScore: number,
    loserScore: number,
    date: Date,
    mode: number
  }

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

  async getStats(id: number): Promise<{rank: number, wins: number, losses: number}> {
    let allUsersStats = await this.matchRepo.query(`
      Select
       COALESCE(t1.user_id, t2.user_id) as user_id,
       COALESCE(t1.loses, 0) as loses,
       COALESCE(t2.wins, 0) as wins,
       COALESCE(t2.wins, 0) + COALESCE(t1.loses, 0) as all_m,
       COALESCE(t2.wins, 0) / (COALESCE(t2.wins, 0) + COALESCE(t1.loses, 0)) as wins_to_all
        from (Select "loserId"  as user_id, count (distinct match_entity.id) as loses
        from match_entity
        group by "loserId") as t1
        full join
        (Select "winnerId" as user_id, count (distinct id) as wins
        from match_entity
        group by "winnerId") as t2
        on t1.user_id = t2.user_id
        ORDER BY wins_to_all, wins, all_m desc
    `)
    for (let i = 0; i < allUsersStats.length; i++) {
      if (id == allUsersStats[i].user_id) {
        return ({rank: i + 1, wins: allUsersStats[i].wins, losses: allUsersStats[i].losses});
      }
    }
    return ({rank: allUsersStats.length + 1, wins: 0, losses: 0});
  }

  async getMatchHistory(id: number): Promise<toReturn[]> {
    const matches: MatchEntity[] = await this.matchRepo.find({
      where: [
        { loser: {
          id: id
        }},
        {winner: {
          id: id
        }}
      ]})
    matches[0].loser
    let result: toReturn[] = [];
    for (let i = matches.length - 1; i >= 0; i--) {
      const tmp: toReturn = {
        winnerId: matches[i].winner.id,
        winnerName: matches[i].winner.name,
        loserId: matches[i].loser.id,
        loserName: matches[i].loser.name,
        winnerScore: matches[i].score[0] > matches[i].score[1] ? matches[i].score[0] : matches[i].score[1],
        loserScore: matches[i].score[0] < matches[i].score[1] ? matches[i].score[0] : matches[i].score[1],
        date: matches[i].date,
        mode: matches[i].mode
      }
      result.push(tmp);
    }
    return (result);
  }
}
