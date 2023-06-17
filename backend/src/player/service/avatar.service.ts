import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AvatarEntity from '../entities/avatar.entity';


@Injectable()
class AvatarService {
  constructor(
    @InjectRepository(AvatarEntity)
    private avatarRepository: Repository<AvatarEntity>,
  ) {}

  async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
    const newFile = await this.avatarRepository.create({
      filename,
      data: dataBuffer
    })
    await this.avatarRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.avatarRepository.findOneBy({id: fileId});
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }
}

export default AvatarService;
