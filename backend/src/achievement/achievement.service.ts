import { HttpException, Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
  ) {}

  async findAll() : Promise<Achievement[]>{
    return await this.achievementRepository.find();
    //return `This action returns all achievement`;
  }

  async findOne(id: number) : Promise<Achievement>{ {
    const achievement = await this.achievementRepository.findOne({where: {id: id}});
    if (!achievement)
      throw new HttpException(`Achievement with id ${id} not found`, 404);
    else 
      return achievement;
  }
}
  create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
    return this.achievementRepository.save(createAchievementDto);
  }
  
  update(id: number, UpdateAchievementDto: UpdateAchievementDto) {
    return `This action updates a #${id} achievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} achievement`;
  }
}
